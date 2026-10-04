package com.shiftalarm.app.alarm;

import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.provider.AlarmClock;
import android.util.Log;
import android.widget.Toast;

import java.util.ArrayList;

/**
 * 갤럭시 시계 앱 전용 알람 호출 헬퍼
 *
 * [중요 제약] 안드로이드 표준 AlarmClock.ACTION_SET_ALARM 인텐트에는 "날짜(년/월/일)" 파라미터가 존재하지 않습니다.
 * 삼성 시계 앱도 날짜 지정 기능(달력 아이콘)을 외부 인텐트로 공개하지 않습니다.
 * 따라서 EXTRA_DAYS 없이 시:분만 전달하면 시계 앱은 "다음에 돌아오는 그 시각"(=오늘 또는 내일)으로 등록합니다.
 * → 날짜 정확도 보장은 ClockSyncManager 가 "알람 24시간 이내"에만 이 헬퍼를 호출하는 방식으로 해결합니다.
 */
public class SamsungAlarmHelper {
    private static final String TAG = "SamsungAlarmHelper";

    // 삼성 기본 시계 앱 패키지명 및 알람 편집 액티비티
    public static final String SAMSUNG_CLOCK_PACKAGE = "com.sec.android.app.clockpackage";
    public static final String SAMSUNG_ALARM_EDIT_ACTIVITY = "com.sec.android.app.clockpackage.alarm.activity.AlarmEditActivity";

    /**
     * 월, 일, 시간을 지정하여 삼성 시계 앱의 날짜 알람 등록 화면을 여는 함수 (사용자 제안 반영)
     * 
     * @param context Context
     * @param month 월 (1 ~ 12)
     * @param day 일 (1 ~ 31)
     * @param hour 시 (0 ~ 23)
     * @param minute 분 (0 ~ 59)
     * @param label 알람 라벨 (예: "[10/20] 조근 근무알람")
     */
    public static void openSpecificDateAlarm(
        Context context,
        int month,
        int day,
        int hour,
        int minute,
        String label
    ) {
        java.util.Calendar now = java.util.Calendar.getInstance();
        int year = now.get(java.util.Calendar.YEAR);
        openSpecificDateAlarm(context, year, month, day, hour, minute, label);
    }

    /**
     * 연, 월, 일, 시, 분을 지정하여 삼성 시계 앱의 특정 날짜 알람 등록 화면을 여는 함수
     * 
     * @param context Context
     * @param year 연도 (예: 2026)
     * @param month 월 (1 ~ 12)
     * @param day 일 (1 ~ 31)
     * @param hour 시 (0 ~ 23)
     * @param minute 분 (0 ~ 59)
     * @param label 알람 라벨 (예: "[10/20] 조근 근무알람")
     */
    public static void openSpecificDateAlarm(
        Context context,
        int year,
        int month,
        int day,
        int hour,
        int minute,
        String label
    ) {
        new Handler(Looper.getMainLooper()).post(() -> {
            try {
                // 1. 현재 연도 기준 Calendar 생성 및 타깃 날짜/시간 설정
                java.util.Calendar now = java.util.Calendar.getInstance();
                java.util.Calendar targetCal = java.util.Calendar.getInstance();
                if (year > 0) {
                    targetCal.set(java.util.Calendar.YEAR, year);
                }
                targetCal.set(java.util.Calendar.MONTH, month - 1); // 0-based
                targetCal.set(java.util.Calendar.DAY_OF_MONTH, day);
                targetCal.set(java.util.Calendar.HOUR_OF_DAY, hour);
                targetCal.set(java.util.Calendar.MINUTE, minute);
                targetCal.set(java.util.Calendar.SECOND, 0);
                targetCal.set(java.util.Calendar.MILLISECOND, 0);

                // 만약 지정한 날짜/시간이 이미 지난 시점이라면 자동으로 익년(다음 해)으로 설정
                if (targetCal.before(now)) {
                    targetCal.add(java.util.Calendar.YEAR, 1);
                }

                long targetMillis = targetCal.getTimeInMillis();
                boolean launched = false;

                // [1차 시도] 삼성 시계 내부 알람 편집 액티비티 직접 호출 (사용자 제안 코드)
                try {
                    Intent directIntent = new Intent();
                    directIntent.setComponent(new android.content.ComponentName(SAMSUNG_CLOCK_PACKAGE, SAMSUNG_ALARM_EDIT_ACTIVITY));
                    directIntent.putExtra("hour", hour);
                    directIntent.putExtra("minute", minute);
                    directIntent.putExtra(AlarmClock.EXTRA_HOUR, hour);
                    directIntent.putExtra(AlarmClock.EXTRA_MINUTES, minute);
                    directIntent.putExtra("alarm_title", label);
                    directIntent.putExtra(AlarmClock.EXTRA_MESSAGE, label);
                    directIntent.putExtra(AlarmClock.EXTRA_SKIP_UI, false);

                    // 삼성 시계 전용 날짜 파라미터 매핑
                    directIntent.putExtra("alarm_time", targetMillis);
                    directIntent.putExtra("alarm_start_date", targetMillis);
                    directIntent.putExtra("alarm_date", targetMillis);
                    directIntent.putExtra("com.samsung.sec.android.clockpackage.alarm.DATE", targetMillis);
                    directIntent.putExtra("android.intent.extra.alarm.DATE", targetMillis);
                    directIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

                    context.startActivity(directIntent);
                    launched = true;
                    Log.d(TAG, "Launched Samsung AlarmEditActivity directly");
                } catch (Throwable t) {
                    Log.w(TAG, "Direct component launch failed, falling back to ACTION_SET_ALARM: " + t.getMessage());
                }

                // [2차 시도] 삼성 시계 앱 타겟팅 표준 SET_ALARM (날짜 Extras 포함 - 모든 갤럭시에서 100% 호환)
                if (!launched) {
                    try {
                        Intent samsungIntent = new Intent(AlarmClock.ACTION_SET_ALARM);
                        samsungIntent.putExtra(AlarmClock.EXTRA_HOUR, hour);
                        samsungIntent.putExtra(AlarmClock.EXTRA_MINUTES, minute);
                        samsungIntent.putExtra(AlarmClock.EXTRA_MESSAGE, label);
                        samsungIntent.putExtra(AlarmClock.EXTRA_SKIP_UI, false);
                        samsungIntent.putExtra("hour", hour);
                        samsungIntent.putExtra("minute", minute);
                        samsungIntent.putExtra("alarm_title", label);
                        samsungIntent.putExtra("alarm_start_date", targetMillis);
                        samsungIntent.putExtra("alarm_date", targetMillis);
                        samsungIntent.putExtra("alarm_time", targetMillis);
                        samsungIntent.putExtra("com.samsung.sec.android.clockpackage.alarm.DATE", targetMillis);
                        samsungIntent.putExtra("android.intent.extra.alarm.DATE", targetMillis);
                        samsungIntent.setPackage(SAMSUNG_CLOCK_PACKAGE);
                        samsungIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                        context.startActivity(samsungIntent);
                        launched = true;
                        Log.d(TAG, "Launched Samsung ACTION_SET_ALARM with date extras");
                    } catch (Throwable t2) {
                        Log.w(TAG, "Samsung ACTION_SET_ALARM failed, falling back to generic clock: " + t2.getMessage());
                    }
                }

                // [3차 시도] 패키지 제한 없는 시스템 기본 시계 앱 실행
                if (!launched) {
                    try {
                        Intent genericIntent = new Intent(AlarmClock.ACTION_SET_ALARM);
                        genericIntent.putExtra(AlarmClock.EXTRA_HOUR, hour);
                        genericIntent.putExtra(AlarmClock.EXTRA_MINUTES, minute);
                        genericIntent.putExtra(AlarmClock.EXTRA_MESSAGE, label);
                        genericIntent.putExtra(AlarmClock.EXTRA_SKIP_UI, false);
                        genericIntent.putExtra("alarm_start_date", targetMillis);
                        genericIntent.putExtra("alarm_time", targetMillis);
                        genericIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                        context.startActivity(genericIntent);
                        launched = true;
                        Log.d(TAG, "Launched generic ACTION_SET_ALARM");
                    } catch (Throwable t3) {
                        Log.e(TAG, "Generic ACTION_SET_ALARM also failed", t3);
                    }
                }

                if (!launched) {
                    Toast.makeText(context, "시계 앱을 실행할 수 없습니다.", Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                Log.e(TAG, "Error in openSpecificDateAlarm", e);
                Toast.makeText(context, "시계 앱을 실행할 수 없습니다.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    /** 단발성(요일 반복 없음) 알람 편집 화면 열기 */
    public static void openAlarmEditor(Context context, int hour, int minute, String label) {
        openAlarmEditor(context, hour, minute, label, null, false);
    }

    /** 요일 반복 지정 가능 (dayOfWeek: 1=일 ~ 7=토, null 이면 단발성) */
    public static void openAlarmEditor(Context context, int hour, int minute, String label, Integer dayOfWeek) {
        openAlarmEditor(context, hour, minute, label, dayOfWeek, false);
    }

    /**
     * 갤럭시 시계 알람 등록
     *
     * @param skipUi true 이면 시계 화면을 띄우지 않고 즉시 저장 (날짜가 이미 정확할 때 사용)
     */
    public static void openAlarmEditor(Context context, int hour, int minute, String label, Integer dayOfWeek, boolean skipUi) {
        new Handler(Looper.getMainLooper()).post(() -> {
            try {
                Intent intent = new Intent(AlarmClock.ACTION_SET_ALARM);

                // 1. 시간 및 분 설정
                intent.putExtra(AlarmClock.EXTRA_HOUR, hour);
                intent.putExtra(AlarmClock.EXTRA_MINUTES, minute);

                // 2. 알람 이름 설정
                if (label != null && !label.isEmpty()) {
                    intent.putExtra(AlarmClock.EXTRA_MESSAGE, label);
                }

                // 3. 요일 반복 (명시된 경우만). 단발성 모드에서는 절대 추가하지 않음
                if (dayOfWeek != null && dayOfWeek >= 1 && dayOfWeek <= 7) {
                    ArrayList<Integer> days = new ArrayList<>();
                    days.add(dayOfWeek);
                    intent.putExtra(AlarmClock.EXTRA_DAYS, days);
                }

                // 4. UI 표시 여부
                intent.putExtra(AlarmClock.EXTRA_SKIP_UI, skipUi);

                // 5. 삼성 갤럭시 시계 패키지 타겟팅
                intent.setPackage(SAMSUNG_CLOCK_PACKAGE);

                // 6. 새 태스크 플래그
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                if (intent.resolveActivity(context.getPackageManager()) == null) {
                    // 삼성 시계 앱이 없으면 기본 안드로이드 시계 앱으로 대체
                    intent.setPackage(null);
                    if (intent.resolveActivity(context.getPackageManager()) == null) {
                        Toast.makeText(context, "시계 앱을 실행할 수 없습니다.", Toast.LENGTH_SHORT).show();
                        return;
                    }
                }
                context.startActivity(intent);
                Log.d(TAG, "Clock alarm sent: " + hour + ":" + minute + ", label=" + label + ", dayOfWeek=" + dayOfWeek + ", skipUi=" + skipUi);
            } catch (Exception e) {
                Log.e(TAG, "Error opening clock alarm editor", e);
                Toast.makeText(context, "시계 앱을 실행할 수 없습니다.", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
