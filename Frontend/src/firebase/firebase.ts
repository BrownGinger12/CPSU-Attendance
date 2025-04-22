// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5o0jp0KndjyqzbcpPZ1K65qWZSBIs6B0",
  authDomain: "cpsu-attendance.firebaseapp.com",
  projectId: "cpsu-attendance",
  storageBucket: "cpsu-attendance.firebasestorage.app",
  messagingSenderId: "735715719123",
  appId: "1:735715719123:web:dc5ae17153b8fa07222126",
};

export const app = initializeApp(firebaseConfig);

export const firestore = getFirestore();
export const auth = getAuth();
export const imageDB = getStorage();

export async function retrieveDocument(
  collectionName: string,
  documentId: string
) {
  const docRef = doc(firestore, collectionName, documentId);
  const docVal = await getDoc(docRef);
  return docVal;
}

export async function handleLogin(email: string, password: string) {
  const user = await signInWithEmailAndPassword(auth, email, password);
  return user.user.uid;
}

export async function retrieveImage(imageID: string) {
  const imageUrl = getDownloadURL(ref(imageDB, `StudentPictures/${imageID}`));
  return imageUrl;
}

export async function deleteCollection(collectionPath: string) {
  try {
    const querySnapshot = await getDocs(collection(firestore, collectionPath));

    const deletePromises = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
    });

    await Promise.all(deletePromises);

    alert("Collection deleted successfully.");
  } catch (error) {
    alert("Error deleting collection");
  }
}

export const deleteDocument = async (
  documentId: string,
  collectionPath: string
) => {
  const documentRef = doc(collection(firestore, collectionPath), documentId);

  try {
    await deleteDoc(documentRef);
  } catch (error) {
    console.error("Error deleting document:", error);
  }
};

export const updateUserData = async (
  userId: string,
  path: string,
  userData: any
) => {
  try {
    // Reference to the document you want to update
    const userDocRef = doc(firestore, path, userId);

    // Update the document with the new data
    await updateDoc(userDocRef, userData);
    console.log("Document successfully updated!");
  } catch (error) {
    console.error("Error updating document:", error);
  }
};

export async function checkIfDocumentExists(
  collectionName: string,
  docId: string
): Promise<boolean> {
  try {
    const docRef = doc(firestore, collectionName, docId); // Reference to the document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return true; // Document exists
    } else {
      console.log("No such document!");
      return false; // Document does not exist
    }
  } catch (error) {
    console.error("Error checking document:", error);
    throw error; // Handle errors as needed
  }
}

export async function addDataToDBwithID(
  pathFirestore: string,
  data: any,
  id: string
) {
  setDoc(doc(firestore, pathFirestore, id), data);
}

export async function addDataToDB(
  pathFirestore: string,
  data: any
): Promise<string> {
  try {
    const ref = await addDoc(collection(firestore, pathFirestore), data);
    return ref.id; // Return the document ID
  } catch (error) {
    console.error("Error adding document:", error);
    throw error; // Rethrow the error for the caller to handle
  }
}
