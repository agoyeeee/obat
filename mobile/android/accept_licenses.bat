@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "ANDROID_HOME=C:\2022.3.44f1\Editor\Data\PlaybackEngines\AndroidPlayer\SDK"

(
  for /L %%i in (1,1,50) do @echo y
) | "%ANDROID_HOME%\cmdline-tools\6.0\bin\sdkmanager.bat" --sdk_root="%ANDROID_HOME%" --licenses
