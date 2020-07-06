import firebase from 'firebase/app';
import 'firebase/database';
import { Deferred } from '@firebase/util';

const config = {
  apiKey: "API_KEY_HERE",
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
    if (!firebase.apps.length) {
      this.defaultApp = firebase.initializeApp(config);
      this.usersApp = firebase.initializeApp({ 
	databaseURL: "https://step-34-2020-user-info.firebaseio.com"
      }, 'users-app');

      this.eventsApp = firebase.initializeApp({ 
	databaseURL: "https://step-34-2020-events.firebaseio.com"
      }, 'events-app');
    }
    this.sessionsRef = firebase.database();
    this.userRef = this.usersApp.database();
    this.eventsRef =  this.eventsApp.database();
    this.startSession();
  }

  completionFunction() {
    console.log("Hooray!!");
  }

  async startSession() {
    var push = this.sessionsRef.ref('inbox/').push();
    this.pushId = push.key;
    push.set({
      id: ''
    });
    this.sessionId = await this.readDataSessionId();
    console.log(this.sessionId);
    //var path = this.sessionId + generateUniqueId() + "";
    //this.requestUserSignUpAndListenForResponse("test1@gmail.com", "password", "test", path, this.completionFunction());
  }

  async readDataSessionId() {
    const deferred = new Deferred();
    var ref = this.sessionsRef;
    var pushId = this.pushId;
    var listener = ref.ref('inbox/' + pushId).on('child_changed', function(snapshot) {
      var id = snapshot.val(); 
      firebase.database().ref('inbox/' + pushId).remove();
      deferred.resolve(id);
      ref.ref('inbox/' + pushId).off('child_changed', listener);
    });
    return deferred.promise;
  }

  // TODO: Clean up
  requestUserSignUpAndListenForResponse(email, password, name, path, completionFunction) {
    firebase.database().ref('REQUESTS').child(path).set({
      email: email,
      password: password,
      name: name,
      code: 1
    });

    firebase.database().ref('RESPONSES').child(path).on('child_added', function(snapshot) {
      var status = snapshot.child("status").val();
      var message = snapshot.child("message").val();

      if (status === "success") {
	completionFunction();
      } else { 
	console.log(message);
      }
    });
  }
}


function generateUniqueId() {
  var id = "";
  var i;
  for (i = 0; i < 16; i++){
    var digit = Math.floor(Math.random()*10);
    id = id.concat(digit);
  }
  return id;
}

export default Firebase;
