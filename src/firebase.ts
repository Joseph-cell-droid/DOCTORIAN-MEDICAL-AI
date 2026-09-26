import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

const config: any = firebaseConfig;

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

let firestoreInstance: any = null;
try {
  if (config.firestoreDatabaseId) {
    try {
      firestoreInstance = getFirestore(app, config.firestoreDatabaseId);
    } catch (e) {
      console.warn("[FIREBASE] Could not initialize named Firestore database, falling back to default instance:", e);
      firestoreInstance = getFirestore(app);
    }
  } else {
    firestoreInstance = getFirestore(app);
  }
} catch (err) {
  console.warn("[FIREBASE] Firestore client initialization bypassed or offline:", err);
  firestoreInstance = null;
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
// Add Google Workspace Gmail scope for login and security alerts
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');

// In-memory cache for Google OAuth access token (per workspace integration guidelines)
let cachedAccessToken: string | null = null;

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Clear token on sign out
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedAccessToken = null;
  }
});

export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

export const facebookProvider = new FacebookAuthProvider();
export const instagramProvider = new OAuthProvider('instagram.com');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const syncUserProfile = async (user: User) => {
  if (!db) {
    console.warn("Firestore instance unavailable. Bypassing cloud profile sync.");
    return;
  }
  // We wrap the Firestore sync in a global try-catch to ensure login works 
  // even if the Firebase Project Database API has expired or is disabled.
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.log("Creating new user profile for:", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'user',
        createdAt: new Date().toISOString()
      });
    }
  } catch (e) {
    console.warn("Firestore sync bypassed due to API or permission error. Baseline authentication still functional.", e);
  }
};

export const signInWithGoogle = async () => {
  console.log("Starting Google Sign-In with Gmail permissions...");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Successfully signed in with Google:", user.email);

    try {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        console.log("[FIREBASE] Cached Google Workspace access token in memory");
      }
    } catch (tokenErr) {
      console.warn("[FIREBASE] Could not extract Google OAuth credential:", tokenErr);
    }
    
    await syncUserProfile(user);
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    // Provide a more user-friendly error message if it's a popup blocker issue
    if (error instanceof Error && error.message.includes('popup-blocked')) {
      throw new Error("The sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
    }
    throw error;
  }
};

export const signInWithSocial = async (provider: GoogleAuthProvider | GithubAuthProvider | FacebookAuthProvider | OAuthProvider) => {
  console.log(`Starting social sign-in with provider: ${provider.providerId}...`);
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    try {
      if (provider instanceof GoogleAuthProvider || provider.providerId === 'google.com') {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          cachedAccessToken = credential.accessToken;
          console.log("[FIREBASE] Cached Google Workspace access token in memory");
        }
      }
    } catch (tokenErr) {
      console.warn("[FIREBASE] Could not extract OAuth credential:", tokenErr);
    }

    await syncUserProfile(user);
    
    return user;
  } catch (error) {
    console.error(`Error signing in with ${provider.providerId}`, error);
    if (error instanceof Error && error.message.includes('popup-blocked')) {
      throw new Error("The sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
    }
    throw error;
  }
};

export const logout = async () => {
  cachedAccessToken = null;
  return signOut(auth);
};
