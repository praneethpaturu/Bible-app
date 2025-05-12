# Bible Chat Mobile App

## Overview
This is a React Native mobile application for Bible Chat, providing users with an AI-powered Bible study companion. The app allows users to ask questions about scripture, browse the Bible, and save their favorite insights.

## Features
- Authentication system with user profiles
- Interactive AI chat interface for Bible questions
- Bible text browsing functionality
- Premium subscription model with Stripe payment integration
- Saved conversations and bookmarks

## Setup Instructions

### Prerequisites
- Node.js (v14 or newer)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation
1. Clone the repository
2. Navigate to the project directory: `cd BibleChatMobile`
3. Install dependencies: `npm install` or `yarn install`
4. Update the Supabase configuration in `src/utils/supabase.ts` with your project credentials

### Running the App
- For iOS: `npx react-native run-ios`
- For Android: `npx react-native run-android`

## Environment Variables
Create a `.env` file in the root directory with the following variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Project Structure
- `/src/screens` - All app screens organized by feature
- `/src/utils` - Utility functions and configuration
- `/src/components` - Reusable UI components

## Supabase Integration
The app uses Supabase for:
- Authentication
- User data storage
- Edge functions for Stripe integration

## Stripe Integration
Payment processing is handled through Stripe, with checkout sessions created via Supabase Edge Functions.

## Deep Linking
The app supports deep linking for handling payment success/cancel redirects from Stripe.

### Setting Up Deep Linking

#### For iOS
1. Add the following to your `Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>biblechatapp</string>
    </array>
  </dict>
</array>
```

#### For Android
1. Add the following to your `AndroidManifest.xml` inside the `<activity>` tag:
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="biblechatapp" />
</intent-filter>
```

### Testing Deep Links
- iOS: `xcrun simctl openurl booted biblechatapp://success?status=success`
- Android: `adb shell am start -W -a android.intent.action.VIEW -d "biblechatapp://success?status=success" com.yourpackagename`
