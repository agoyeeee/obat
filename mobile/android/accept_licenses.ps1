$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$sdk = "C:\2022.3.44f1\Editor\Data\PlaybackEngines\AndroidPlayer\SDK"
$sdkmanager = "$sdk\cmdline-tools\6.0\bin\sdkmanager.bat"

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $sdkmanager
$psi.Arguments = "--sdk_root=`"$sdk`" --licenses"
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true

$proc = [System.Diagnostics.Process]::Start($psi)
$writer = $proc.StandardInput

for ($i = 0; $i -lt 50; $i++) {
    $writer.WriteLine("y")
    Start-Sleep -Milliseconds 200
}

$proc.WaitForExit()
Write-Host "ExitCode:" $proc.ExitCode
