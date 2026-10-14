Add-Type -AssemblyName System.Drawing
$results = @{}
$files = Get-ChildItem "assets/fish/*.jpg"

foreach ($file in $files) {
    $img = [System.Drawing.Image]::FromFile($file.FullName)
    $key = $file.BaseName
    
    # 9x8 difference hash (64-bit dHash)
    $bmp = New-Object System.Drawing.Bitmap(9, 8)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, 9, 8)
    $g.Dispose()
    
    $hash = ""
    $rSum = 0
    $gSum = 0
    $bSum = 0
    $pixelCount = 0
    
    for ($y = 0; $y -lt 8; $y++) {
        for ($x = 0; $x -lt 8; $x++) {
            $pLeft = $bmp.GetPixel($x, $y)
            $pRight = $bmp.GetPixel($x + 1, $y)
            $lumLeft = 0.299 * $pLeft.R + 0.587 * $pLeft.G + 0.114 * $pLeft.B
            $lumRight = 0.299 * $pRight.R + 0.587 * $pRight.G + 0.114 * $pRight.B
            if ($lumLeft -gt $lumRight) { $hash += "1" } else { $hash += "0" }
            $rSum += $pLeft.R
            $gSum += $pLeft.G
            $bSum += $pLeft.B
            $pixelCount++
        }
    }
    
    $results[$key] = @{
        aspectRatio = [Math]::Round($img.Width / $img.Height, 2)
        dHash = $hash
        avgR = [Math]::Round($rSum / $pixelCount)
        avgG = [Math]::Round($gSum / $pixelCount)
        avgB = [Math]::Round($bSum / $pixelCount)
    }
    
    $bmp.Dispose()
    $img.Dispose()
}

$json = $results | ConvertTo-Json -Depth 3
[System.IO.File]::WriteAllText("$PSScriptRoot/fingerprints.json", $json, [System.Text.Encoding]::UTF8)
Write-Host "Fingerprints successfully computed for $($results.Count) fish species."
