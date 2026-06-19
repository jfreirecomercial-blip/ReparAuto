# Firebase native credentials

This folder holds the **native** Firebase config files that `@react-native-firebase`
needs at build time. They are wired into every build by `app.config.ts`:

```ts
ios.googleServicesFile     = './firebase/GoogleService-Info.plist'
android.googleServicesFile = './firebase/google-services.json'
```

Both the iOS and Android apps use the bundle id / package name **`com.recargarage`**.

## Files

| File | Platform | Committed? |
| --- | --- | --- |
| `google-services.json` | Android | ❌ gitignored — drop the real file here |
| `GoogleService-Info.plist` | iOS | ❌ gitignored — drop the real file here |
| `google-services.json.example` | Android | ✅ template |
| `GoogleService-Info.plist.example` | iOS | ✅ template |

The real files are **not** committed (see `.gitignore`). On CI/EAS, provide them
as [EAS file secrets](https://docs.expo.dev/build-reference/variables/#using-secrets-in-environment-variables)
or commit them to a private channel — never to a public repo.

## How to obtain them

1. Open the [Firebase Console](https://console.firebase.google.com/) → project **`reparauto-site`**.
2. **Project Settings** (gear icon) → **Your apps**.
3. Add (or select) the apps registered with bundle id **`com.recargarage`**:
   - **iOS app** → download `GoogleService-Info.plist`.
   - **Android app** → download `google-services.json`.
   - For Android, also add your app's SHA-1 / SHA-256 signing certificate
     fingerprints (needed for Google Sign-In). Get them from
     `eas credentials` or `keytool`.
4. Place both files in **this folder**, with these exact names:
   - `firebase/GoogleService-Info.plist`
   - `firebase/google-services.json`
5. Set the Google Sign-In env vars (see `../.env.example`):
   - `GOOGLE_IOS_URL_SCHEME` = the `REVERSED_CLIENT_ID` from the plist.
   - `GOOGLE_WEB_CLIENT_ID` = the `client_type: 3` OAuth client id from
     `google-services.json`.
6. Rebuild the native project: `npx expo prebuild --clean` then `npx expo run:ios` / `run:android`,
   or trigger an EAS build.

> The same Firebase project (`reparauto-site`) powers the web app, so the app
> shares the same Firestore data, Auth users, Storage bucket and security rules.

## Google Sign-In on Android — SHA-1 (important)

Google Sign-In on Android validates the app's signing certificate. If the SHA-1
of the running build isn't registered in Firebase you get `DEVELOPER_ERROR`.

To keep this stable across machines and CI, this repo ships a **shared debug
keystore** at `mobile/credentials/debug.keystore`, installed into the native
project on every prebuild by `plugins/withDebugKeystore.js`. So **all debug
builds sign with the same key** — only one SHA-1 to register:

```
Debug SHA-1:  BB:AF:89:38:31:00:27:96:37:CB:1A:D2:A9:65:2D:BD:8D:06:24:6B
```

This fingerprint is already registered for `com.recargarage`. A new dev just
needs to `npm install` + `npx expo prebuild` — no per-machine SHA-1 setup.

> The debug keystore is **not** a secret (standard `androiddebugkey` / `android`),
> so committing it is fine. For **release / EAS** builds the keystore is
> different — register that SHA-1 too (get it from `eas credentials`).
