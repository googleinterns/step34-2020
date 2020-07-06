import firebase from 'firebase';

// Initializes user database
const userConfig = {
  apiKey: "AIzaSyAW6O_Ijs3yQMP13rC6IDnH9oTJAU0gH8E",
  authDomain: "step-34-2020.firebaseapp.com",
  databaseURL: "https://step-34-2020-user-info.firebaseio.com",
  projectId: "step-34-2020",
  storageBucket: "step-34-2020.appspot.com",
  messagingSenderId: "168284667240",
  appId: "1:168284667240:web:475e77e776aa91615caadd",
  measurementId: "G-NSZ58Z15HG"
};

firebase.initializeApp(userConfig);

export default firebase;
export const userdb = firebase.database();
