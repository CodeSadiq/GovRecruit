try {
    $json = Get-Content -Raw -Encoding utf8 -Path "c:\Users\sadiq\Desktop\GovRecruit\data\nic-sc-cd-2026.json"
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/jobs" -Method Post -Body $json -ContentType "application/json; charset=utf-8"
    Write-Host "Sync Successful: $($response.success)"
} catch {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $respBody = $reader.ReadToEnd()
    Write-Host "Sync Failed. Error Body: $respBody"
}
