package com.shiftalarm.app.alarm;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ShiftAlarmScheduler {
    private static final String TAG = "ShiftAlarmScheduler";
    private static final String PREF_NAME = "shift_alarm_prefs";
    private final Context context;
    private final AlarmManager alarmManager;

    public ShiftAlarmScheduler(Context context) {
        this.context = context.getApplicationContext();
        this.alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    }

    public boolean schedule(ShiftAlarmItem item) {
        // 정확한 알람 설정 가능 여부 확인 (Android 12+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!alarmManager.canScheduleExactAlarms()) {
                try {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                } catch (Exception e) {
                    Log.e(TAG, "Failed to open exact alarm settings", e);
                }
                return false;
            }
        }

        long triggerTime = item.getTriggerTimeMillis();
        long now = System.currentTimeMillis();

        // 이미 지난 시간은 등록하지 않음
        if (triggerTime <= now) {
            Log.w(TAG, "Cannot schedule past time: " + item.getDateText());
            return false;
        }

        // 1. SharedPreferences에 알람 영구 저장 (재부팅 복원용)
        saveAlarmToPrefs(item);

        // 2. AlarmReceiver 트리거 인텐트 생성
        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.putExtra("ALARM_ID", item.getId());
        intent.putExtra("DATE_TEXT", item.getDateText());
        intent.putExtra("SHIFT_TYPE", item.getShiftType());

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            item.getId(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // 3. Doze(절전) 모드를 관통하는 정밀 알람 설정
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerTime,
                pendingIntent
            );
        } else {
            alarmManager.setExact(
                AlarmManager.RTC_WAKEUP,
                triggerTime,
                pendingIntent
            );
        }

        Log.d(TAG, "Shift alarm scheduled successfully for " + item.getDateText() + " " + item.getHour() + ":" + item.getMinute() + " (" + item.getShiftType() + ")");
        return true;
    }

    public void cancel(int alarmId) {
        // 1. SharedPreferences에서 삭제
        removeAlarmFromPrefs(alarmId);

        // 2. AlarmManager에서 취소
        Intent intent = new Intent(context, AlarmReceiver.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId,
            intent,
            PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
        );
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent);
            pendingIntent.cancel();
            Log.d(TAG, "Alarm cancelled: " + alarmId);
        }
    }

    private void saveAlarmToPrefs(ShiftAlarmItem item) {
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        // 저장 포맷: year|month|day|hour|minute|shiftType
        String value = item.getYear() + "|" + item.getMonth() + "|" + item.getDay() + "|" +
                       item.getHour() + "|" + item.getMinute() + "|" + item.getShiftType();
        prefs.edit().putString("alarm_" + item.getId(), value).apply();
    }

    public void removeAlarmFromPrefs(int alarmId) {
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        prefs.edit().remove("alarm_" + alarmId).apply();
    }

    public List<ShiftAlarmItem> getAllSavedAlarms() {
        List<ShiftAlarmItem> list = new ArrayList<>();
        SharedPreferences prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        Map<String, ?> all = prefs.getAll();
        long now = System.currentTimeMillis();
        for (Map.Entry<String, ?> entry : all.entrySet()) {
            if (entry.getKey().startsWith("alarm_") && entry.getValue() instanceof String) {
                try {
                    int id = Integer.parseInt(entry.getKey().replace("alarm_", ""));
                    String[] parts = ((String) entry.getValue()).split("\\|");
                    if (parts.length >= 6) {
                        int y = Integer.parseInt(parts[0]);
                        int m = Integer.parseInt(parts[1]);
                        int d = Integer.parseInt(parts[2]);
                        int h = Integer.parseInt(parts[3]);
                        int min = Integer.parseInt(parts[4]);
                        String shiftType = parts[5];
                        ShiftAlarmItem item = new ShiftAlarmItem(id, y, m, d, h, min, shiftType);
                        if (item.getTriggerTimeMillis() <= now) {
                            removeAlarmFromPrefs(id); // 지정 날짜/시각 경과 시 자동 삭제
                        } else {
                            list.add(item);
                        }
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Failed to parse saved alarm: " + entry.getKey(), e);
                }
            }
        }
        return list;
    }
}
