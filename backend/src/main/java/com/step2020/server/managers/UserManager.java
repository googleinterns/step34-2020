// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.step2020.server.managers;

import com.step2020.server.common.*;
import com.step2020.server.servlets.*;
import static com.step2020.server.common.Constants.*;

import java.util.Map;
import java.util.HashMap;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.ChildEventListener;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.auth.oauth2.GoogleCredentials;

public class UserManager {
  
  // The currentUID this servlet is serving
  private String currentUID;

  private String sessionId;

  // The database reference for users
  private DatabaseReference usersRef;

  public UserManager(String sessionId) {
    this.sessionId = sessionId;

    if (ServletManagerServlet.isOnDeployedServer) {
      // Connect database reference
      this.usersRef = FirebaseDatabase.getInstance("https://step-34-2020-user-info.firebaseio.com").getReference(USRS);
    } else {
      // Connect to test database reference
      this.usersRef = FirebaseDatabase.getInstance("https://step-34-2020-test.firebaseio.com").getReference("user-info").child(USRS);
    }
  }

  // Creates a user and adds to the database based on the given information.
  // Checks to make sure the required fields are inputted.
  public void createUserAndAddToDatabase(String requestId, Map info) {
    String email = null;
    String password = null;
    String name = null;
    
    if (info.containsKey("email")) {
      email = info.get("email").toString();
    }

    if (info.containsKey("password")) {
      password = info.get("password").toString();
    }

    if (info.containsKey("name")) {
      name = info.get("name").toString();
    }

    if ((requestId != null && !requestId.isEmpty()) && email != null && password != null && name != null) {
      createUserAndAddToDatabase(requestId, email, password, name);
    } else {
      System.err.println("Invalid map argument or requestId null or empty");
    }
  } 

  // Creates a user and adds to database based off of the required fields.
  public void createUserAndAddToDatabase(String requestId, String email, String password, String name) {
    // Create a new account creation request
    CreateRequest request = new CreateRequest()
      .setEmail(email)
      .setEmailVerified(false)
      .setPassword(password)
      .setDisplayName(name)
      .setDisabled(false);

    System.out.println("Attempting to create user");
    
    // Attempt to create a user, otherwise handle failure.
    UserRecord userRecord = null; 
    
    try {
      userRecord = FirebaseAuth.getInstance().createUser(request);
    } catch (FirebaseAuthException e) {
      // Failed and handle the error code
      String errorCode = e.getErrorCode();
      this.handleErrorCodes(requestId, this.sessionId, errorCode);
      return;
    }
   
    // Get the uid and comfirm the creation was successful
    String uid = userRecord.getUid();
    System.out.println("Created authentication user");
    
    // Build a new user to put into the database
    User user = new User.Builder()
      .withEmail(email)
      .withName(name)
      .withUID(uid)
      .build();
    
    // Check to make sure the user is not null
    if (user == null) {
      System.err.println("Uid not specified");
      return;
    }

    // Set current uid
    this.currentUID = uid;

    // Add the user to the database
    usersRef.child(uid).setValue(user.getMapRepresentation(), new DatabaseReference.CompletionListener() {
      public void onComplete(DatabaseError error, DatabaseReference ref) {
        if (error == null) {
	  System.out.println("User created");
    	  // Send a response to the client to let them know the account has been created
	  sendSuccess(requestId, sessionId);
	} else {
	  System.out.println("User creation failed");
	  // Send a response to the client to let them know the account creation has failed
	  sendFailure(requestId, sessionId, error.getMessage());
	}	  
      }
    });
  }

  // Handles error codes give the error code for account creation
  private void handleErrorCodes(String requestId, String sessionId, String errorCode) {
    String message = "";
    switch (errorCode) {
      case "ERROR_EMAIL_ALREADY_IN_USE":
	message = "This email is already in use, please try again with another email.";
	break;	
      case "ERROR_USER_DISABLED":
	message = "This account has been diabled, please contact us for more information.";
	break;	
      case "ERROR_USER_NOT_FOUND":
	message = "This account does not exists, please sign up instead.";
	break;	
      default:
	message = "Unknown error occurred.";
    }
    this.sendFailure(requestId, sessionId, message);
  }

  // Sends a success response to the request id
  private void sendSuccess(String requestId, String sessionId) {
    String status = "success";
    String message = "";
    Map<String, String> response = ActionManager.createResponse(status, message);
    ActionManager.sendResponseAndRemoveRequest(sessionId, requestId, response);
  }

  // Sends a failure response to the request id along with a error message
  private void sendFailure(String requestId, String sessionId, String message) {
    // Send a response to the client to let them know the account creation has failed
    String status = "failed";
    Map<String, String> response = ActionManager.createResponse(status, message);
    ActionManager.sendResponseAndRemoveRequest(sessionId, requestId, response);
  }
}

