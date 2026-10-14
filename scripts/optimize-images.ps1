Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem "assets/fish/*.jpg"
foreach ($file in $files) {
    if ($file.Length -gt 800000) {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $ratio = [Math]::Min(900.0 / $img.Width, 900.0 / $img.Height)
        if ($ratio -lt 1.0) {
            $newW = [int]($img.Width * $ratio)
            $newH = [int]($img.Height * $ratio)
            $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
            $g = [System.Drawing.Graphics]::FromImage($bmp)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.DrawImage($img, 0, 0, $newW, $newH)
            $g.Dispose()
            $img.Dispose()
            $tmp = $file.FullName + ".tmp"
            $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Jpeg)
            $bmp.Dispose()
            Move-Item -Force $tmp $file.FullName
            $newSize = (Get-Item $file.FullName).Length
            Write-Host ("Optimized $($file.Name): from $($file.Length) to $newSize bytes")
        } else {
            $img.Dispose()
        }
    }
}
Write-Host "Optimization finished."
