import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * ReparAuto mobile app config.
 *
 * Native Firebase credentials are NOT committed. They live in `./firebase/`
 * and are wired into each build through `googleServicesFile` below:
 *   - iOS:     firebase/GoogleService-Info.plist
 *   - Android: firebase/google-services.json
 *
 * See `firebase/README.md` for how to obtain and place these files.
 *
 * The bundle identifier / package name is `com.recargarage` on both platforms.
 */

const BUNDLE_ID = 'com.recargarage';

// Reversed iOS OAuth client id used by Google Sign-In. Read it from the plist
// (key REVERSED_CLIENT_ID) and expose it here, e.g. in `.env`:
//   GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.XXXXXXXX-YYYY
const GOOGLE_IOS_URL_SCHEME =
  process.env.GOOGLE_IOS_URL_SCHEME ?? 'com.googleusercontent.apps.REPLACE_ME';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ReparAuto',
  slug: 'reparauto',
  scheme: 'reparauto',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: '#ffffff',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: true,
    googleServicesFile: './firebase/GoogleService-Info.plist',
    // Required for Sign in with Apple (App Store Guideline 4.8).
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: BUNDLE_ID,
    googleServicesFile: './firebase/google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    // No app-level permissions are declared. The gallery uses the system Photo
    // Picker (no permission on Android 13+/iOS PHPicker). The CAMERA permission
    // is contributed by expo-image-picker's own manifest and requested at
    // runtime only when the user taps "Tirar foto". Location (Fase 5) and
    // notifications (Fase 4) arrive with their features.
    permissions: [],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-apple-authentication',
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    [
      'expo-build-properties',
      {
        // React Native Firebase requires static frameworks on iOS.
        ios: { useFrameworks: 'static' },
        android: {},
      },
    ],
    [
      '@react-native-google-signin/google-signin',
      { iosUrlScheme: GOOGLE_IOS_URL_SCHEME },
    ],
    [
      'expo-image-picker',
      {
        // Gallery uses the system Photo Picker → no photo-library permission
        // (avoids the Google Play "Photo & Video Permissions" declaration).
        // We never record audio, so block the microphone permission too.
        photosPermission: false,
        microphonePermission: false,
        cameraPermission:
          'A ReparAuto usa a câmara apenas quando tira uma foto para o seu anúncio.',
      },
    ],
    // NOTE: expo-location (Fase 5) and expo-notifications (Fase 4) plugins are
    // added when those features ship, so the build only declares permissions
    // it actually uses.
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 180,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      // Fill in after `eas init`.
      projectId: process.env.EAS_PROJECT_ID ?? undefined,
    },
  },
});
