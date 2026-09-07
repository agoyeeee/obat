package com.anonymous.mobile.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.Promise
import org.json.JSONArray
import org.json.JSONObject
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AlarmSchedulerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "AlarmScheduler"

  @ReactMethod
  fun scheduleAlarm(requestId: String, timeMillis: Double, title: String?, message: String?, promise: Promise) {
    try {
      val ctx = reactContext.applicationContext
      val alarmManager = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val intent = Intent(ctx, AlarmReceiver::class.java).apply {
        putExtra("requestId", requestId)
        putExtra("title", title)
        putExtra("message", message)
      }
      val requestCode = requestId.hashCode()
      val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      } else {
        PendingIntent.FLAG_UPDATE_CURRENT
      }
      val pending = PendingIntent.getBroadcast(ctx, requestCode, intent, flags)

      try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timeMillis.toLong(), pending)
        } else {
          alarmManager.setExact(AlarmManager.RTC_WAKEUP, timeMillis.toLong(), pending)
        }
      } catch (se: SecurityException) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timeMillis.toLong(), pending)
        } else {
          alarmManager.set(AlarmManager.RTC_WAKEUP, timeMillis.toLong(), pending)
        }
      }

      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("E_SCHEDULE_FAILED", e)
    }
  }

  @ReactMethod
  fun cancelAlarm(requestId: String, promise: Promise) {
    try {
      val ctx = reactContext.applicationContext
      val alarmManager = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val intent = Intent(ctx, AlarmReceiver::class.java)
      val requestCode = requestId.hashCode()
      val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      } else {
        PendingIntent.FLAG_UPDATE_CURRENT
      }
      val pending = PendingIntent.getBroadcast(ctx, requestCode, intent, flags)
      alarmManager.cancel(pending)
      pending.cancel()
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("E_CANCEL_FAILED", e)
    }
  }

  @ReactMethod
  fun getPendingEvents(promise: Promise) {
    try {
      val ctx = reactContext.applicationContext
      val prefs = ctx.getSharedPreferences("patient_alarm_events", Context.MODE_PRIVATE)
      val raw = prefs.getString("events", null)
      if (raw.isNullOrEmpty()) {
        promise.resolve("[]")
        return
      }
      // return JSON string, JS will parse
      promise.resolve(raw)
    } catch (e: Exception) {
      promise.reject("E_READ_EVENTS", e)
    }
  }

  @ReactMethod
  fun clearEvent(requestId: String, promise: Promise) {
    try {
      val ctx = reactContext.applicationContext
      val prefs = ctx.getSharedPreferences("patient_alarm_events", Context.MODE_PRIVATE)
      val raw = prefs.getString("events", null)
      if (raw.isNullOrEmpty()) {
        promise.resolve(true)
        return
      }
      val arr = JSONArray(raw)
      val out = JSONArray()
      for (i in 0 until arr.length()) {
        val o = arr.optJSONObject(i) ?: continue
        val rid = if (o.has("requestId") && !o.isNull("requestId")) o.getString("requestId") else null
        if (rid == requestId) continue
        out.put(o)
      }
      prefs.edit().putString("events", out.toString()).apply()
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("E_CLEAR_EVENT", e)
    }
  }
}
