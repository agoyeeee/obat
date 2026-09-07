package com.anonymous.mobile

import id.myheart.app.BuildConfig

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.res.Configuration
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost
import com.anonymous.mobile.alarm.AlarmPackage

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
      this,
      object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              add(AlarmPackage())
            }

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()

    // Create alarm notification channel with custom sound NATIVELY
    createAlarmNotificationChannel()

    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  private fun createAlarmNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channelId = "reminder_obat_alarm_v7"
      val channelName = "Alarm Obat"

      // Delete old channels
      val notificationManager = getSystemService(NotificationManager::class.java)
      listOf(
        "reminder_obat_channel",
        "reminder_obat_channel_v2",
        "reminder_obat_channel_v3",
        "reminder_obat_channel_v4",
        "reminder_obat_alarm_v5",
        "reminder_obat_alarm_v6",
        "reminder_obat_alarm_native"
      ).forEach { oldId ->
        try { notificationManager.deleteNotificationChannel(oldId) } catch (_: Exception) {}
      }

      val channel = NotificationChannel(
        channelId,
        channelName,
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Alarm pengingat minum obat"
        enableVibration(true)
        vibrationPattern = longArrayOf(0, 500, 500, 500, 500, 500)
        setBypassDnd(true)
        lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC

        // Set custom alarm sound from res/raw/alarm_sound.wav
        val soundUri = Uri.parse("android.resource://${packageName}/raw/alarm_sound")
        val audioAttributes = AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_ALARM)
          .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .build()
        setSound(soundUri, audioAttributes)
      }

      notificationManager.createNotificationChannel(channel)
    }
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
