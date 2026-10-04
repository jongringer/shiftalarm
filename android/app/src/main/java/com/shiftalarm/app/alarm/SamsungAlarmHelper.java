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
 * 삼성 갤럭시 시계(com.sec.android.app.clockpackage)의 단발성 날짜 지정 알람 및 요일 반복 알람 화면 호출을 담당합니다.
 */
public class SamsungAlarmHelper {
    private static final String TAG = "SamsungAlarmHelper";

    // 삼성 기본 시계 앱 패키지명
    public static final String SAMSUNG_CLOCK_PACKAGE = "com.sec.android.app.clockpackage";

    /**
     * 갤럭시 시계의 알람 생성/편집 화면을 열어주는 함수 (단발성 날짜 지정 모드)
     * 
     * @param context 호출하는 Context
     * @param hour 시 (0 ~ 23)
     * @param minute 분 (0 ~ 59)
     * @param label 알람 라벨 이름 (예: "[10/20] 일근 근무알람")
     */
    public static void openAlarmEditor(Context context, int hour, int minute, String label) {
        openAlarmEditor(context, hour, minute, label, null);
    }

    /**
     * 갤럭시 시계의 알람 생성/편집 화면을 열어주는 함수
     * 
     * @param context 호출하는 Context
     * @param hour 시 (0 ~ 23)
     * @param minute 분 (0 ~ 59)
     * @param label 알람 라벨 이름 (예: "[10/20] 일근 근무알람")
     * @param dayOfWeek 요일 반복이 필요한 경우 (1=일, 2=월 ... 7=토), 단발성 특정 날짜 알람은 null 또는 0 전달
     */
    public static void openAlarmEditor(Context context, int hour, int minute, String label, Integer dayOfWeek) {
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

                // 3. 요일 반복 설정 (dayOfWeek가 1~7로 명시된 경우만 추가, 단발성/날짜지정 모드는 절대 추가 안함)
                if (dayOfWeek != null && dayOfWeek >= 1 && dayOfWeek <= 7) {
                    ArrayList<Integer> days = new ArrayList<>();
                    days.add(dayOfWeek);
                    intent.putExtra(AlarmClock.EXTRA_DAYS, days);
                }

                // 4. UI 스킵 방지 (달력 아이콘을 눌러 날짜를 선택할 수 있도록 화면 직접 오픈)
                intent.putExtra(AlarmClock.EXTRA_SKIP_UI, false);

                // 5. 삼성 갤럭시 시계 패키지 타겟팅
                intent.setPackage(SAMSUNG_CLOCK_PACKAGE);

                // 6. 새 태스크 플래그 추가 (어디서 호출하든 안전하게 화면 전환)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                // 앱 실행 검증 및 폴백 처리
                if (intent.resolveActivity(context.getPackageManager()) != null) {
                    context.startActivity(intent);
                } else {
                    // 삼성 시계 앱이 없을 경우 기본 안드로이드 시계 앱으로 대체 호출
                    intent.setPackage(null);
                    if (intent.resolveActivity(context.getPackageManager()) != null) {
                        context.startActivity(intent);
                    } else {
                        Toast.makeText(context, "시계 앱을 실행할 수 없습니다.", Toast.LENGTH_SHORT).show();
                        return;
                    }
                }
                
                Log.d(TAG, "Opened Samsung alarm editor: " + hour + ":" + minute + ", label=" + label + ", dayOfWeek=" + dayOfWeek);
            } catch (Exception e) {
                Log.e(TAG, "Error opening Samsung alarm editor", e);
                Toast.makeText(context, "시계 앱을 실행할 수 없습니다.", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
