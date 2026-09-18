.PHONY: help install install-backend install-mobile keygen migrate seed fresh route-list serve-backend serve-mobile serve-mobile-build build-apk android-doctor android-avd-list android-emulator-start ensure-android-localprops run stop

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
	@echo "  make build-apk       - Build standalone Release APK (app-release.apk)"
	@echo "  make ensure-android-localprops - Ensure mobile/android/local.properties exists with sdk.dir"
	@echo "  make android-doctor  - Check Android SDK, adb, emulator, and devices"
	@echo "  make android-avd-list - List available Android Virtual Devices"
	@echo "  make android-emulator-start - Start first available Android emulator"
	@echo "  make serve-mobile-build - Build and install Android development build"
	@echo "  make run             - Start backend and mobile (dev client)"
	@echo "  make stop            - Stop php and node processes"

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
	cd backend && php artisan serve --host 0.0.0.0 --port 8000

serve-mobile:
	cd mobile && npm run start

ensure-android-localprops:
	@if [ -d "$$HOME/Android/Sdk" ]; then \
		mkdir -p mobile/android; \
		echo "sdk.dir=$$HOME/Android/Sdk" > mobile/android/local.properties; \
		echo "local.properties updated for Linux: $$HOME/Android/Sdk"; \
	elif command -v powershell >/dev/null 2>&1; then \
		powershell -NoProfile -Command '$$androidDir = Join-Path (Get-Location) "mobile\\android"; $$localProps = Join-Path $$androidDir "local.properties"; $$sdk = $$env:ANDROID_SDK_ROOT; if (-not $$sdk) { $$sdk = $$env:ANDROID_HOME }; if (-not $$sdk) { $$defaultSdk = Join-Path $$env:USERPROFILE "AppData\\Local\\Android\\Sdk"; if (Test-Path $$defaultSdk) { $$sdk = $$defaultSdk } }; if (-not $$sdk) { Write-Error "Android SDK tidak ditemukan. Set ANDROID_SDK_ROOT/ANDROID_HOME atau install Android Studio SDK terlebih dahulu."; exit 1 }; $$sdkNormalized = ($$sdk -replace "\\", "/") -replace "/+", "/"; $$content = "sdk.dir=" + $$sdkNormalized; Set-Content -Path $$localProps -Value $$content -Encoding ASCII; Write-Host ("local.properties updated: " + $$localProps); Write-Host ("sdk.dir=" + $$sdkNormalized)'; \
	fi

android-doctor: ensure-android-localprops
	@if [ -d "$$HOME/Android/Sdk" ]; then \
		$$HOME/Android/Sdk/platform-tools/adb devices; \
	elif command -v powershell >/dev/null 2>&1; then \
		powershell -NoProfile -Command '$$sdk = $$env:ANDROID_SDK_ROOT; if (-not $$sdk) { $$sdk = $$env:ANDROID_HOME }; if (-not $$sdk) { $$defaultSdk = Join-Path $$env:USERPROFILE "AppData\\Local\\Android\\Sdk"; if (Test-Path $$defaultSdk) { $$sdk = $$defaultSdk } }; $$adb = if ($$sdk) { Join-Path $$sdk "platform-tools\\adb.exe" } else { "adb" }; $$emu = if ($$sdk) { Join-Path $$sdk "emulator\\emulator.exe" } else { "emulator" }; Write-Host "ANDROID_HOME=" $$env:ANDROID_HOME; Write-Host "ANDROID_SDK_ROOT=" $$env:ANDROID_SDK_ROOT; Write-Host "Resolved SDK=" $$sdk; Write-Host "Resolved adb=" $$adb; Write-Host "Resolved emulator=" $$emu; if (-not (Test-Path $$adb)) { Write-Error "adb tidak ditemukan. Install Android SDK Platform-Tools."; exit 1 }; if (-not (Test-Path $$emu)) { Write-Warning "emulator tidak ditemukan. Tidak masalah jika Anda hanya pakai device fisik." }; & $$adb devices'; \
	fi

build-apk: ensure-android-localprops
	@if [ -d "/home/agoy/.jdk/jdk-17" ]; then \
		cd mobile/android && chmod +x gradlew && JAVA_HOME=/home/agoy/.jdk/jdk-17 ANDROID_HOME=/home/agoy/Android/Sdk PATH=/home/agoy/.jdk/jdk-17/bin:$$PATH ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a; \
	elif command -v cmd.exe >/dev/null 2>&1; then \
		cd mobile/android && cmd.exe /c "set JAVA_HOME=C:\Program Files\Java\jdk-17&& set ANDROID_HOME=C:\2022.3.44f1\Editor\Data\PlaybackEngines\AndroidPlayer\SDK&& gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a"; \
	else \
		cd mobile/android && chmod +x gradlew && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a; \
	fi

run:
	@echo "Starting backend on 0.0.0.0:8000..."
	cd backend && php artisan serve --host 0.0.0.0 --port 8000
