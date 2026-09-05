@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "ANDROID_HOME=C:\2022.3.44f1\Editor\Data\PlaybackEngines\AndroidPlayer\SDK"
call gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a
