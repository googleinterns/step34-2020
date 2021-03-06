import firebase from 'firebase/app';
import 'firebase/database';
import { Deferred } from '@firebase/util';
import ReactDOM from 'react-dom';
import React from 'react';
import PopUp from './PopUp';

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

// Enums for request codes to the back end
const requestCodes = {
  CREATE_USER: 1,
  CREATE_EVENT: 5,
  UPDATE_EVENT: 6,
  DELETE_EVENT: 7
}

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
    
    // Send a request to create a user under the sessionid
    this.sessionsRef.ref('REQUESTS').child(path).set({
      email: email,
      password: password,
      name: name,
      code: requestCodes.CREATE_USER
    });
   
    // Setup deferred
    const deferred = new Deferred();
    
    var ref = this.sessionsRef;
    var sessionId = this.sessionId;

    // Listen for responses under the RESPONSES path
    var listener = ref.ref('RESPONSES').child(sessionId).on('child_added', async snapshot => {
      if (snapshot.key === requestId) {
        // Get the status and message
        var status = snapshot.child("status").val();
        var message = snapshot.child("message").val();
        // When the status is "success" sign in and make deferred promise true
        if (status === "success") {
          let response = await firebase.auth().signInWithEmailAndPassword(email, password);
          deferred.resolve(response);
        // When the status is "failed" show error message and deferred promise as false
        } else { 
          this.handlePopUp(message);
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
    
    // Send a request to create an event under the sessionid
    this.sessionsRef.ref('REQUESTS').child(path).set({
      code: requestCodes.CREATE_EVENT,
      uid: uid,
      title: title,
      date: date,
      startTime: startTime,
      endTime: endTime,
      description: description,
      plusCode: plusCode,
      location: location,
      locationName: locationName,
      imageUrls: files,
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
  // all parameters are optional except uid and eventId
  requestEventUpdate(eventId, uid, eventName = null, date = null, startTime = null, endTime = null, description = null, location = null, locationName = null, imageUrls = null, category = null, organization = null) {
    var requestId = this.generateRequestId();
    var path = this.sessionId + "/" + requestId;

    // Send in a request to update an event
    this.sessionsRef.ref('REQUESTS').child(path).set({
      code: requestCodes.UPDATE_EVENT,
      uid: uid,
      eventId: eventId,
      eventName: eventName,
      date: date,
      startTime: startTime,
      endTime: endTime,
      description: description,
      location: location,
      locationName: locationName,
      imageUrls: imageUrls,
      category: category,
      organization: organization,
    });

    // Handle the response
    const deferred = new Deferred();
    this.handleResponses(requestId, deferred);
    return deferred.promise;
  }

  handlePopUp(message) {
    ReactDOM.render(
      <div>
        <PopUp show={true} onHide={this.hidePopUp.bind(this)} message={message} />
      </div>,
      document.getElementById('popup-wrapper'))
  }

  hidePopUp() {
    const modal = document.getElementById('popup-wrapper');
    ReactDOM.unmountComponentAtNode(modal);
  }

  // Requests event deletion with the given event id and the uid
  requestEventDeletion(eventId, uid) {
    var requestId = this.generateRequestId();
    var path = this.sessionId + "/" + requestId;

    // Send in a request to delete an event
    this.sessionsRef.ref('REQUESTS').child(path).set({
      code: requestCodes.DELETE_EVENT,
      uid: uid,
      eventId: eventId
    });

    const deferred = new Deferred();
    this.handleResponses(requestId, deferred);
    return deferred.promise;
  }

  // Handles the response by passing the deferred promise and request id 
  handleResponses(requestId, deferred, successCallback = this.successCallback, failureCallback = this.failureCallback) {
    var ref = this.sessionsRef;
    var sessionId = this.sessionId;

    // Listen for responses under the RESPONSES path
    var listener = ref.ref('RESPONSES').child(sessionId).on('child_added', function(snapshot) {
      if (snapshot.key === requestId) {
        // Get the status and message
        var status = snapshot.child("status").val();
        // When the status is "success" make deferred promise true
        if (status === "success") {
          successCallback(sessionId, requestId, ref);
          deferred.resolve(true);
        // When the status is "failed" show error message and deferred promise as false
        } else { 
          failureCallback(sessionId, requestId, ref);
          deferred.resolve(true);
        // When the status is "failed" show error message and deferred promise as false
        } 
      }
      // Remove the listener from this path
      ref.ref('RESPONSES').child(sessionId).off('child_added', listener);
    });
  }

  // A callback to remove the request and print success
  successCallback(sessionId, requestId, ref) {
    ref.ref('REQUESTS').child(sessionId).child(requestId).remove();
  }

  // A callback to remove the request and print failure
  failureCallback(sessionId, requestId, ref) {
    ref.ref('REQUESTS').child(sessionId).child(requestId).remove();
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
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          break;
        default:
          break;
      }
    }, error => {
      // Handle unsuccessful uploads
      var message = "";
      switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          message = "Don't have permission to upload images, are you logged in? Cancelling event creation...";
          this.handlePopUp(message);
          break;
        case 'storage/canceled':
          // User canceled the upload
          message = "Cancelled upload. Cancelling event creation...";
          this.handlePopUp(message);
          break;
        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          message = "Unknown error. Cancelling event creation...";
          this.handlePopUp(message)
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
