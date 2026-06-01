import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithCredential,
  updateProfile,
  deleteUser,
  type User,
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth } from './firebase';
import { isNativePlatform } from '@/lib/native/platform';

export async function loginComEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function criarConta(email: string, password: string, nome: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (nome) {
    await updateProfile(result.user, { displayName: nome });
  }
  return result.user;
}

export async function loginComGoogle(): Promise<User> {
  if (isNativePlatform()) {
    // Native Google Sign-In (popups don't work in a WebView). Bridge the
    // returned ID token into the JS SDK so Firestore/auth state stay in sync.
    const result = await FirebaseAuthentication.signInWithGoogle();
    const credential = GoogleAuthProvider.credential(result.credential?.idToken);
    const userCred = await signInWithCredential(auth, credential);
    return userCred.user;
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function loginComApple(): Promise<User> {
  // Sign in with Apple — required by Apple (Guideline 4.8) whenever a
  // third-party login (Google) is offered.
  if (isNativePlatform()) {
    const result = await FirebaseAuthentication.signInWithApple();
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: result.credential?.idToken,
      rawNonce: result.credential?.nonce,
    });
    const userCred = await signInWithCredential(auth, credential);
    return userCred.user;
  }
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutFirebase(): Promise<void> {
  if (isNativePlatform()) {
    await FirebaseAuthentication.signOut().catch(() => {});
  }
  await signOut(auth);
}

/**
 * Permanently delete the signed-in user's Firebase Auth account.
 * May reject with `auth/requires-recent-login` — the caller should then ask
 * the user to re-authenticate and try again. Firestore/Storage data must be
 * cleaned up separately (see deleteUserData in db.ts).
 */
export async function eliminarContaAuth(): Promise<void> {
  const current = auth.currentUser;
  if (!current) throw new Error('no-current-user');
  if (isNativePlatform()) {
    await FirebaseAuthentication.deleteUser().catch(() => {});
  }
  await deleteUser(current);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
