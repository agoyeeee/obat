package id.sobatjantung.app

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

/**
 * Menyimpan data alarm secara persisten di SharedPreferences.
 * Digunakan agar alarm bisa dijadwalkan ulang setelah device reboot
 * atau app update (MY_PACKAGE_REPLACED).
 */
object AlarmStorage {

    private const val PREFS_NAME = "sobatjantung_alarm_prefs"
    private const val KEY_ALARMS = "scheduled_alarms"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    /**
     * Simpan data alarm baru atau perbarui yang sudah ada (berdasarkan id).
     */
    fun saveAlarm(context: Context, alarm: AlarmData) {
        val alarms = getAllAlarms(context).toMutableList()
        // Hapus alarm lama dengan id yang sama jika ada
        alarms.removeAll { it.id == alarm.id }
        alarms.add(alarm)
        persistAlarms(context, alarms)
    }

    /**
     * Hapus alarm berdasarkan id.
     */
    fun removeAlarm(context: Context, id: Int) {
        val alarms = getAllAlarms(context).toMutableList()
        alarms.removeAll { it.id == id }
        persistAlarms(context, alarms)
    }

    /**
     * Ambil semua alarm yang tersimpan.
     */
    fun getAllAlarms(context: Context): List<AlarmData> {
        val prefs = getPrefs(context)
        val json = prefs.getString(KEY_ALARMS, null) ?: return emptyList()
        return try {
            val array = JSONArray(json)
            val result = mutableListOf<AlarmData>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                result.add(
                    AlarmData(
                        id = obj.getInt("id"),
                        hour = obj.getInt("hour"),
                        minute = obj.getInt("minute"),
                        title = obj.optString("title", "Waktunya Minum Obat"),
                        medicineName = obj.optString("medicineName", "Obat Anda"),
                        dose = obj.optString("dose", "1 dosis"),
                        reminderId = obj.optString("reminderId", null),
                        isTest = obj.optBoolean("isTest", false)
                    )
                )
            }
            result
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    /**
     * Hapus semua data alarm.
     */
    fun clearAll(context: Context) {
        getPrefs(context).edit().remove(KEY_ALARMS).apply()
    }

    private fun persistAlarms(context: Context, alarms: List<AlarmData>) {
        val array = JSONArray()
        for (alarm in alarms) {
            val obj = JSONObject().apply {
                put("id", alarm.id)
                put("hour", alarm.hour)
                put("minute", alarm.minute)
                put("title", alarm.title)
                put("medicineName", alarm.medicineName)
                put("dose", alarm.dose)
                put("reminderId", alarm.reminderId)
                put("isTest", alarm.isTest)
            }
            array.put(obj)
        }
        getPrefs(context).edit().putString(KEY_ALARMS, array.toString()).apply()
    }

    data class AlarmData(
        val id: Int,
        val hour: Int,
        val minute: Int,
        val title: String,
        val medicineName: String,
        val dose: String,
        val reminderId: String?,
        val isTest: Boolean
    )
}
