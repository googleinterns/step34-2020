import firebase from 'firebase/app';
import 'firebase/database';
import { Deferred } from '@firebase/util';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "step-34-2020.firebaseapp.com",
  databaseURL: "https://step-34-2020.firebaseio.com",
  projectId: "step-34-2020",
  storageBucket: "step-34-2020.appspot.com",
  messagingSenderId: "168284667240",
  appId: "1:168284667240:web:475e77e776aa91615caadd",
  measurementId: "G-NSZ58Z15HG"
};

const testConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "step-34-2020.firebaseapp.com",
  databaseURL: "https://step-34-2020-test.firebaseio.com",
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
      // Check if we are running on development or production
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        // Development	
        // Make the default app the config
        this.defaultApp = firebase.initializeApp(testConfig);
        
        // Make the users app with a different database url
        this.usersApp = firebase.initializeApp({ 
          databaseURL: "https://step-34-2020-test.firebaseio.com/"
        }, 'users-app');

        // Make the events app with a different database url
        this.eventsApp = firebase.initializeApp({ 
          databaseURL: "https://step-34-2020-test.firebaseio.com/"
        }, 'events-app');

        // Get references from each app
        this.sessionsRef = firebase.database();
        this.userRef = this.usersApp.database().ref('user-info/');
        this.eventsRef =  this.eventsApp.database().ref('events/'); 
        this.storageRef = firebase.storage().ref();

      } else {
        // Production
        // Make the default app the config
        this.defaultApp = firebase.initializeApp(config);
        
        // Make the users app with a different database url
        this.usersApp = firebase.initializeApp({ 
          databaseURL: "https://step-34-2020-user-info.firebaseio.com/"
        }, 'users-app');

        // Make the events app with a different database url
        this.eventsApp = firebase.initializeApp({ 
          databaseURL: "https://step-34-2020-events.firebaseio.com/"
        }, 'events-app');

        // Get references from each app
        this.sessionsRef = firebase.database();
        this.userRef = this.usersApp.database().ref();
        this.eventsRef =  this.eventsApp.database().ref();
        this.storageRef = firebase.storage().ref();
      }

      // Start the session
      this.startSession();
    }
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

  // Requests a new user to the backend given the required parameters, the path of the sessionid + requestid, 
  // and a success callback.
  requestUserSignUpAndListenForResponse(email, password, name) {
    var requestId = this.generateRequestId();
    var path = this.sessionId + "/" + requestId;
    // Send a request under the sessionid
    this.sessionsRef.ref('REQUESTS').child(path).set({
      email: email,
      password: password,
      name: name,
      code: 1
    });
   
    // Setup deferred
    const deferred = new Deferred();
    
    var ref = this.sessionsRef;
    var sessionId = this.sessionId;

    // Listen for responses under the RESPONSES path
    var listener = ref.ref('RESPONSES').child(sessionId).on('child_added', async function(snapshot) {
      if (snapshot.key === requestId) {
        // Get the status and message
        var status = snapshot.child("status").val();
        var message = snapshot.child("message").val();
        console.log(status);
        // When the status is "success" sign in and make deferred promise true
        if (status === "success") {
          let response = await firebase.auth().signInWithEmailAndPassword(email, password);
          deferred.resolve(response);
        // When the status is "failed" show error message and deferred promise as false
        } else { 
          alert(message);
          deferred.resolve(null);
        }
      }
      // Remove the listener from this path
      ref.ref('RESPONSES').child(sessionId).off('child_added', listener);
    });
    return deferred.promise;
  }

 // Request event creation given the parameters. 
 // The first three parameters are required, the rest are optional.
 requestEventCreation(title, date, startTime, endTime, description, plusCode, location, locationName, files = "", category, organization = "", invitedAttendees = "", uid) {
    var requestId = this.generateRequestId();
    var path = this.sessionId + "/" + requestId;
    
    // Send a request under the sessionid
    this.sessionsRef.ref('REQUESTS').child(path).set({
      code: 5,
      uid: uid,
      title: title,
      date: date,
      startTime: startTime,
      endTime: endTime,
      description: description,
      plusCode: plusCode,
      location: location,
      locationName: locationName,
      imagePaths: files,
      category: category,
      organization: organization,
      attendees: invitedAttendees
    });
   
    // Setup deferred
    const deferred = new Deferred();
    this.handleResponses(requestId, deferred);
    return deferred.promise;
  }

  // Request event edit given the parameters. 
 // all parameters are optional except credentials and eventId
 requestEventUpdate(eventId, title, date, startTime, endTime, description, plusCode, location, locationName, files = "", category, organization = "", invitedAttendees = "", uid) {

  //To be completed by John
  console.log("update")
}

  handleResponses(requestId, deferred, successCallback = this.defaultSuccessCallback, failureCallback = this.defaultFailureCallback) {

    var ref = this.sessionsRef;
    var sessionId = this.sessionId;


    // Listen for responses under the RESPONSES path
    var listener = ref.ref('RESPONSES').child(sessionId).on('child_added', function(snapshot) {
      if (snapshot.key === requestId) {
        // Get the status and message
        var status = snapshot.child("status").val();
        //var message = snapshot.child("message").val();
        console.log(status);
        // When the status is "success" make deferred promise true
        if (status === "success") {
          successCallback();
          deferred.resolve(true);
        // When the status is "failed" show error message and deferred promise as false
        } else { 
          failureCallback();
          deferred.resolve(false);
        }
      }
      // Remove the listener from this path
      ref.ref('RESPONSES').child(sessionId).off('child_added', listener);
    });
  }

  defaultSuccessCallback() {
    console.log("success");
  }

  defaultFailureCallback() {
    console.log("failed");
  }

  // Generates a unique 16 digit id which is mainly used for requests
  generateRequestId() {
    var id = "";
    var i;
    for (i = 0; i < 16; i++){
      var digit = Math.floor(Math.random()*10);
      id += digit;
    }
    return id;
  }

  // Gets all uploaded images and puts them in the given path. Returns all urls
  // If one image upload fails then all the uploads fail.
  async uploadImagesToPath(images, path) {
    // Setup url array and uploadTask
    var urls = [];
    var uploadTask = this.storageRef.child(path);
    // Traverse through the array of images
    for (var i = 0; i < images.length; i++) {
      // Upload image and wait to get a url
      let url = await this.uploadImage(images[i], uploadTask.child(i + ""));
      console.log(url);
      // If a url is null then return
      if (url == null) {
        return;
      // add url to array of urls
      } else {
        urls[i] = url;
      }
    }
    return urls;
  }

  // Uploads a single image given the image and the upload task
  async uploadImage(image, uploadTask) {
    var deferred = new Deferred();
    uploadTask.put(image).on('state_changed', function(snapshot){
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
        default:
          break;
      }
    }, function(error) {
      // Handle unsuccessful uploads
      switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          alert("Don't have permission to upload images, are you logged in? Cancelling event creation...");
          break;
        case 'storage/canceled':
          // User canceled the upload
          alert("Cancelled upload. Cancelling event creation...");
          break;
        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          alert("Unknown error. Cancelling event creation...");
          console.log(error.serverResponse);
          break;
        default:
            break;
      }
      deferred.resolve(null);
    }, function() {
        // Handle successful uploads on complete
        uploadTask.getDownloadURL().then(function(downloadURL) {
          deferred.resolve(downloadURL);
        });
    });
    return deferred.promise;
  }
}

export default Firebase;
