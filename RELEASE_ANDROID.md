# Android Release Guide

## Prerequisites
1.  **Google Play Developer Account**: You need a developer account ($25 one-time fee).
2.  **Expo Account**: Create a free account at [expo.dev](https://expo.dev).
3.  **EAS CLI**: Install the Expo Application Services CLI:
    ```bash
    npm install -g eas-cli
    ```

## 1. Configure Build System
Run the following command to link your project to Expo and configure the build process:
```bash
eas build:configure
```
- Select `android` when prompted.
- This will generate an `eas.json` file.

## 2. Generate a Production Build
To create an App Bundle (`.aab`) required for the Play Store:
```bash
eas build --platform android
```
- Wait for the build to complete.
- Download the `.aab` file from the provided link.

## 3. Upload to Google Play Console
1.  Go to the [Google Play Console](https://play.google.com/console).
2.  Click **Create App**.
3.  Enter your app name ("JMusic"), select **App**, **Free**, and accept the declarations.
4.  Navigate to **Production** (or **Internal Testing** for a test run).
5.  Click **Create new release**.
6.  Upload the `.aab` file you downloaded from Expo.
7.  Fill in the **Main Store Listing** (description, screenshots, icon).
    - **Short Description**: "Your personal offline music player with remote streaming support."
    - **Full Description**: describe the features like folder organization, sleep timer, etc.
8.  Complete the **App Content** section (Privacy Policy, Ads, Content Ratings).
    - **Privacy Policy**: Since you don't collect user data, you can generate a simple policy stating that all data is stored locally on the device.
    - **Permissions**: Explain that storage permissions are needed to play local music files.

## 4. Launch!
Once all sections are complete and the release is reviewed (which can take a few days), your app will be live on the Play Store!

## Troubleshooting
- If the build fails due to missing assets, check `app.json` paths.
- If the Play Console rejects the upload, ensure the package name (`com.logandoesthings.jmusic`) matches what you entered when creating the app entry.
