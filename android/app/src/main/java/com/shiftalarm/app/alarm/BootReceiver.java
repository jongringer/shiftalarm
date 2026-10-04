package com.shiftalarm.app.alarm;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import java.util.List;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) ||
            "android.intent.action.QUICKBOOT_POWERON".equals(intent.getAction())) {

            Log.d(TAG, "Device reboot completed. Restoring future shift alarms...");
            ShiftAlarmScheduler scheduler = new ShiftAlarmScheduler(context);
            List<ShiftAlarmItem> allAlarms = scheduler.getAllSavedAlarms();
            long now = System.currentTimeMillis();

            for (ShiftAlarmItem item : allAlarms) {
                if (item.getTriggerTimeMillis() <= now) {
                    // 이미 지난 알람은 재등록하지 않고 영구 삭제
                    scheduler.removeAlarmFromPrefs(item.getId());
                    Log.d(TAG, "Removed expired past alarm on boot: ID=" + item.getId() + ", " + item.getDateText());
                } else {
                    // 미래 알람만 다시 AlarmManager에 등록
                    scheduler.schedule(item);
                    Log.d(TAG, "Restored future alarm: ID=" + item.getId() + ", " + item.getDateText() + " [" + item.getShiftType() + "]");
                }
            }

            // 갤럭시 시계 전날 등록 릴레이도 재예약
            ClockSyncManager.rescheduleAll(context);
        }
    }
}
