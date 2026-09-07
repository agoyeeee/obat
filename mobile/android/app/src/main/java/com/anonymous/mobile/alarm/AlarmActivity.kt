package com.anonymous.mobile.alarm

import android.app.Activity
import android.os.Build
import android.os.Bundle
import android.view.MotionEvent
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView
import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.Date

class AlarmActivity : Activity() {
  private var startX = 0f

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
    }

    val root = FrameLayout(this)
    root.setBackgroundColor(0xFF120F16.toInt())

    val tv = TextView(this).apply {
      text = "Alarm: Geser ke kanan untuk mematikan"
      setTextColor(0xFFFFFFFF.toInt())
      textSize = 22f
      setPadding(40, 200, 40, 40)
    }
    root.addView(tv)

    root.setOnTouchListener { _, event ->
      when (event.action) {
        MotionEvent.ACTION_DOWN -> startX = event.x
        MotionEvent.ACTION_UP -> {
          val dx = event.x - startX
          val threshold = resources.displayMetrics.widthPixels * 0.5f
          if (dx > threshold) {
            stopAlarmAndFinish()
          }
        }
      }
      true
    }

    setContentView(root)
  }

  private fun stopAlarmAndFinish() {
    try {
      // record local event: diminum
      try {
        val prefs = getSharedPreferences("patient_alarm_events", Context.MODE_PRIVATE)
        val raw = prefs.getString("events", null)
        val arr = if (raw.isNullOrEmpty()) JSONArray() else JSONArray(raw)

        val now = Date()
        val fmtDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(now)
        val fmtTime = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(now)

        val obj = JSONObject()
        obj.put("requestId", intent?.getStringExtra("requestId") ?: JSONObject.NULL)
        obj.put("status", "diminum")
        obj.put("tanggal", fmtDate)
        obj.put("waktu", fmtTime)
        obj.put("logged_at", now.toISOString())

        arr.put(obj)
        prefs.edit().putString("events", arr.toString()).apply()
      } catch (e: Exception) {
        e.printStackTrace()
      }

      stopService(android.content.Intent(this, AlarmForegroundService::class.java))
    } catch (e: Exception) {
      e.printStackTrace()
    }

    finish()
  }

  // helper to format ISO string for JS/back-end compatibility
  private fun Date.toISOString(): String {
    val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX", Locale.getDefault())
    return sdf.format(this)
  }
}
