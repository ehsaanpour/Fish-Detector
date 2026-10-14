# Build and Packaging script for Market Fish Inspector
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Market Fish Inspector - Android Store Packaging Guide" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. GOOGLE PLAY STORE (Android App Bundle - .aab):" -ForegroundColor Green
Write-Host "   Run: npx eas-cli build --platform android --profile production"
Write-Host "   Generates an optimized, signed .aab bundle with dynamic asset delivery."
Write-Host ""
Write-Host "2. CAFE BAZAAR & MYKET (Universal Standalone .apk):" -ForegroundColor Green
Write-Host "   Run: npx eas-cli build --platform android --profile bazaar_myket_apk"
Write-Host "   Generates a standalone release .apk suitable for direct uploading to regional Iranian app stores."
Write-Host ""
Write-Host "3. LOCAL ANDROID PREBUILD (Offline Gradle Build):" -ForegroundColor Green
Write-Host "   Run: npx expo prebuild --platform android"
Write-Host "   Then inside android/: ./gradlew assembleRelease"
Write-Host "   Output: android/app/build/outputs/apk/release/app-release.apk"
Write-Host ""
Write-Host "4. LOCAL LIVE PREVIEW / WEB TEST:" -ForegroundColor Green
Write-Host "   Run: npm run web"
Write-Host "   Opens the full app in your default browser for interactive testing."
Write-Host "==========================================================" -ForegroundColor Cyan
