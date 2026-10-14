Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\EE\.gemini\antigravity-ide\brain\46634529-a410-4061-abf6-9b338e66278b\.user_uploaded\media_1791992149562.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Source image dimensions: $($bmp.Width) x $($bmp.Height)"

# In the screenshot (typically 400-500w by 800-1000h), the camera box is around y: 80-100 to y: 350-400
# Let's crop the camera viewport containing the fish specimen
# Camera box inner area:
# x: ~20 to ~380
# y: ~110 to ~350

$cropX = [int]($bmp.Width * 0.05)
$cropY = [int]($bmp.Height * 0.12)
$cropW = [int]($bmp.Width * 0.90)
$cropH = [int]($bmp.Height * 0.22)

Write-Host "Cropping rect: X=$cropX, Y=$cropY, W=$cropW, H=$cropH"

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $bmp.Clone($rect, $bmp.PixelFormat)

$destPath = "C:\Users\EE\Projects\Fish Detecor\assets\fish\zardeh_crop.jpg"
$cropped.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)

Write-Host "Saved cropped fish to $destPath"

$cropped.Dispose()
$bmp.Dispose()
