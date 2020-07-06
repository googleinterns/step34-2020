import firebase from 'firebase';


// Initializes event database
const eventConfig = {
  apiKey: "AIzaSyAW6O_Ijs3yQMP13rC6IDnH9oTJAU0gH8E",
  authDomain: "step-34-2020.firebaseapp.com",
  databaseURL: "https://step-34-2020-events.firebaseio.com/",
  projectId: "step-34-2020",
  storageBucket: "step-34-2020.appspot.com",
  messagingSenderId: "168284667240",
  appId: "1:168284667240:web:475e77e776aa91615caadd",
  measurementId: "G-NSZ58Z15HG"
};

firebase.initializeApp(eventConfig, "events");

export default firebase;
export const eventdb = firebase.database()