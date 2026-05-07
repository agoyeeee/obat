.PHONY: help install install-backend install-mobile keygen migrate seed fresh route-list serve-backend serve-mobile serve-mobile-build android-doctor android-avd-list android-emulator-start ensure-android-localprops run stop

help:
	@echo "Available targets:"
	@echo "  make install         - Install backend and mobile dependencies"
	@echo "  make install-backend - Install backend dependencies (Composer)"
	@echo "  make install-mobile  - Install mobile dependencies (npm)"
	@echo "  make keygen          - Generate Laravel app key"
	@echo "  make migrate         - Run Laravel migrations"
	@echo "  make seed            - Run Laravel seeders"
	@echo "  make fresh           - Fresh migrate and seed"
	@echo "  make route-list      - Show Laravel routes"
	@echo "  make serve-backend   - Run Laravel API server"
	@echo "  make serve-mobile    - Run Expo dev server for development build"
	@echo "  make ensure-android-localprops - Ensure mobile/android/local.properties exists with sdk.dir"
	@echo "  make android-doctor  - Check Android SDK, adb, emulator, and devices"
	@echo "  make android-avd-list - List available Android Virtual Devices"
	@echo "  make android-emulator-start - Start first available Android emulator"
	@echo "  make serve-mobile-build - Build and install Android development build"
	@echo "  make run             - Start backend and mobile (dev client) in separate PowerShell windows"
	@echo "  make stop            - Stop php and node processes (Windows)"

install: install-backend install-mobile

install-backend:
	cd backend && composer install

install-mobile:
	cd mobile && npm install

keygen:
	cd backend && php artisan key:generate

migrate:
	cd backend && php artisan migrate

seed:
	cd backend && php artisan db:seed

fresh:
	cd backend && php artisan migrate:fresh --seed

route-list:
	cd backend && php artisan route:list

serve-backend:
	cd backend && php artisan serve

serve-mobile:
	cd mobile && npm run start

ensure-android-localprops:
	powershell -NoProfile -Command '$$androidDir = Join-Path (Get-Location) "mobile\\android"; $$localProps = Join-Path $$androidDir "local.properties"; $$sdk = $$env:ANDROID_SDK_ROOT; if (-not $$sdk) { $$sdk = $$env:ANDROID_HOME }; if (-not $$sdk) { $$defaultSdk = Join-Path $$env:USERPROFILE "AppData\\Local\\Android\\Sdk"; if (Test-Path $$defaultSdk) { $$sdk = $$defaultSdk } }; if (-not $$sdk) { Write-Error "Android SDK tidak ditemukan. Set ANDROID_SDK_ROOT/ANDROID_HOME atau install Android Studio SDK terlebih dahulu."; exit 1 }; $$sdkNormalized = ($$sdk -replace "\\", "/") -replace "/+", "/"; $$content = "sdk.dir=" + $$sdkNormalized; Set-Content -Path $$localProps -Value $$content -Encoding ASCII; Write-Host ("local.properties updated: " + $$localProps); Write-Host ("sdk.dir=" + $$sdkNormalized)'

android-doctor: ensure-android-localprops
	powershell -NoProfile -Command '$$sdk = $$env:ANDROID_SDK_ROOT; if (-not $$sdk) { $$sdk = $$env:ANDROID_HOME }; if (-not $$sdk) { $$defaultSdk = Join-Path $$env:USERPROFILE "AppData\\Local\\Android\\Sdk"; if (Test-Path $$defaultSdk) { $$sdk = $$defaultSdk } }; $$adb = if ($$sdk) { Join-Path $$sdk "platform-tools\\adb.exe" } else { "adb" }; $$emu = if ($$sdk) { Join-Path $$sdk "emulator\\emulator.exe" } else { "emulator" }; Write-Host "ANDROID_HOME=" $$env:ANDROID_HOME; Write-Host "ANDROID_SDK_ROOT=" $$env:ANDROID_SDK_ROOT; Write-Host "Resolved SDK=" $$sdk; Write-Host "Resolved adb=" $$adb; Write-Host "Resolved emulator=" $$emu; if (-not (Test-Path $$adb)) { Write-Error "adb tidak ditemukan. Install Android SDK Platform-Tools."; exit 1 }; if (-not (Test-Path $$emu)) { Write-Warning "emulator tidak ditemukan. Tidak masalah jika Anda hanya pakai device fisik." }; & $$adb devices'

android-avd-list:
	powershell -NoProfile -Command '$$sdk = $$env:ANDROID_SDK_ROOT; if (-not $$sdk) { $$sdk = $$env:ANDROID_HOME }; if (-not $$sdk) { $$defaultSdk = Join-Path $$env:USERPROFILE "AppData\\Local\\Android\\Sdk"; if (Test-Path $$defaultSdk) { $$sdk = $$defaultSdk } }; $$emu = if ($$sdk) { Join-Path $$sdk "emulator\\emulator.exe" } else { "emulator" }; if (-not (Test-Path $$emu)) { Write-Error "emulator tidak ditemukan. Install Android Emulator dari SDK Manager."; exit 1 }; & $$emu -list-avds'

android-emulator-start:
	powershell -NoProfile -Command '$$sdk = $$env:ANDROID_SDK_ROOT; if (-not $$sdk) { $$sdk = $$env:ANDROID_HOME }; if (-not $$sdk) { $$defaultSdk = Join-Path $$env:USERPROFILE "AppData\\Local\\Android\\Sdk"; if (Test-Path $$defaultSdk) { $$sdk = $$defaultSdk } }; $$emu = if ($$sdk) { Join-Path $$sdk "emulator\\emulator.exe" } else { "emulator" }; if (-not (Test-Path $$emu)) { Write-Error "emulator tidak ditemukan. Install Android Emulator dari SDK Manager."; exit 1 }; $$avd = & $$emu -list-avds | Select-Object -First 1; if (-not $$avd) { Write-Error "Tidak ada AVD. Buat emulator dulu di Android Studio Device Manager."; exit 1 }; Start-Process $$emu -ArgumentList ("-avd " + $$avd); Write-Host ("Starting emulator: " + $$avd)'

serve-mobile-build: ensure-android-localprops
	powershell -NoProfile -Command '$$sdk = $$env:ANDROID_SDK_ROOT; if (-not $$sdk) { $$sdk = $$env:ANDROID_HOME }; if (-not $$sdk) { $$defaultSdk = Join-Path $$env:USERPROFILE "AppData\\Local\\Android\\Sdk"; if (Test-Path $$defaultSdk) { $$sdk = $$defaultSdk } }; $$adb = if ($$sdk) { Join-Path $$sdk "platform-tools\\adb.exe" } else { "adb" }; $$emu = if ($$sdk) { Join-Path $$sdk "emulator\\emulator.exe" } else { "emulator" }; if (-not (Test-Path $$adb)) { Write-Error "adb tidak ditemukan. Install Android SDK Platform-Tools."; exit 1 }; $$adbOut = & $$adb devices; $$readyCount = ($$adbOut | Select-String "\sdevice$$" | Measure-Object).Count; $$unauthorizedCount = ($$adbOut | Select-String "\sunauthorized$$" | Measure-Object).Count; $$offlineCount = ($$adbOut | Select-String "\soffline$$" | Measure-Object).Count; if ($$readyCount -gt 0) { exit 0 }; if ($$unauthorizedCount -gt 0) { Write-Error "Device terdeteksi tapi masih unauthorized. Cek layar HP dan tekan Allow USB debugging, lalu jalankan: adb kill-server; adb start-server; make serve-mobile-build"; exit 1 }; if ($$offlineCount -gt 0) { Write-Error "Device status offline. Coba cabut/pasang kabel, aktifkan ulang USB debugging, lalu jalankan: adb kill-server; adb start-server"; exit 1 }; if (Test-Path $$emu) { $$avd = & $$emu -list-avds | Select-Object -First 1; if ($$avd) { Start-Process $$emu -ArgumentList ("-avd " + $$avd); Write-Host ("Starting emulator: " + $$avd + ". Tunggu sampai boot selesai lalu jalankan ulang make serve-mobile-build."); exit 1 } else { Write-Error "Tidak ada device terhubung dan tidak ada AVD. Buat emulator dulu atau sambungkan HP (USB debugging)."; exit 1 } } else { Write-Error "Tidak ada device fisik terhubung. Sambungkan HP (USB debugging) atau install Android Emulator."; exit 1 }'
	cd mobile && npm run android:dev

run:
	powershell -NoProfile -Command "Start-Process powershell -ArgumentList '-NoExit','-Command','cd ''$(CURDIR)\\backend''; php artisan serve --host 0.0.0.0 --port 8000'"
	powershell -NoProfile -Command "Start-Process powershell -ArgumentList '-NoExit','-Command','cd ''$(CURDIR)\\mobile''; npm run start'"
	@echo "Backend and mobile (development build dev client) started in separate windows."

stop:
	powershell -NoProfile -Command "Get-Process php,node -ErrorAction SilentlyContinue | Stop-Process -Force"
	@echo "Stopped php/node processes if any were running."
