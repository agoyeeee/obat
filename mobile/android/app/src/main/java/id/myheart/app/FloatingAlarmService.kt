package id.myheart.app

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.provider.Settings
import android.util.DisplayMetrics
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat

class FloatingAlarmService : Service() {

    private var windowManager: WindowManager? = null
    private var floatingView: View? = null
    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null

    companion object {
        const val CHANNEL_ID = "myheart_heads_up_alarm_v4"
        const val NOTIFICATION_ID = 90210
        const val ACTION_STOP = "id.myheart.app.ACTION_STOP_FLOATING_ALARM"

        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_MEDICINE_NAME = "extra_medicine_name"
        const val EXTRA_DOSE = "extra_dose"
        const val EXTRA_TIME = "extra_time"
        const val EXTRA_REMINDER_ID = "extra_reminder_id"
        const val EXTRA_IS_TEST = "extra_is_test"

        var isRunning = false
            private set
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopFloatingAlarm()
            return START_NOT_STICKY
        }

        isRunning = true

        val title = intent?.getStringExtra(EXTRA_TITLE) ?: "Waktunya Minum Obat"
        val medicineName = intent?.getStringExtra(EXTRA_MEDICINE_NAME) ?: "Obat Anda"
        val dose = intent?.getStringExtra(EXTRA_DOSE) ?: "Sesuai petunjuk dokter"
        val time = intent?.getStringExtra(EXTRA_TIME) ?: ""
        val reminderId = intent?.getStringExtra(EXTRA_REMINDER_ID)
        val isTest = intent?.getBooleanExtra(EXTRA_IS_TEST, false) ?: false

        startForeground(
            NOTIFICATION_ID,
            buildForegroundNotification(title, medicineName, dose, reminderId, isTest)
        )

        startAlarmSoundAndVibration()

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(this)) {
            showFloatingOverlay(title, medicineName, dose, time, reminderId, isTest)
        }

        return START_NOT_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Pengingat Minum Obat (Heads-up)",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifikasi pop-up alarm minum obat bergaya heads-up"
                val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                val audioAttributes = AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT)
                    .build()
                setSound(soundUri, audioAttributes)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 400, 200, 400)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                enableLights(true)
                lightColor = Color.parseColor("#0D9488")
                setBypassDnd(true)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(
        title: String,
        medicineName: String,
        dose: String,
        reminderId: String?,
        isTest: Boolean
    ): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("reminder_local_id", reminderId)
            putExtra("reminder_obat_id", reminderId)
        }
        val pendingOpen = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Action 1: Sudah Minum (Buka app & catat konsumsi)
        val takenIntent = Intent(this, AlarmActionReceiver::class.java).apply {
            action = AlarmActionReceiver.ACTION_TAKE_MEDICINE
            putExtra(EXTRA_REMINDER_ID, reminderId)
            putExtra(EXTRA_MEDICINE_NAME, medicineName)
        }
        val pendingTaken = PendingIntent.getBroadcast(
            this,
            1,
            takenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Action 2: Matikan Alarm
        val stopIntent = Intent(this, AlarmActionReceiver::class.java).apply {
            action = AlarmActionReceiver.ACTION_STOP_ALARM
        }
        val pendingStop = PendingIntent.getBroadcast(
            this,
            2,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val iconRes = applicationInfo.icon.takeIf { it != 0 } ?: android.R.drawable.ic_lock_idle_alarm
        val largeIconBitmap = try {
            BitmapFactory.decodeResource(resources, R.mipmap.ic_launcher)
        } catch (e: Exception) {
            null
        }

        val displayTitle = if (isTest) "⚡ [Uji Coba] $title" else "🔔 $title"
        val displayBody = "$medicineName • $dose"
        val bigText = "Waktunya minum $medicineName ($dose).\nKetuk untuk membuka aplikasi atau pilih tindakan di bawah."

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(iconRes)
            .apply {
                if (largeIconBitmap != null) {
                    setLargeIcon(largeIconBitmap)
                }
            }
            .setContentTitle(displayTitle)
            .setContentText(displayBody)
            .setStyle(NotificationCompat.BigTextStyle().bigText(bigText))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(pendingOpen)
            .setFullScreenIntent(pendingOpen, true) // TRUE WAJIB AGAR HEADS-UP BANNER POP-DOWN DI ATAS LAYAR!
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
            .setAutoCancel(true)
            .setOngoing(true)
            .setColor(Color.parseColor("#0D9488"))
            .addAction(android.R.drawable.checkbox_on_background, "✅ Sudah Minum", pendingTaken)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "❌ Matikan", pendingStop)
            .build()
    }

    private fun startAlarmSoundAndVibration() {
        try {
            stopAlarmSoundAndVibration()

            // Setup audio
            val audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()

            val rawResId = resources.getIdentifier("alarm_sound", "raw", packageName)
            mediaPlayer = if (rawResId != 0) {
                MediaPlayer.create(this, rawResId, audioAttributes, 0)
            } else {
                MediaPlayer.create(this, Settings.System.DEFAULT_ALARM_ALERT_URI)
            }

            mediaPlayer?.apply {
                isLooping = true
                setAudioAttributes(audioAttributes)
                setVolume(1.0f, 1.0f)
                start()
            }

            // Setup vibration
            vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vm?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }

            val pattern = longArrayOf(0, 600, 400, 600, 400)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createWaveform(pattern, 0))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(pattern, 0)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun stopAlarmSoundAndVibration() {
        try {
            mediaPlayer?.let {
                if (it.isPlaying) {
                    it.stop()
                }
                it.release()
            }
            mediaPlayer = null
        } catch (e: Exception) {
            e.printStackTrace()
        }

        try {
            vibrator?.cancel()
            vibrator = null
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    @Suppress("DEPRECATION")
    private fun showFloatingOverlay(
        title: String,
        medicineName: String,
        dose: String,
        time: String,
        reminderId: String?,
        isTest: Boolean
    ) {
        if (floatingView != null) {
            removeFloatingView()
        }

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val metrics: DisplayMetrics = resources.displayMetrics
        val screenWidth = metrics.widthPixels
        val cardWidth = (screenWidth * 0.94).toInt().coerceAtMost(dpToPx(400))

        val params = WindowManager.LayoutParams(
            cardWidth,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
            x = 0
            y = dpToPx(40)
        }

        val cardView = createCardLayout(title, medicineName, dose, time, reminderId, isTest, params)
        floatingView = cardView

        try {
            windowManager?.addView(cardView, params)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun createCardLayout(
        title: String,
        medicineName: String,
        dose: String,
        time: String,
        reminderId: String?,
        isTest: Boolean,
        params: WindowManager.LayoutParams
    ): View {
        val root = FrameLayout(this).apply {
            setPadding(0, 0, 0, 0)
        }

        // Card Container with modern rounded background, subtle border, and deep shadow
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dpToPx(20), dpToPx(12), dpToPx(20), dpToPx(18))

            val bg = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(28).toFloat()
                setColor(Color.parseColor("#0F172A")) // Deep Slate-900 luxury dark
                setStroke(dpToPx(1.5f), if (isTest) Color.parseColor("#F59E0B") else Color.parseColor("#0D9488"))
            }
            background = bg
            elevation = dpToPx(24).toFloat()
        }

        // 1. Top Bar: Centered drag handle + Top-Right minimal close button '✕'
        val topBar = FrameLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(26)
            ).apply {
                bottomMargin = dpToPx(4)
            }
        }

        // Drag handle indicator (centered)
        val handleBar = View(this).apply {
            layoutParams = FrameLayout.LayoutParams(dpToPx(38), dpToPx(4)).apply {
                gravity = Gravity.CENTER
            }
            background = GradientDrawable().apply {
                cornerRadius = dpToPx(2).toFloat()
                setColor(Color.parseColor("#475569"))
            }
        }
        topBar.addView(handleBar)

        // Close button '✕' on top-right to dismiss without marking taken
        val btnClose = TextView(this).apply {
            text = "✕"
            setTextColor(Color.parseColor("#94A3B8"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            gravity = Gravity.CENTER
            layoutParams = FrameLayout.LayoutParams(dpToPx(26), dpToPx(26)).apply {
                gravity = Gravity.END or Gravity.CENTER_VERTICAL
            }
            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(Color.parseColor("#1E293B"))
            }
            setOnClickListener {
                stopFloatingAlarm()
            }
        }
        topBar.addView(btnClose)
        card.addView(topBar)

        // 2. Header Row: Pill Badge & Time
        val headerRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(12)
            }
        }

        val badge = TextView(this).apply {
            text = if (isTest) "⚡ UJI COBA ALARM" else "🔔 JADWAL MINUM OBAT"
            setTextColor(if (isTest) Color.parseColor("#FCD34D") else Color.parseColor("#5EEAD4"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 10.5f)
            paint.isFakeBoldText = true
            setPadding(dpToPx(10), dpToPx(4), dpToPx(10), dpToPx(4))
            background = GradientDrawable().apply {
                cornerRadius = dpToPx(8).toFloat()
                setColor(if (isTest) Color.parseColor("#3B2A10") else Color.parseColor("#13373E"))
                setStroke(dpToPx(1), if (isTest) Color.parseColor("#78350F") else Color.parseColor("#115E59"))
            }
        }
        headerRow.addView(badge)

        if (time.isNotEmpty()) {
            val timeText = TextView(this).apply {
                text = if (time.contains(":")) "$time WIB" else time
                setTextColor(Color.parseColor("#94A3B8"))
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
                paint.isFakeBoldText = true
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    marginStart = dpToPx(10)
                }
            }
            headerRow.addView(timeText)
        }
        card.addView(headerRow)

        // 3. Medicine Info Row (Avatar Icon + Text Column)
        val infoRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(16)
            }
        }

        // Pill Icon Avatar
        val pillIcon = TextView(this).apply {
            text = "💊"
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f)
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(dpToPx(46), dpToPx(46)).apply {
                marginEnd = dpToPx(14)
            }
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dpToPx(15).toFloat()
                setColor(Color.parseColor("#134E4A")) // Deep teal container
                setStroke(dpToPx(1), Color.parseColor("#0D9488"))
            }
        }
        infoRow.addView(pillIcon)

        // Text Column: Name & Dose
        val textCol = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }

        val nameView = TextView(this).apply {
            text = medicineName
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 19f)
            paint.isFakeBoldText = true
            maxLines = 2
        }
        textCol.addView(nameView)

        val doseView = TextView(this).apply {
            text = "Dosis: $dose"
            setTextColor(Color.parseColor("#94A3B8"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setPadding(0, dpToPx(3), 0, 0)
        }
        textCol.addView(doseView)

        infoRow.addView(textCol)
        card.addView(infoRow)

        // 4. Single Primary Action Button: "✓ Sudah Minum Obat"
        val btnTaken = Button(this).apply {
            text = "✓  Sudah Minum Obat"
            isAllCaps = false
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
            paint.isFakeBoldText = true
            stateListAnimator = null // Remove default Android button elevation/padding

            val normalBg = GradientDrawable().apply {
                cornerRadius = dpToPx(16).toFloat()
                setColor(Color.parseColor("#0D9488")) // Vibrant Teal-600
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                val mask = GradientDrawable().apply {
                    cornerRadius = dpToPx(16).toFloat()
                    setColor(Color.WHITE)
                }
                background = RippleDrawable(
                    ColorStateList.valueOf(Color.parseColor("#14B8A6")),
                    normalBg,
                    mask
                )
            } else {
                background = normalBg
            }

            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(52)
            )
            setOnClickListener {
                openAppAndTakeMedicine(reminderId, medicineName)
            }
        }
        card.addView(btnTaken)

        // Drag to move listener on card
        card.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return false
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val dx = (event.rawX - initialTouchX).toInt()
                        val dy = (event.rawY - initialTouchY).toInt()
                        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                            params.x = initialX + dx
                            params.y = initialY + dy
                            try {
                                windowManager?.updateViewLayout(root, params)
                            } catch (e: Exception) {
                                // ignore
                            }
                            return true
                        }
                    }
                }
                return false
            }
        })

        root.addView(card)
        return root
    }

    private fun openAppAndTakeMedicine(reminderId: String?, medicineName: String) {
        try {
            val launchIntent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("action", "medicine_taken")
                putExtra("reminder_local_id", reminderId)
                putExtra("reminder_obat_id", reminderId)
                putExtra("medicine_name", medicineName)
                putExtra("is_taken", true)
            }
            startActivity(launchIntent)
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            stopFloatingAlarm()
        }
    }

    private fun openAppAndDismiss() {
        try {
            val launchIntent = Intent(this, MainActivity::class.java).apply {
                this.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(launchIntent)
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            stopFloatingAlarm()
        }
    }

    private fun removeFloatingView() {
        floatingView?.let {
            try {
                windowManager?.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            floatingView = null
        }
    }

    private fun stopFloatingAlarm() {
        stopAlarmSoundAndVibration()
        removeFloatingView()
        isRunning = false
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        stopFloatingAlarm()
        super.onDestroy()
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }

    private fun dpToPx(dp: Float): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }
}
