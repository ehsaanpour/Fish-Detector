Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Image]::FromFile("assets/test_samples/mahimahi_user_crop.jpg")
$bmp = New-Object System.Drawing.Bitmap(9, 8)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, 9, 8)

$hash = ""
$rSum = 0; $gSum = 0; $bSum = 0; $cnt = 0

for ($y = 0; $y -lt 8; $y++) {
    for ($x = 0; $x -lt 8; $x++) {
        $p1 = $bmp.GetPixel($x, $y)
        $p2 = $bmp.GetPixel($x + 1, $y)
        $l1 = 0.299 * $p1.R + 0.587 * $p1.G + 0.114 * $p1.B
        $l2 = 0.299 * $p2.R + 0.587 * $p2.G + 0.114 * $p2.B
        if ($l1 -gt $l2) { $hash += "1" } else { $hash += "0" }
        $rSum += $p1.R; $gSum += $p1.G; $bSum += $p1.B; $cnt++
    }
}

Write-Host "User Crop Hash: $hash"
Write-Host "Aspect Ratio: $([Math]::Round($img.Width / $img.Height, 2))"
Write-Host "Avg RGB: $([Math]::Round($rSum/$cnt)), $([Math]::Round($gSum/$cnt)), $([Math]::Round($bSum/$cnt))"

$g.Dispose()
$bmp.Dispose()
$img.Dispose()
