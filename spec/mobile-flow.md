# Mobile Flow (React Native Expo)

## Shared

1. Splash screen
2. Login
3. Redirect berdasarkan role

## Apoteker Flow

1. Login apoteker
2. Dashboard apoteker
3. Pilih pasien
4. Tambah jadwal obat
   - pilih obat dari data statis
   - isi dosis, jenis, jam minum, jumlah, tanggal mulai/selesai
5. Lihat daftar jadwal per pasien
6. Lihat evaluasi kepatuhan mingguan pasien

## Pasien Flow

1. Login pasien
2. Home (jadwal hari ini)
3. Terima notifikasi reminder
4. Buka detail jadwal dari notifikasi
5. Pilih status konsumsi:
   - Sudah minum
   - Tidak minum
6. Lihat detail obat
7. Lihat riwayat konsumsi
8. Lihat statistik kepatuhan mingguan
9. Buka QnA via WhatsApp

## WhatsApp Deep Link

Format URL:

https://wa.me/<nomor>?text=<pesan_encoded>

Contoh pesan otomatis:

"Halo, saya pasien atas nama {nama_pasien}. Saya ingin bertanya terkait obat {nama_obat}."
