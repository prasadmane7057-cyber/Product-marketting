Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\Admin\.gemini\antigravity-ide\brain\57c52432-1f05-4b6b-8a7a-e62b5601cbbf\.user_uploaded\media_1792639414321.png"
$outDir1 = "c:\Users\Admin\.gemini\antigravity-ide\scratch\novamarket\backend\public\uploads"
$outDir2 = "c:\Users\Admin\.gemini\antigravity-ide\scratch\novamarket\frontend\public\uploads"

if (!(Test-Path $outDir1)) { New-Item -ItemType Directory -Force -Path $outDir1 | Out-Null }
if (!(Test-Path $outDir2)) { New-Item -ItemType Directory -Force -Path $outDir2 | Out-Null }

Copy-Item $srcPath (Join-Path $outDir1 "aftershave-lotion-full.png") -Force
Copy-Item $srcPath (Join-Path $outDir2 "aftershave-lotion-full.png") -Force
Copy-Item $srcPath (Join-Path $outDir1 "aftershave-lotion-primary.png") -Force
Copy-Item $srcPath (Join-Path $outDir2 "aftershave-lotion-primary.png") -Force

$img = [System.Drawing.Image]::FromFile($srcPath)

# 1. Bottle Crop (Left Side)
$rectBottle = New-Object System.Drawing.Rectangle(0, 0, 380, 682)
$bmpBottle = New-Object System.Drawing.Bitmap(380, 682)
$gBottle = [System.Drawing.Graphics]::FromImage($bmpBottle)
$gBottle.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gBottle.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, 380, 682)), $rectBottle, [System.Drawing.GraphicsUnit]::Pixel)
$gBottle.Dispose()
$bmpBottle.Save((Join-Path $outDir1 "aftershave-lotion-bottle.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmpBottle.Save((Join-Path $outDir2 "aftershave-lotion-bottle.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmpBottle.Dispose()

# 2. Label Crop (Right Side)
$rectLabel = New-Object System.Drawing.Rectangle(360, 150, 655, 370)
$bmpLabel = New-Object System.Drawing.Bitmap(655, 370)
$gLabel = [System.Drawing.Graphics]::FromImage($bmpLabel)
$gLabel.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gLabel.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, 655, 370)), $rectLabel, [System.Drawing.GraphicsUnit]::Pixel)
$gLabel.Dispose()
$bmpLabel.Save((Join-Path $outDir1 "aftershave-lotion-label.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmpLabel.Save((Join-Path $outDir2 "aftershave-lotion-label.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmpLabel.Dispose()

$img.Dispose()
Write-Host "Images saved successfully!"
