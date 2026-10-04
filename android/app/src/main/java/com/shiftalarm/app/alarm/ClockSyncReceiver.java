package com.shiftalarm.app.alarm;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.shiftalarm.app.MainActivity;

/**
 * 전날 릴레이 수신 → "갤럭시 시계에 등록" 알림 표시
 * (안드로이드 10+ 는 백그라운드에서 다른 앱 화면을 띄울 수 없으므로, 알림 탭 → 앱 열림 → 자동 등록 방식)
 */
public class ClockSyncReceiver extends BroadcastReceiver {
    private static final String TAG = "ClockSyncReceiver";
    public static final String CHANNEL_ID = "CLOCK_SYNC_CHANNEL";
    private static final int NOTIFICATION_OFFSET = 0x20000000;

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!ClockSyncManager.ACTION_RELAY.equals(intent.getAction())) return;
        int alarmId = intent.getIntExtra("ALARM_ID", -1);
        ShiftAlarmItem item = ClockSyncManager.getPending(context, alarmId);
        if (item == null) {
            Log.d(TAG, "Relay received but nothing pending (already synced or cancelled): " + alarmId);
            return;
        }
        if (item.getTriggerTimeMillis() <= System.currentTimeMillis()) {
            ClockSyncManager.cancel(context, alarmId);
            return;
        }

        createChannel(context);

        Intent openApp = new Intent(context, MainActivity.class);
        openApp.setAction(ClockSyncManager.ACTION_SYNC_FROM_NOTIFICATION);
        openApp.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context, alarmId ^ NOTIFICATION_OFFSET, openApp,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String time = String.format("%02d:%02d", item.getHour(), item.getMinute());
        String title = "📅 " + item.getMonth() + "/" + item.getDay() + "(" + ClockSyncManager.dayName(item) + ") "
            + item.getShiftType() + " " + time + " 알람";
        String text = "탭하면 갤럭시 시계에 정확한 날짜로 등록됩니다.";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setContentIntent(contentIntent)
            .addAction(android.R.drawable.ic_lock_idle_alarm, "시계에 등록", contentIntent)
            .setAutoCancel(true);

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            try {
                nm.notify(alarmId ^ NOTIFICATION_OFFSET, builder.build());
            } catch (SecurityException e) {
                Log.e(TAG, "Notification permission missing", e);
            }
        }
    }

    private void createChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID, "갤럭시 시계 등록 안내", NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("근무 전날 갤럭시 시계에 정확한 날짜로 알람을 등록하도록 안내합니다.");
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.createNotificationChannel(channel);
        }
    }
}
