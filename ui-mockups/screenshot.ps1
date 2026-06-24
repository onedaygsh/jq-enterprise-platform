Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$url = $args[0]
$output = $args[1]
$width = [int]$args[2]
$height = [int]$args[3]

$browser = New-Object System.Windows.Forms.WebBrowser
$browser.Width = $width
$browser.Height = $height
$browser.ScrollBarsEnabled = $false
$browser.ScriptErrorsSuppressed = $true

$browser.Navigate($url)

# Wait for page to load
while ($browser.ReadyState -ne 'Complete') {
    [System.Windows.Forms.Application]::DoEvents()
    Start-Sleep -Milliseconds 100
}
Start-Sleep -Seconds 1

$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$browser.DrawToBitmap($bitmap, New-Object System.Drawing.Rectangle(0, 0, $width, $height))
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
$browser.Dispose()
$bitmap.Dispose()
Write-Host "Screenshot saved: $output"
