const FIREBASE_APP_URL = 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
const FIREBASE_AUTH_URL = 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

export const firebaseConfig = {
  projectId: 'vanea-5ffea',
  appId: '1:204067098240:web:38eebcd5541a3552b6a065',
  apiKey: 'AIzaSyBAFBmQz3Li_8vLTcsgDh9Emc5Zd-8_ITM',
  authDomain: 'vanea-5ffea.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-25b3cfd4-bfd2-4e9b-bdf2-e02bb831ab34',
  storageBucket: 'vanea-5ffea.firebasestorage.app',
  messagingSenderId: '204067098240',
  measurementId: '',
};

let firebaseClientPromise;

export async function getFirebaseAuthClient() {
  if (!firebaseClientPromise) {
    firebaseClientPromise = Promise.all([
      import(/* @vite-ignore */ FIREBASE_APP_URL),
      import(/* @vite-ignore */ FIREBASE_AUTH_URL),
    ]).then(([appMod, authMod]) => {
      const app = appMod.getApps().length ? appMod.getApps()[0] : appMod.initializeApp(firebaseConfig);
      const auth = authMod.getAuth(app);
      const provider = new authMod.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      return { app, auth, provider, ...authMod };
    });
  }
  return firebaseClientPromise;
}

export async function signInWithGooglePopup() {
  const { auth, provider, signInWithPopup } = await getFirebaseAuthClient();
  return signInWithPopup(auth, provider);
}

export async function signOutGoogle() {
  const { auth, signOut } = await getFirebaseAuthClient();
  return signOut(auth);
}
