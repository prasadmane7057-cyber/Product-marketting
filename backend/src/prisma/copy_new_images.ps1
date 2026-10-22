$srcDir = "C:\Users\Admin\.gemini\antigravity-ide\brain\57c52432-1f05-4b6b-8a7a-e62b5601cbbf\.user_uploaded"
$bUploads = "c:\Users\Admin\.gemini\antigravity-ide\scratch\novamarket\backend\public\uploads"
$fUploads = "c:\Users\Admin\.gemini\antigravity-ide\scratch\novamarket\frontend\public\uploads"

Copy-Item (Join-Path $srcDir "media_1792642178167.png") (Join-Path $bUploads "aftershave-lotion-pedestal.png") -Force
Copy-Item (Join-Path $srcDir "media_1792642178167.png") (Join-Path $fUploads "aftershave-lotion-pedestal.png") -Force

Copy-Item (Join-Path $srcDir "media_1792642203549.png") (Join-Path $bUploads "aftershave-lotion-lifestyle-man.png") -Force
Copy-Item (Join-Path $srcDir "media_1792642203549.png") (Join-Path $fUploads "aftershave-lotion-lifestyle-man.png") -Force

Copy-Item (Join-Path $srcDir "media_1792642240555.png") (Join-Path $bUploads "aftershave-lotion-aloe-nature.png") -Force
Copy-Item (Join-Path $srcDir "media_1792642240555.png") (Join-Path $fUploads "aftershave-lotion-aloe-nature.png") -Force

Copy-Item (Join-Path $srcDir "media_1792642266807.png") (Join-Path $bUploads "aftershave-lotion-water-splash.png") -Force
Copy-Item (Join-Path $srcDir "media_1792642266807.png") (Join-Path $fUploads "aftershave-lotion-water-splash.png") -Force

Copy-Item (Join-Path $srcDir "media_1792642124342.jpg") (Join-Path $bUploads "aftershave-lotion-features-collage.jpg") -Force
Copy-Item (Join-Path $srcDir "media_1792642124342.jpg") (Join-Path $fUploads "aftershave-lotion-features-collage.jpg") -Force

Write-Host "Copied all 5 images successfully!"
