Get-ChildItem -Path "packages/parser/src" -Recurse -Filter *.ts | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    $newContent = $content -replace '(from\s+[''"]\.[^''"]+)\.js([''"])', '$1$2'
    if ($content -ne $newContent) {
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "Fixed: $($_.Name)"
    }
}
