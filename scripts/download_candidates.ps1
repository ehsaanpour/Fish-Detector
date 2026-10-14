$wc = New-Object System.Net.WebClient
$wc.Headers.Add("User-Agent", "Mozilla/5.0")

$urls = @{
    "noaa_mahimahi.png" = "https://www.fisheries.noaa.gov/s3/styles/original/s3/2022-08/640x427-Mahimahi-NOAAFisheries.png?itok=tp6TjGnu"
    "fishbase_mahimahi.jpg" = "https://www.fishbase.se/images/species/Cohip_ud.jpg"
}

foreach ($entry in $urls.GetEnumerator()) {
    try {
        $dest = "assets/fish/$($entry.Key)"
        $wc.DownloadFile($entry.Value, $dest)
        $fi = Get-Item $dest
        Write-Host "Downloaded $($entry.Key): $($fi.Length) bytes"
    } catch {
        Write-Host "Failed $($entry.Key): $($_.Exception.Message)"
    }
}
