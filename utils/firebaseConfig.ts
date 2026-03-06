import { getApps, initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
// Crashlytics import (React Native Firebase SDK)
import crashlytics from '@react-native-firebase/crashlytics';

const firebaseConfig = {
  apiKey: "AIzaSyD_olYPaEJtCmcBO25aNPGKbDtqAe3JI3k",
  authDomain: "comment-picker-bebc8.firebaseapp.com",
  projectId: "comment-picker-bebc8",
  storageBucket: "comment-picker-bebc8.firebasestorage.app",
  messagingSenderId: "478577646572",
  appId: "1:478577646572:web:366cc297cc99e3b894fec9",
  measurementId: "G-TR7W5HQNCP"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);

// Crashlytics ko enable karein
export const initializeCrashlytics = async () => {
  try {
    await crashlytics().setCrashlyticsCollectionEnabled(true);
    console.log('✅ Crashlytics initialized');
  } catch (error) {
    console.log('❌ Crashlytics init failed:', error);
  }
};

// Custom error logging function
export const logError = (error: Error, context?: string) => {
  console.log('🔴 Error logged to Crashlytics:', error);
  if (context) {
    crashlytics().log(`Context: ${context}`);
  }
  crashlytics().recordError(error);
};

// Custom log function
export const logCrashlytics = (message: string) => {
  crashlytics().log(message);
};

// User identifier set karein (optional)
export const setCrashlyticsUser = (userId: string) => {
  crashlytics().setUserId(userId);
};

export async function fetchAppConfig() {
  try {
    const ref = doc(db, "configs", "app_config");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      console.log("Firestore Config Loaded:", data);
      logCrashlytics('App config loaded successfully');
      return data;
    } else {
      console.log("No config document found!");
      logCrashlytics('No config document found in Firestore');
      return null;
    }
  } catch (error) {
    console.log("Firestore Config Fetch Failed:", error);
    logError(error as Error, 'fetchAppConfig');
    return null;
  }
}

export { crashlytics, db };
