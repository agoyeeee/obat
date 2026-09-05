package id.myheart.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class AlarmActionReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_STOP_ALARM = "id.myheart.app.ACTION_STOP_FLOATING_ALARM"
        const val ACTION_TAKE_MEDICINE = "id.myheart.app.ACTION_TAKE_MEDICINE_FROM_NOTIF"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        // 1. Always stop alarm sound and dismiss floating popup
        val stopServiceIntent = Intent(context, FloatingAlarmService::class.java).apply {
            this.action = FloatingAlarmService.ACTION_STOP
        }
        try {
            context.startService(stopServiceIntent)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 2. If user tapped "Sudah Minum Obat", launch MainActivity to record it
        if (action == ACTION_TAKE_MEDICINE) {
            val reminderId = intent.getStringExtra(FloatingAlarmService.EXTRA_REMINDER_ID)
            val medicineName = intent.getStringExtra(FloatingAlarmService.EXTRA_MEDICINE_NAME)

            val openAppIntent = Intent(context, MainActivity::class.java).apply {
                this.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("action", "medicine_taken")
                putExtra("reminder_local_id", reminderId)
                putExtra("reminder_obat_id", reminderId)
                putExtra("medicine_name", medicineName)
                putExtra("is_taken", true)
            }
            try {
                context.startActivity(openAppIntent)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
