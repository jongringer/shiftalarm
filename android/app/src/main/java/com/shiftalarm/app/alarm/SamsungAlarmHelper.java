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

    // 삼성 기본 시계 앱 패키지명
    public static final String SAMSUNG_CLOCK_PACKAGE = "com.sec.android.app.clockpackage";

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
