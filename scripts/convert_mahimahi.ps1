Add-Type -AssemblyName System.Drawing

$src = "assets/fish/noaa_mahimahi.png"
$img = [System.Drawing.Image]::FromFile($src)
Write-Host "NOAA Image: $($img.Width) x $($img.Height)"

# Convert NOAA PNG to high quality JPEG with white background
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::White)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
$p = New-Object System.Drawing.Imaging.EncoderParameters(1)
$p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90)

$bmp.Save("assets/fish/mahimahi.jpg", $codec, $p)
Write-Host "Saved assets/fish/mahimahi.jpg successfully! Size: $((Get-Item 'assets/fish/mahimahi.jpg').Length)"

$g.Dispose()
$bmp.Dispose()
$img.Dispose()
