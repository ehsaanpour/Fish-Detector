Add-Type -AssemblyName System.Drawing

$brainDir = "C:\Users\EE\.gemini\antigravity-ide\brain\46634529-a410-4061-abf6-9b338e66278b"
$destDir = "C:\Users\EE\Projects\Fish Detecor\assets\fish"

$map = @{
    "zardeh.jpg" = "$brainDir\zardeh_photo_1791992936869.jpg"
    "rashgoo.jpg" = "$brainDir\rashgoo_photo_1791992955316.jpg"
    "talal.jpg" = "$brainDir\talal_photo_1791992978138.jpg"
    "sobaity.jpg" = "$brainDir\sobaity_photo_1791992999333.jpg"
    "skipjack.jpg" = "$brainDir\skipjack_photo_1791993019777.jpg"
    "gish.jpg" = "$brainDir\gish_photo_1791993059261.jpg"
    "soltan_ebrahim.jpg" = "$brainDir\soltan_ebrahim_photo_1791993082433.jpg"
    "kafshak.jpg" = "$brainDir\kafshak_photo_1791993104647.jpg"
    "ordak_mahi.jpg" = "$brainDir\ordak_mahi_photo_1791993129947.jpg"
    "kilka.jpg" = "$brainDir\kilka_photo_1791993163050.jpg"
}

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)

foreach ($entry in $map.GetEnumerator()) {
    $targetFile = Join-Path $destDir $entry.Key
    $sourceFile = $entry.Value

    if (Test-Path $sourceFile) {
        $img = [System.Drawing.Image]::FromFile($sourceFile)
        
        # Max dimensions 1280x720
        $maxW = 1280
        $maxH = 720
        $scale = [Math]::Min($maxW / $img.Width, $maxH / $img.Height)
        if ($scale -gt 1.0) { $scale = 1.0 }
        
        $newW = [int]($img.Width * $scale)
        $newH = [int]($img.Height * $scale)
        
        $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.Clear([System.Drawing.Color]::White)
        $g.DrawImage($img, 0, 0, $newW, $newH)
        $g.Dispose()
        $img.Dispose()
        
        $tempOut = "$targetFile.tmp"
        $bmp.Save($tempOut, $jpegCodec, $encoderParams)
        $bmp.Dispose()
        
        Move-Item -Path $tempOut -Destination $targetFile -Force
        $len = (Get-Item $targetFile).Length
        Write-Host "Optimized and installed $($entry.Key) ($len bytes)"
    } else {
        Write-Warning "Source file not found: $sourceFile"
    }
}
