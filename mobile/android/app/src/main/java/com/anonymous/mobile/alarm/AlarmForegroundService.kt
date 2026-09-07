package com.anonymous.mobile.alarm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import android.os.Handler
import android.os.Looper
import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import androidx.core.app.NotificationCompat

class AlarmForegroundService : Service() {
  private var mediaPlayer: MediaPlayer? = null
  private val handler = Handler(Looper.getMainLooper())
  private var missedRunnable: Runnable? = null

  override fun onCreate() {
    super.onCreate()
    createChannelIfNeeded()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val contentIntent = Intent(this, AlarmActivity::class.java).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
      putExtras(intent?.extras ?: android.os.Bundle())
    }

    val pendingFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
    } else {
      PendingIntent.FLAG_UPDATE_CURRENT
    }

    val pendingIntent = PendingIntent.getActivity(this, 7001, contentIntent, pendingFlags)

    val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle("Alarm Obat")
      .setContentText("Alarm aktif. Geser layar untuk mematikan.")
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setOngoing(true)
      .setAutoCancel(false)
      .setContentIntent(pendingIntent)
      .build()

    startForeground(NOTIF_ID, notification)
    startAlarmSound()

    // Schedule missed alarm after 5 minutes (300000 ms)
    missedRunnable?.let { handler.removeCallbacks(it) }
    missedRunnable = Runnable {
      try {
        saveEventLocal(intent, "terlewat")
      } catch (e: Exception) {
        e.printStackTrace()
      }
      stopSelf()
    }
    handler.postDelayed(missedRunnable!!, 5 * 60 * 1000)

    return START_STICKY
  }

  private fun startAlarmSound() {
    if (mediaPlayer != null) return
    try {
      mediaPlayer = MediaPlayer.create(this, resources.getIdentifier("alarm_sound", "raw", packageName))?.apply {
        isLooping = true
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
          setAudioAttributes(
            AudioAttributes.Builder()
              .setUsage(AudioAttributes.USAGE_ALARM)
              .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
              .build()
          )
        }
        start()
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }

  override fun onDestroy() {
    try {
      mediaPlayer?.stop()
      mediaPlayer?.release()
    } catch (e: Exception) {
      e.printStackTrace()
    }
    mediaPlayer = null
    missedRunnable?.let { handler.removeCallbacks(it) }
    missedRunnable = null
    super.onDestroy()
  }

  private fun saveEventLocal(intent: Intent?, status: String) {
    try {
      val prefs = getSharedPreferences("patient_alarm_events", Context.MODE_PRIVATE)
      val raw = prefs.getString("events", null)
      val arr = if (raw.isNullOrEmpty()) JSONArray() else JSONArray(raw)

      val now = Date()
      val fmtDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(now)
      val fmtTime = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(now)

      val obj = JSONObject()
      obj.put("requestId", intent?.getStringExtra("requestId") ?: JSONObject.NULL)
      obj.put("status", status)
      obj.put("tanggal", fmtDate)
      obj.put("waktu", fmtTime)
      obj.put("logged_at", SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX", Locale.getDefault()).format(now))

      arr.put(obj)
      prefs.edit().putString("events", arr.toString()).apply()
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun createChannelIfNeeded() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java)
    val existing = manager.getNotificationChannel(CHANNEL_ID)
    if (existing != null) return
    val channel = NotificationChannel(CHANNEL_ID, "Alarm Obat Native", NotificationManager.IMPORTANCE_HIGH)
    channel.description = "Channel untuk foreground alarm native"
    channel.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
    manager.createNotificationChannel(channel)
  }

  companion object {
    private const val CHANNEL_ID = "alarm_native_foreground"
    private const val NOTIF_ID = 7001
  }
}
