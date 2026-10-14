$url = "https://inaturalist-open-data.s3.amazonaws.com/photos/361046671/medium.jpg"
$dest = "assets/fish/test_mahimahi.jpg"

$wc = New-Object System.Net.WebClient
$wc.Headers.Add("User-Agent", "Mozilla/5.0")

try {
    $wc.DownloadFile($url, $dest)
    $fi = Get-Item $dest
    Write-Host "SUCCESS! Downloaded: $($fi.Length) bytes"
} catch {
    Write-Host "Failed: $($_.Exception.Message)"
}
