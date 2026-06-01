import type { CapacitorConfig } from '@capacitor/cli';

// Native shell configuration for the ReparAuto Android/iOS apps.
// The web build is produced by `npm run build:app` (Next.js static export → `out/`).
const config: CapacitorConfig = {
  appId: 'pt.reparauto.app',
  appName: 'ReparAuto',
  webDir: 'out',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    FirebaseAuthentication: {
      // The app uses the Firebase JS SDK for Firestore/auth state, so we skip
      // the plugin's native sign-in and bridge the returned credential into the
      // JS SDK via signInWithCredential (see src/lib/auth.ts).
      skipNativeAuth: true,
      providers: ['google.com', 'apple.com'],
    },
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};

export default config;
