# App Store Submission Guide

## Prerequisites

### 1. Apple Developer Account
- Sign up at https://developer.apple.com
- Cost: $99/year USD
- Processing time: Usually 24-48 hours for approval

### 2. Required Information
- [ ] App name
- [ ] App description
- [ ] Keywords for search
- [ ] Support URL (can be email: mailto:your@email.com)
- [ ] Privacy Policy URL (must be hosted publicly)
- [ ] Screenshots (required sizes):
  - 6.7" iPhone (1290 x 2796 pixels) - iPhone 15 Pro Max
  - 5.5" iPhone (1242 x 2208 pixels) - Optional but recommended
- [ ] App Icon (1024 x 1024 pixels, no transparency)
- [ ] App category (Utilities or Productivity)

---

## Step 1: Prepare Your App

### Update App Information

1. **Update capacitor.config.json**:
   ```json
   {
     "appId": "com.bowardevelopment.cooperingcalculator",
     "appName": "Woodworking Calculator",
     "version": "1.0.0",
     "buildNumber": "1"
   }
   ```

2. **Update package.json version**:
   ```json
   {
     "version": "1.0.0"
   }
   ```

3. **Host your Privacy Policy**:
   - Upload PRIVACY_POLICY.md to a public website
   - GitHub Pages is free and easy
   - Save the URL for later

---

## Step 2: Configure Xcode Project

### In Xcode:

1. **Open your project**:
   ```bash
   npx cap open ios
   ```

2. **Select the "App" target** (blue icon in left sidebar)

3. **General Tab**:
   - Display Name: `Woodworking Calculator`
   - Bundle Identifier: `com.bowardevelopment.cooperingcalculator`
   - Version: `1.0.0`
   - Build: `1`

4. **Signing & Capabilities**:
   - ✓ Automatically manage signing
   - Team: Select your Apple Developer team
   - Signing Certificate: Should auto-select "Apple Distribution"

5. **App Icon**:
   - Click on `Assets.xcassets` in left sidebar
   - Click `AppIcon`
   - Drag your 1024x1024 icon into the "App Store iOS" slot
   - Xcode will generate all required sizes

---

## Step 3: Create App Store Connect Record

1. **Go to App Store Connect**: https://appstoreconnect.apple.com

2. **Click "My Apps" → "+" → "New App"**

3. **Fill out information**:
   - Platform: iOS
   - Name: `Woodworking Calculator`
   - Primary Language: English (U.S.)
   - Bundle ID: Select `com.bowardevelopment.cooperingcalculator`
   - SKU: `coopering-calculator-001` (can be anything unique)
   - User Access: Full Access

4. **Click "Create"**

---

## Step 4: Archive and Upload

### In Xcode:

1. **Select target device**:
   - At the top, select: `Any iOS Device (arm64)`
   - NOT your physical iPhone or simulator

2. **Archive the app**:
   - Menu: `Product` → `Archive`
   - Wait for archive to complete (1-5 minutes)

3. **Organizer window opens**:
   - Select your archive
   - Click `Distribute App`

4. **Distribution method**:
   - Select: `App Store Connect`
   - Click `Next`

5. **Distribution options**:
   - Select: `Upload`
   - Click `Next`

6. **App Store Connect distribution options**:
   - ✓ Upload your app's symbols
   - ✓ Manage Version and Build Number (Xcode will handle this)
   - Click `Next`

7. **Signing**:
   - Select: `Automatically manage signing`
   - Click `Next`

8. **Review and Upload**:
   - Review the information
   - Click `Upload`
   - Wait for upload to complete (5-15 minutes depending on connection)

9. **Success**:
   - You'll see "Upload Successful"
   - Click `Done`

---

## Step 5: Complete App Store Connect Information

### Go back to App Store Connect:

1. **App Information** (left sidebar):
   - Category: `Utilities` or `Productivity`
   - Content Rights: (select appropriate option)

2. **Pricing and Availability**:
   - Price: `Free` (or set a price)
   - Availability: Select countries

3. **Prepare for Submission**:
   - Click the version (1.0.0) under "iOS App"

4. **Required Information**:

   **Screenshots**:
   - Take screenshots on your iPhone
   - Use Xcode simulator to get exact sizes
   - Upload at least 1, up to 10 per device size

   **Description**:
   ```
   Woodworking Calculator helps you create perfect pyramid structures with precision angle calculations.

   Features:
   • Calculate miter and blade angles for N-sided pyramids
   • Reference tables for compound miter cuts (3-38 sides)
   • Quick lookup for side angles from 0-90 degrees
   • Clean, easy-to-use interface
   • Works offline - no internet required

   Perfect for woodworkers, carpenters, and DIY enthusiasts working on pyramid-shaped projects.
   ```

   **Keywords**: (comma-separated, max 100 characters)
   ```
   woodworking,calculator,miter,angle,pyramid,carpenter,saw,blade,DIY
   ```

   **Support URL**:
   ```
   mailto:your@email.com
   ```

   **Marketing URL** (optional):
   ```
   (your website if you have one)
   ```

   **Privacy Policy URL**:
   ```
   https://your-hosted-privacy-policy-url.com
   ```

   **App Review Information**:
   - First Name: Your first name
   - Last Name: Your last name
   - Phone: Your phone number
   - Email: Your email
   - Notes: "This is a simple offline calculator for woodworking angles. No account required."

   **Version Release**:
   - Select: `Manually release this version`

5. **Build**:
   - Click `+ next to Build`
   - Select the build you uploaded (may take 5-10 minutes to appear)
   - Click `Done`

6. **Content Rights**:
   - Declare if you have rights to use all content

7. **Advertising Identifier**:
   - Select `No` (your app doesn't use advertising)

---

## Step 6: Submit for Review

1. **Review all information** - make sure everything is filled out

2. **Export Compliance**:
   - If prompted about encryption:
   - Select `No` (your app doesn't use encryption beyond what iOS provides)

3. **Click "Submit for Review"**

4. **Wait for Review**:
   - Average review time: 24-48 hours
   - You'll receive email updates
   - Can check status in App Store Connect

---

## After Approval

### Your app is approved! 🎉

1. **Release**:
   - Go to App Store Connect
   - Click `Release This Version`
   - App will be live within a few hours

2. **Share**:
   - App Store link: `https://apps.apple.com/app/idXXXXXXXXX`
   - Get link from App Store Connect

---

## Common Issues and Solutions

### Build Not Appearing
- Wait 10-15 minutes after upload
- Check email for processing errors
- Refresh App Store Connect page

### Missing Compliance
- If asked about encryption, select "No"
- If app uses HTTPS only for own content, select "No"

### Invalid Binary
- Check bundle ID matches exactly
- Ensure version and build numbers are higher than previous
- Verify signing certificates are valid

### Rejected During Review
- Read rejection reason carefully
- Fix issues
- Upload new build
- Resubmit

---

## Tips for Success

1. **Test thoroughly** before submitting
2. **Take quality screenshots** on actual devices
3. **Write clear description** - focus on benefits
4. **Respond quickly** to any reviewer questions
5. **Be patient** - first submission often takes longer

---

## Useful Commands

**Rebuild and sync before archiving**:
```bash
quasar build -m pwa
npx cap sync ios
npx cap open ios
```

**Increment build number** (in Xcode General tab) for each upload

---

## Need Help?

- Apple Developer Support: https://developer.apple.com/support/
- App Store Connect Help: https://help.apple.com/app-store-connect/
- Stack Overflow: https://stackoverflow.com/questions/tagged/app-store-connect

---

## Checklist

Before submitting:
- [ ] Apple Developer account active ($99/year)
- [ ] Privacy Policy hosted publicly
- [ ] App icon (1024x1024) added
- [ ] Screenshots taken (at least 1 required size)
- [ ] App description written
- [ ] Keywords selected
- [ ] Support email/URL provided
- [ ] Build uploaded successfully
- [ ] All App Store Connect fields completed
- [ ] Tested app thoroughly on real device
- [ ] Version and build numbers correct
- [ ] Signing certificates valid
