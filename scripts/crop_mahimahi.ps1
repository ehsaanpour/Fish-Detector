Add-Type -AssemblyName System.Drawing

$src = "C:\Users\EE\.gemini\antigravity-ide\brain\46634529-a410-4061-abf6-9b338e66278b\.user_uploaded\media_1791994757721.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)
Write-Host "Dimensions: $($bmp.Width) x $($bmp.Height)"

# In this screenshot (432x939 or similar):
# Camera box inner area is at y: 0.11 to 0.35, x: 0.05 to 0.95
$cropX = [int]($bmp.Width * 0.04)
$cropY = [int]($bmp.Height * 0.11)
$cropW = [int]($bmp.Width * 0.92)
$cropH = [int]($bmp.Height * 0.25)

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $bmp.Clone($rect, $bmp.PixelFormat)
$dest = "assets/fish/mahimahi_user_crop.jpg"
$cropped.Save($dest, [System.Drawing.Imaging.ImageFormat]::Jpeg)

Write-Host "Saved user crop to $dest"
$cropped.Dispose()
$bmp.Dispose()
