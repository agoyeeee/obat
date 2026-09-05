package id.myheart.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import java.util.Calendar

class FloatingAlarmModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FloatingAlarmModule"

    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                promise.resolve(Settings.canDrawOverlays(reactContext))
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("ERR_CHECK_OVERLAY", e.message, e)
        }
    }

    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${reactContext.packageName}")
                ).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("ERR_REQUEST_OVERLAY", e.message, e)
        }
    }

    @ReactMethod
    fun showFloatingAlarm(options: ReadableMap, promise: Promise) {
        try {
            val title = if (options.hasKey("title")) options.getString("title") else "Waktunya Minum Obat"
            val medicineName = if (options.hasKey("medicineName")) options.getString("medicineName") else "Obat Anda"
            val dose = if (options.hasKey("dose")) options.getString("dose") else "1 dosis"
            val time = if (options.hasKey("time")) options.getString("time") else ""
            val reminderId = if (options.hasKey("reminderId")) options.getString("reminderId") else null
            val isTest = if (options.hasKey("isTest")) options.getBoolean("isTest") else false

            val serviceIntent = Intent(reactContext, FloatingAlarmService::class.java).apply {
                putExtra(FloatingAlarmService.EXTRA_TITLE, title)
                putExtra(FloatingAlarmService.EXTRA_MEDICINE_NAME, medicineName)
                putExtra(FloatingAlarmService.EXTRA_DOSE, dose)
                putExtra(FloatingAlarmService.EXTRA_TIME, time)
                putExtra(FloatingAlarmService.EXTRA_REMINDER_ID, reminderId)
                putExtra(FloatingAlarmService.EXTRA_IS_TEST, isTest)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent)
            } else {
                reactContext.startService(serviceIntent)
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_SHOW_FLOATING", e.message, e)
        }
    }

    @ReactMethod
    fun dismissFloatingAlarm(promise: Promise) {
        try {
            val stopIntent = Intent(reactContext, FloatingAlarmService::class.java).apply {
                action = FloatingAlarmService.ACTION_STOP
            }
            reactContext.startService(stopIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_DISMISS_FLOATING", e.message, e)
        }
    }

    @ReactMethod
    fun scheduleNativeAlarm(options: ReadableMap, promise: Promise) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            if (alarmManager == null) {
                promise.reject("ERR_NO_ALARM_MGR", "AlarmManager not available")
                return
            }

            val id = if (options.hasKey("id")) options.getInt("id") else (System.currentTimeMillis() % 100000).toInt()
            val hour = if (options.hasKey("hour")) options.getInt("hour") else 8
            val minute = if (options.hasKey("minute")) options.getInt("minute") else 0
            val title = if (options.hasKey("title")) options.getString("title") else "Waktunya Minum Obat"
            val medicineName = if (options.hasKey("medicineName")) options.getString("medicineName") else "Obat Anda"
            val dose = if (options.hasKey("dose")) options.getString("dose") else "1 dosis"
            val reminderId = if (options.hasKey("reminderId")) options.getString("reminderId") else null
            val isTest = if (options.hasKey("isTest")) options.getBoolean("isTest") else false

            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, hour)
                set(Calendar.MINUTE, minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
                if (before(Calendar.getInstance())) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            val intent = Intent(reactContext, AlarmReceiver::class.java).apply {
                putExtra("extra_request_code", id)
                putExtra(FloatingAlarmService.EXTRA_TITLE, title)
                putExtra(FloatingAlarmService.EXTRA_MEDICINE_NAME, medicineName)
                putExtra(FloatingAlarmService.EXTRA_DOSE, dose)
                putExtra(FloatingAlarmService.EXTRA_TIME, String.format("%02d:%02d", hour, minute))
                putExtra(FloatingAlarmService.EXTRA_REMINDER_ID, reminderId)
                putExtra(FloatingAlarmService.EXTRA_IS_TEST, isTest)
            }

            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                id,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
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

            promise.resolve(id)
        } catch (e: Exception) {
            promise.reject("ERR_SCHEDULE_ALARM", e.message, e)
        }
    }

    @ReactMethod
    fun cancelNativeAlarm(id: Int, promise: Promise) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            val intent = Intent(reactContext, AlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                id,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            alarmManager?.cancel(pendingIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_CANCEL_ALARM", e.message, e)
        }
    }

    @ReactMethod
    fun triggerTestFloating(delaySeconds: Int, options: ReadableMap?, promise: Promise) {
        try {
            val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
            if (alarmManager == null) {
                promise.reject("ERR_NO_ALARM_MGR", "AlarmManager not available")
                return
            }

            val title = if (options != null && options.hasKey("title")) options.getString("title") else "[Uji Coba] Waktunya Minum Obat"
            val medicineName = if (options != null && options.hasKey("medicineName")) options.getString("medicineName") else "Amlodipine (Uji Coba)"
            val dose = if (options != null && options.hasKey("dose")) options.getString("dose") else "1 tablet (5 mg)"
            val reminderId = if (options != null && options.hasKey("reminderId")) options.getString("reminderId") else "test_debug_id"

            val triggerTime = System.currentTimeMillis() + (delaySeconds.coerceAtLeast(1) * 1000L)

            val intent = Intent(reactContext, AlarmReceiver::class.java).apply {
                putExtra(FloatingAlarmService.EXTRA_TITLE, title)
                putExtra(FloatingAlarmService.EXTRA_MEDICINE_NAME, medicineName)
                putExtra(FloatingAlarmService.EXTRA_DOSE, dose)
                putExtra(FloatingAlarmService.EXTRA_TIME, "Sekarang")
                putExtra(FloatingAlarmService.EXTRA_REMINDER_ID, reminderId)
                putExtra(FloatingAlarmService.EXTRA_IS_TEST, true)
            }

            val testReqCode = 99999
            val pendingIntent = PendingIntent.getBroadcast(
                reactContext,
                testReqCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                )
            }

            promise.resolve(testReqCode)
        } catch (e: Exception) {
            promise.reject("ERR_TEST_FLOATING", e.message, e)
        }
    }

    @ReactMethod
    fun openNotificationChannelSettings(promise: Promise) {
        try {
            val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS).apply {
                    putExtra(Settings.EXTRA_APP_PACKAGE, reactContext.packageName)
                    putExtra(Settings.EXTRA_CHANNEL_ID, FloatingAlarmService.CHANNEL_ID)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            } else {
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.parse("package:${reactContext.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_OPEN_NOTIF_SETTINGS", e.message, e)
        }
    }
}
