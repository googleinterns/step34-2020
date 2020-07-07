import firebase from 'firebase/app';
import 'firebase/database';
import { Deferred } from '@firebase/util';

const config = {
  apiKey: "AIzaSyAW6O_Ijs3yQMP13rC6IDnH9oTJAU0gH8E",
  authDomain: "step-34-2020.firebaseapp.com",
  databaseURL: "https://step-34-2020.firebaseio.com",
  projectId: "step-34-2020",
  storageBucket: "step-34-2020.appspot.com",
  messagingSenderId: "168284667240",
  appId: "1:168284667240:web:475e77e776aa91615caadd",
  measurementId: "G-NSZ58Z15HG"
};

class Firebase {
  constructor() {
    // Check if there are existing firebase apps already initialized
    if (!firebase.apps.length) {
      // Make the default app the config
      this.defaultApp = firebase.initializeApp(config);
      
      // Make the users app with a different database url
      this.usersApp = firebase.initializeApp({ 
        databaseURL: "https://step-34-2020-user-info.firebaseio.com"
      }, 'users-app');

      // Make the events app with a different database url
      this.eventsApp = firebase.initializeApp({ 
        databaseURL: "https://step-34-2020-events.firebaseio.com"
      }, 'events-app');

      // Get references from each app
      this.sessionsRef = firebase.database();
      this.userRef = this.usersApp.database();
      this.eventsRef =  this.eventsApp.database();

      // Start the session
      this.startSession();
    }
  }

  completionFunction() {
    console.log("Hooray!!");
  }

  // Starts the user session. This is where the front end gets the session id
  async startSession() {
    // Push a key under 'inbox' in the sessions database
    var push = this.sessionsRef.ref('inbox/').push();
    // Get the push key in string form
    this.pushId = push.key;
    // Push the key and set the id field as empty for now
    push.set({
      id: ''
    });

    // Wait for the session id to be sent from the back end
    this.sessionId = await this.readDataSessionId();
    console.log("sessionId is " + this.sessionId);
  }

  // Reads in the new session id that the server gives
  async readDataSessionId() {
    // Create a new Deferred promise
    const deferred = new Deferred();

    var ref = this.sessionsRef;
    var pushId = this.pushId;

    // Create a listener for when the path 'inbox/id' has changed. This will be when the session id will be recieved
    var listener = ref.ref('inbox/' + pushId).on('child_changed', function(snapshot) {
      // Get id and remove the pushed key from the inbox
      var id = snapshot.val(); 
      firebase.database().ref('inbox/' + pushId).remove();

      // Resolve the promise 
      deferred.resolve(id);

      // Remove the listener from this path
      ref.ref('inbox/' + pushId).off('child_changed', listener);
    });
    return deferred.promise;
  }

  // Generates a unique 16 digit id which is mainly used for requests
  generateRequestId() {
    var id = "";
    var i;
    for (i = 0; i < 16; i++){
      var digit = Math.floor(Math.random()*10);
      id = id.concat(digit);
    }
    return id;
  }
  // Requests a new user to the backend given the required parameters, the path of the sessionid + requestid, 
  // and a completion callback.
  requestUserSignUpAndListenForResponse(email, password, name, path, completionFunction) {
    // Send a request under the sessionid
    this.sessionsRef.ref('REQUESTS').child(path).set({
      email: email,
      password: password,
      name: name,
      code: 1
    });

    
    // Listen for responses under the RESPONSES path
    this.sessionsRef.ref('RESPONSES').child(path).on('child_added', function(snapshot) {
      var status = snapshot.child("status").val();
      var message = snapshot.child("message").val();
      alert("before")
      // When the status is successful then call the completion callback
      // Also sign the user in
      if (status === "success") {
        alert(status)
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode === 'auth/wrong-password') {
            alert('Wrong password.');
          } else {
            console.error(errorMessage);
          }
        });
        completionFunction();
      } else { 
        console.log("Damn " + message);
      }
    });
    alert("after")
  }
}



export default Firebase;
