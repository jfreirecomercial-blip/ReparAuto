import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { STORAGE_KEY_USER } from './constants';

// ============ FIREBASE CONFIG ============
// Estas chaves são públicas (necessárias para Firebase Web SDK)
const firebaseConfig = {
  apiKey: 'AIzaSyDQC9m8SYHsZbeEG-G-b708JFbtUV9knq8',
  authDomain: 'reparauto-site.firebaseapp.com',
  projectId: 'reparauto-site',
  storageBucket: 'reparauto-site.firebasestorage.app',
  messagingSenderId: '707836120678',
  appId: '1:707836120678:web:4c18eee236e955a75767a7',
  measurementId: 'G-MTSTFD5MJ5'
};

// Inicializar Firebase apenas se não estiver já inicializado
let app = null;
let auth = null;

function getFirebaseApp() {
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      // Se já foi inicializado, ignora
      if (e.code !== 'app/duplicate-app') throw e;
    }
  }
  return app;
}

function getFirebaseAuth() {
  if (!auth) {
    getFirebaseApp();
    auth = getAuth(app);
  }
  return auth;
}

// ============ AUTH SIMULADA (FALLBACK) ============

/**
 * Login simulado (localStorage) - usado quando Firebase não está configurado
 */
export function loginSimulado(nome, email) {
  const user = { name: nome, email };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  return user;
}

/**
 * Logout simulado
 */
export function logoutSimulado() {
  localStorage.removeItem(STORAGE_KEY_USER);
}

/**
 * Obtém usuário logado do localStorage
 */
export function getUsuarioLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USER));
  } catch {
    return null;
  }
}

// ============ FIREBASE AUTH (quando configurado) ============

/**
 * Login com email/senha via Firebase
 */
export async function loginComEmail(email, password) {
  const fbAuth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(fbAuth, email, password);
  return result.user;
}

/**
 * Criar conta com email/senha
 */
export async function criarConta(email, password) {
  const fbAuth = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(fbAuth, email, password);
  return result.user;
}

/**
 * Login com Google
 */
export async function loginComGoogle() {
  const fbAuth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(fbAuth, provider);
  return result.user;
}

/**
 * Logout Firebase
 */
export async function logoutFirebase() {
  const fbAuth = getFirebaseAuth();
  await signOut(fbAuth);
}

/**
 * Observer de estado de autenticação
 */
export function onAuthChange(callback) {
  try {
    const fbAuth = getFirebaseAuth();
    return onAuthStateChanged(fbAuth, callback);
  } catch {
    // Se Firebase não estiver configurado, usa localStorage
    const user = getUsuarioLocal();
    callback(user);
    return () => {};
  }
}
