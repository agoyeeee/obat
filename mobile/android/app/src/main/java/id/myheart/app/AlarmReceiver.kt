package id.myheart.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import java.util.Calendar

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        // Ignore device reboot broadcast to prevent false alarms on startup
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            return
        }

        val isTest = intent.getBooleanExtra(FloatingAlarmService.EXTRA_IS_TEST, false)

        // 1. Reschedule for the next day (+24 hours) for real recurring medicine alarms
        if (!isTest) {
            try {
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
                val requestCode = intent.getIntExtra("extra_request_code", 0)
                if (alarmManager != null && requestCode != 0) {
                    val nextCalendar = Calendar.getInstance().apply {
                        add(Calendar.DAY_OF_YEAR, 1)
                    }
                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        requestCode,
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            nextCalendar.timeInMillis,
                            pendingIntent
                        )
                    } else {
                        alarmManager.setExact(
                            AlarmManager.RTC_WAKEUP,
                            nextCalendar.timeInMillis,
                            pendingIntent
                        )
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // 2. Wake up screen if locked/sleeping
        try {
            val pm = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
            @Suppress("DEPRECATION")
            val wakeLock = pm?.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK or
                    PowerManager.ACQUIRE_CAUSES_WAKEUP or
                    PowerManager.ON_AFTER_RELEASE,
                "MyHeart:AlarmWakeLock"
            )
            wakeLock?.acquire(10000)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 3. Start FloatingAlarmService (displays floating card + sound + vibration)
        val serviceIntent = Intent(context, FloatingAlarmService::class.java).apply {
            putExtra(FloatingAlarmService.EXTRA_TITLE, intent.getStringExtra(FloatingAlarmService.EXTRA_TITLE))
            putExtra(FloatingAlarmService.EXTRA_MEDICINE_NAME, intent.getStringExtra(FloatingAlarmService.EXTRA_MEDICINE_NAME))
            putExtra(FloatingAlarmService.EXTRA_DOSE, intent.getStringExtra(FloatingAlarmService.EXTRA_DOSE))
            putExtra(FloatingAlarmService.EXTRA_TIME, intent.getStringExtra(FloatingAlarmService.EXTRA_TIME))
            putExtra(FloatingAlarmService.EXTRA_REMINDER_ID, intent.getStringExtra(FloatingAlarmService.EXTRA_REMINDER_ID))
            putExtra(FloatingAlarmService.EXTRA_IS_TEST, isTest)
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
