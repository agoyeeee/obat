# Aplikasi Pengingat Obat (Laravel API + React Native Expo)

Dokumen ini adalah blueprint implementasi aplikasi pengingat obat untuk 2 role: apoteker dan pasien.

## Tujuan

Membantu pasien patuh minum obat sesuai jadwal dan membantu apoteker memantau kepatuhan mingguan.

## Fitur Inti

1. Input jadwal obat oleh apoteker.
2. Reminder notifikasi otomatis sesuai jam minum obat.
3. Tracking status konsumsi oleh pasien: `SUDAH_MINUM` atau `TIDAK_MINUM`.
4. Evaluasi kepatuhan mingguan dengan rumus:

	$$\text{kepatuhan} = \frac{\text{jumlah jadwal dengan status SUDAH_MINUM}}{\text{total jadwal periode}} \times 100\%$$

5. Detail obat dari data statis (bukan input apoteker).
6. QnA via WhatsApp (deep link dengan pesan otomatis).

## Stack Teknis

- Backend API: Laravel + Sanctum
- Database: MySQL
- Mobile: React Native (Expo)

## Entitas Data

1. `users`
	- Menyimpan akun apoteker dan pasien.
2. `medicines`
	- Data obat statis (nama, merk, kegunaan, cara pakai, perhatian, efek samping).
3. `patient_medicine_schedules`
	- Jadwal obat pasien yang diinput apoteker.
4. `medicine_intake_logs`
	- Riwayat konsumsi obat oleh pasien per jadwal/periode waktu.

## Role dan Hak Akses

### Apoteker

- Login.
- Input jadwal obat pasien:
  - pilih obat dari data statis,
  - dosis,
  - jenis obat,
  - jam minum,
  - jumlah obat diberikan,
  - tanggal mulai/selesai.
- Lihat kepatuhan pasien.

### Pasien

- Login.
- Lihat jadwal obat harian.
- Terima reminder notifikasi.
- Tandai status konsumsi.
- Lihat detail obat.
- Lihat jumlah obat dikonsumsi dan evaluasi kepatuhan.
- Akses tombol QnA via WhatsApp.

## Autentikasi

- Sanctum token-based.
- Apoteker:
  - Username: nama.
  - Password awal: tanggal lahir (format disepakati, mis. `YYYYMMDD`).
- Pasien:
  - Dibuatkan akun oleh apoteker/admin.
  - Data jadwal ditautkan dari input apoteker.

## Perhitungan Kepatuhan

- Periode default: mingguan.
- Denominator: seluruh jadwal aktif pada rentang tanggal.
- Numerator: log konsumsi dengan status `SUDAH_MINUM`.
- Jika tidak ada jadwal pada periode tersebut, kepatuhan = `0%`.

## Struktur Folder yang Disarankan

```
obat/
  backend/            # Laravel API
  mobile/             # React Native Expo
  spec/
	 openapi.yaml
	 database_schema.sql
	 static_medicines.json
	 mobile-flow.md
```

## Spesifikasi Tambahan

- API contract: lihat `spec/openapi.yaml`
- SQL schema: lihat `spec/database_schema.sql`
- Data statis obat: lihat `spec/static_medicines.json`
- User flow mobile: lihat `spec/mobile-flow.md`

## Implementasi Bertahap yang Direkomendasikan

1. Buat project Laravel di folder `backend` dan setup Sanctum.
2. Implement migration sesuai `spec/database_schema.sql`.
3. Seed data obat statis dari `spec/static_medicines.json`.
4. Bangun endpoint API sesuai `spec/openapi.yaml`.
5. Buat app Expo di folder `mobile`.
6. Implement halaman Login, Jadwal, Detail Obat, Riwayat, Kepatuhan.
7. Tambahkan local notification dan deep link WhatsApp.

## Catatan Batasan

- Data obat wajib statis di sistem.
- Tidak menggunakan integrasi API eksternal untuk data obat.