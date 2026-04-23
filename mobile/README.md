# Mobile - React Native (Expo Development Build)

## Tujuan

Project mobile ini dikonfigurasi untuk **development build (dev client)**, bukan Expo Go.

## Prasyarat

1. Android Studio + Android SDK terpasang.
2. Emulator Android aktif, atau HP Android terhubung via USB debugging.
3. Node.js dan npm sudah terpasang.

## Install Dependensi

Jalankan dari folder `mobile`:

```bash
npm install
```

## Build Development Client (Android)

Pertama kali, buat dan install development build:

```bash
npm run android:dev
```

Perintah di atas akan:
1. Menjalankan `expo run:android`.
2. Generate native project jika belum ada.
3. Build APK debug dev client.
4. Install aplikasi dev client ke emulator/device.

## Jalankan Metro untuk Dev Client

Setelah dev build terpasang, jalankan bundler:

```bash
npm run start
```

Script `start` sudah menggunakan `expo start --dev-client`.

## Alur Harian Pengembangan

1. Jalankan backend Laravel.
2. Jalankan `npm run start` di folder `mobile`.
3. Buka app dev client di emulator/device.
4. App akan connect ke Metro bundler.

## Script Penting

- `npm run start` : start Metro untuk dev client.
- `npm run android:dev` : build + install Android development build.
- `npm run start:go` : mode Expo Go (opsional, tidak dipakai default).

## Integrasi dengan Makefile Root

Dari root project:

```bash
make serve-mobile-build
```

Untuk build dev client Android.

```bash
make serve-mobile
```

Untuk start Metro dev client.

```bash
make run
```

Untuk start backend + Metro dev client di jendela terpisah.
