package com.shiftalarm.app.alarm;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import java.util.Calendar;
import java.util.Map;

/**
 * 갤럭시 시계 앱 "날짜 정확" 동기화 매니저
 *
 * 문제: ACTION_SET_ALARM 은 날짜를 받지 않으므로, 시계 앱은 항상 "다음에 돌아오는 시:분"(오늘/내일)으로 등록한다.
 *       → 10/6, 10/8, 10/9 알람을 오늘(10/4) 보내면 전부 10/5(내일)로 등록되는 버그 발생.
 *
 * 해결: 시계 앱의 "다음 시:분" == 목표 날짜가 되는 순간은 [목표시각 - 24시간, 목표시각) 구간뿐이다.
 *       1) 목표가 24시간 이내면 → 즉시 시계 앱에 등록 (날짜가 자동으로 정확히 맞음)
 *       2) 24시간보다 멀면 → 대기열에 저장하고, 전날(구간 진입 후) 릴레이 알람을 예약
 *          - 릴레이 시점에 알림 표시 → 탭하면 앱이 열리며 시계 앱에 자동 등록
 *          - 구간 안에서 사용자가 앱을 열기만 해도 자동 등록 (MainActivity.onResume)
 *       ※ 앱 자체 정밀 알람(ShiftAlarmScheduler)은 날짜와 무관하게 항상 정확한 날짜에 울립니다.
 */
public class ClockSyncManager {
    private static final String TAG = "ClockSyncManager";
    private static final String PREF_NAME = "clock_sync_prefs";
    private static final String KEY_PREFIX = "pending_";
    public static final String ACTION_RELAY = "com.shiftalarm.app.CLOCK_SYNC_RELAY";
    public static final String ACTION_SYNC_FROM_NOTIFICATION = "com.shiftalarm.app.SYNC_CLOCK";
    private static final long DAY_MS = 24L * 60 * 60 * 1000;
    private static final long SAFETY_MS = 60L * 1000; // 경계 오차 방지 1분
    private static final int RELAY_REQUEST_OFFSET = 0x10000000;
    private static final String[] DAY_NAMES = {"일", "월", "화", "수", "목", "금", "토"};

    private ClockSyncManager() {}

    /** 결과 코드 */
    public static final int RESULT_REGISTERED_NOW = 1;
    public static final int RESULT_QUEUED = 2;          // (구버전 호환용, 더 이상 사용 안 함)
    public static final int RESULT_EDITOR_OPENED = 3;
    public static final int RESULT_EXPIRED = 0;

    /**
     * 알람 등록 요청 (사용자 제안 반영: openSpecificDateAlarm 호출)
     */
    public static int request(Context context, ShiftAlarmItem item) {
        long now = System.currentTimeMillis();
        long target = item.getTriggerTimeMillis();
        if (target <= now) return RESULT_EXPIRED;

        // 이전 버전에서 대기열에 들어간 동일 알람이 있으면 정리 (중복 등록 방지)
        cancel(context, item.getId());

        // 삼성 시계 앱 특정 날짜 알람 편집 화면 열기 (월/일/시/분/라벨 및 날짜 파라미터 매핑)
        SamsungAlarmHelper.openSpecificDateAlarm(
            context,
            item.getYear(),
            item.getMonth(),
            item.getDay(),
            item.getHour(),
            item.getMinute(),
            buildLabel(item)
        );
        Log.d(TAG, "Opened Galaxy clock specific date editor: " + item.getDateText());
        return RESULT_EDITOR_OPENED;
    }

    /** 대기열 중 24시간 이내로 들어온 알람을 시계 앱에 등록. 등록 건수 반환 (앱이 전면에 있을 때 호출) */
    public static int syncDue(Context context) {
        long now = System.currentTimeMillis();
        int count = 0;
        SharedPreferences prefs = prefs(context);
        for (Map.Entry<String, ?> entry : prefs.getAll().entrySet()) {
            ShiftAlarmItem item = parse(entry.getKey(), entry.getValue());
            if (item == null) continue;
            long target = item.getTriggerTimeMillis();
            if (target <= now) {
                removePending(context, item.getId()); // 지난 알람 자동 삭제
            } else if (isInClockWindow(target, now)) {
                removePending(context, item.getId()); // 중복 등록 방지를 위해 먼저 제거
                sendToClock(context, item);
                count++;
            }
        }
        return count;
    }

    /** 알람 취소 시 대기열/릴레이도 함께 제거 */
    public static void cancel(Context context, int alarmId) {
        removePending(context, alarmId);
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pi = PendingIntent.getBroadcast(
            context, alarmId ^ RELAY_REQUEST_OFFSET, relayIntent(context, alarmId),
            PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
        if (am != null && pi != null) {
            am.cancel(pi);
            pi.cancel();
        }
    }

    /** 재부팅 후 릴레이 재예약 */
    public static void rescheduleAll(Context context) {
        long now = System.currentTimeMillis();
        for (Map.Entry<String, ?> entry : prefs(context).getAll().entrySet()) {
            ShiftAlarmItem item = parse(entry.getKey(), entry.getValue());
            if (item == null) continue;
            if (item.getTriggerTimeMillis() <= now) {
                removePending(context, item.getId());
            } else {
                scheduleRelay(context, item, now);
            }
        }
    }

    /** 대기열에서 특정 알람 조회 (릴레이 수신 시 사용) */
    public static ShiftAlarmItem getPending(Context context, int alarmId) {
        String key = KEY_PREFIX + alarmId;
        return parse(key, prefs(context).getString(key, null));
    }

    /** 시계 앱 라벨: [10/8(목)] 일근 근무알람 */
    public static String buildLabel(ShiftAlarmItem item) {
        return String.format("[%d/%d(%s)] %s 근무알람",
            item.getMonth(), item.getDay(), dayName(item), item.getShiftType());
    }

    public static String dayName(ShiftAlarmItem item) {
        Calendar cal = Calendar.getInstance();
        cal.setTimeInMillis(item.getTriggerTimeMillis());
        return DAY_NAMES[cal.get(Calendar.DAY_OF_WEEK) - 1];
    }

    // ───────────────────────── 내부 구현 ─────────────────────────

    /** 시계 앱의 "다음 시:분"이 목표 날짜와 일치하는 구간인지 */
    private static boolean isInClockWindow(long target, long now) {
        long diff = target - now;
        return diff > 0 && diff < DAY_MS - SAFETY_MS;
    }

    private static void sendToClock(Context context, ShiftAlarmItem item) {
        // 날짜가 이미 정확하므로 화면 없이 즉시 저장 (skipUi=true)
        SamsungAlarmHelper.openAlarmEditor(context, item.getHour(), item.getMinute(), buildLabel(item), null, true);
        Log.d(TAG, "Registered to Galaxy clock with correct date: " + item.getDateText() + " " + item.getHour() + ":" + item.getMinute());
    }

    /**
     * 릴레이 시각 = max(목표-24h+1분, 전날 21:00)
     *  - 새벽 알람(05:20)이면 전날 새벽 05:21 대신 전날 밤 21:00 에 알림 → 수면 방해 방지
     */
    private static void scheduleRelay(Context context, ShiftAlarmItem item, long now) {
        long target = item.getTriggerTimeMillis();
        long windowStart = target - DAY_MS + SAFETY_MS * 2;

        Calendar prevEvening = Calendar.getInstance();
        prevEvening.setTimeInMillis(target);
        prevEvening.add(Calendar.DAY_OF_MONTH, -1);
        prevEvening.set(Calendar.HOUR_OF_DAY, 21);
        prevEvening.set(Calendar.MINUTE, 0);
        prevEvening.set(Calendar.SECOND, 0);
        prevEvening.set(Calendar.MILLISECOND, 0);

        long relayAt = Math.max(windowStart, prevEvening.getTimeInMillis());
        if (relayAt >= target) relayAt = windowStart;
        if (relayAt <= now) relayAt = now + 5000;

        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        PendingIntent pi = PendingIntent.getBroadcast(
            context, item.getId() ^ RELAY_REQUEST_OFFSET, relayIntent(context, item.getId()),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        try {
            boolean canExact = true;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                canExact = am.canScheduleExactAlarms();
            }
            if (canExact && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, relayAt, pi);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, relayAt, pi);
            } else {
                am.set(AlarmManager.RTC_WAKEUP, relayAt, pi);
            }
            Log.d(TAG, "Clock sync relay scheduled for " + item.getDateText() + " at " + relayAt);
        } catch (SecurityException e) {
            Log.e(TAG, "Failed to schedule relay", e);
        }
    }

    private static Intent relayIntent(Context context, int alarmId) {
        Intent intent = new Intent(context, ClockSyncReceiver.class);
        intent.setAction(ACTION_RELAY);
        intent.putExtra("ALARM_ID", alarmId);
        return intent;
    }

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    private static void savePending(Context context, ShiftAlarmItem item) {
        String value = item.getYear() + "|" + item.getMonth() + "|" + item.getDay() + "|" +
                       item.getHour() + "|" + item.getMinute() + "|" + item.getShiftType();
        prefs(context).edit().putString(KEY_PREFIX + item.getId(), value).apply();
    }

    private static void removePending(Context context, int alarmId) {
        prefs(context).edit().remove(KEY_PREFIX + alarmId).apply();
    }

    private static ShiftAlarmItem parse(String key, Object value) {
        if (key == null || !key.startsWith(KEY_PREFIX) || !(value instanceof String)) return null;
        try {
            int id = Integer.parseInt(key.substring(KEY_PREFIX.length()));
            String[] p = ((String) value).split("\\|");
            if (p.length < 6) return null;
            return new ShiftAlarmItem(id,
                Integer.parseInt(p[0]), Integer.parseInt(p[1]), Integer.parseInt(p[2]),
                Integer.parseInt(p[3]), Integer.parseInt(p[4]), p[5]);
        } catch (Exception e) {
            Log.e(TAG, "Failed to parse pending clock sync: " + key, e);
            return null;
        }
    }
}
