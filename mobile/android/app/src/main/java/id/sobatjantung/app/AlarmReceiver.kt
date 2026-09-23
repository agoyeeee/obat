package id.sobatjantung.app

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
        // Setelah device reboot atau app update, jadwalkan ulang semua alarm dari SharedPreferences
        if (intent.action == Intent.ACTION_BOOT_COMPLETED ||
            intent.action == Intent.ACTION_MY_PACKAGE_REPLACED
        ) {
            rescheduleAllAlarmsFromStorage(context)
            return
        }

        val isTest = intent.getBooleanExtra(FloatingAlarmService.EXTRA_IS_TEST, false)

        // 1. Reschedule for the next day (+24 hours) for real recurring medicine alarms
        if (!isTest) {
            try {
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
                val requestCode = intent.getIntExtra("extra_request_code", 0)
                val timeStr = intent.getStringExtra(FloatingAlarmService.EXTRA_TIME)
                if (alarmManager != null && requestCode != 0) {
                    val parts = timeStr?.split(":")
                    val hour = parts?.getOrNull(0)?.toIntOrNull()
                    val minute = parts?.getOrNull(1)?.toIntOrNull()

                    val nextCalendar = Calendar.getInstance().apply {
                        if (hour != null && minute != null) {
                            set(Calendar.HOUR_OF_DAY, hour)
                            set(Calendar.MINUTE, minute)
                            set(Calendar.SECOND, 0)
                            set(Calendar.MILLISECOND, 0)
                        }
                        add(Calendar.DAY_OF_YEAR, 1)
                    }
                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        requestCode,
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        val showIntent = Intent(context, MainActivity::class.java)
                        val showPendingIntent = PendingIntent.getActivity(
                            context,
                            requestCode,
                            showIntent,
                            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                        )
                        alarmManager.setAlarmClock(
                            AlarmManager.AlarmClockInfo(nextCalendar.timeInMillis, showPendingIntent),
                            pendingIntent
                        )
                    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
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
                "SobatJantung:AlarmWakeLock"
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

    /**
     * Membaca semua alarm yang tersimpan di SharedPreferences dan
     * menjadwalkan ulang masing-masing ke AlarmManager.
     * Dipanggil setelah BOOT_COMPLETED atau MY_PACKAGE_REPLACED.
     */
    private fun rescheduleAllAlarmsFromStorage(context: Context) {
        try {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
                ?: return

            val alarms = AlarmStorage.getAllAlarms(context)
            for (alarm in alarms) {
                // Skip test alarms
                if (alarm.isTest) continue

                val calendar = Calendar.getInstance().apply {
                    set(Calendar.HOUR_OF_DAY, alarm.hour)
                    set(Calendar.MINUTE, alarm.minute)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)
                    // Jika waktu sudah lewat hari ini, jadwalkan untuk besok
                    if (before(Calendar.getInstance())) {
                        add(Calendar.DAY_OF_YEAR, 1)
                    }
                }

                val alarmIntent = Intent(context, AlarmReceiver::class.java).apply {
                    putExtra("extra_request_code", alarm.id)
                    putExtra(FloatingAlarmService.EXTRA_TITLE, alarm.title)
                    putExtra(FloatingAlarmService.EXTRA_MEDICINE_NAME, alarm.medicineName)
                    putExtra(FloatingAlarmService.EXTRA_DOSE, alarm.dose)
                    putExtra(FloatingAlarmService.EXTRA_TIME, String.format("%02d:%02d", alarm.hour, alarm.minute))
                    putExtra(FloatingAlarmService.EXTRA_REMINDER_ID, alarm.reminderId)
                    putExtra(FloatingAlarmService.EXTRA_IS_TEST, false)
                }

                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    alarm.id,
                    alarmIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    val showIntent = Intent(context, MainActivity::class.java)
                    val showPendingIntent = PendingIntent.getActivity(
                        context,
                        alarm.id,
                        showIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    alarmManager.setAlarmClock(
                        AlarmManager.AlarmClockInfo(calendar.timeInMillis, showPendingIntent),
                        pendingIntent
                    )
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        calendar.timeInMillis,
                        pendingIntent
                    )
                } else {
                    alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        calendar.timeInMillis,
                        pendingIntent
                    )
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
