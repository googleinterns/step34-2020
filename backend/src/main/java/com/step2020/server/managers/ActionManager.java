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
import static com.step2020.server.common.Constants.*;

import java.util.Map;
import java.util.HashMap;
import java.lang.Iterable;
import java.util.Iterator;
import java.io.IOException;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.ChildEventListener;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.MutableData;
import com.google.firebase.database.Transaction;
import com.google.firebase.database.Query;
import com.google.auth.oauth2.GoogleCredentials;

public class ActionManager {
  
  private String sessionId;

  // The user manager to access user information
  private UserManager userManager;

  // The database reference to access the database
  private DatabaseReference idRef;

  public ActionManager(String sessionId) {
    this.sessionId =  sessionId;
    // Connect database reference
    idRef = FirebaseDatabase.getInstance().getReference();
    setupUserManager();
    setupRequestListenerAndManageRequests();
  }

  // Sets up the command listener for the user to put in commands with a given code
  private void setupRequestListenerAndManageRequests() {

    // Listens for a new command
    idRef.child(RQSTS).child(this.sessionId).addChildEventListener(new ChildEventListener() {

      public void onChildAdded(DataSnapshot snapshot, String prevKey) {
	// Get data from the new command and put them in the form a map
	String key = snapshot.getKey();

	// Create an empty request value
	Map<String, String> value = new HashMap();
        
	// Get all children and make an iterator to iterate through the children
	Iterable<DataSnapshot> children = snapshot.getChildren();
	Iterator<DataSnapshot> iterator = children.iterator();

	// Iterate through each child and put each key value pair into request value
	while (iterator.hasNext()) {
	  DataSnapshot child = iterator.next();
	  String k = child.getKey();
	  String v = child.getValue().toString();
	  value.put(k, v);
	}
	// Manages the request based on given key and values from above
	manageRequests(key, value);
      }

      public void onCancelled(DatabaseError error) {}

      public void onChildChanged(DataSnapshot snapshot, String prevKey) {}

      public void onChildMoved(DataSnapshot snapshot, String prevKey) {}

      public void onChildRemoved(DataSnapshot snapshot) {}
    });
  }

  // Manages requests based on the code in the value map
  private void manageRequests(String key, Map<String, String> value) {
    // Given the command code, execute the command
    int code = Integer.parseInt(value.get("code"));

    switch (code) {
      // Code 1 is creating a user with the email, password, and name
      case 1:
	String email = value.get("email");
	String password = value.get("password");
	String name = value.get("name");
	userManager.createUserAndAddToDatabase(key, email, password, name);
	break;
    }
    
  }

  private void setupUserManager() {
    this.userManager = new UserManager(this.sessionId);
  }

  // Creates a response based off of the status and message given
  public static Map<String, String> createResponse(String status, String message) {
    Map<String, String> response = new HashMap();
    response.put("status", status);
    response.put("message", message);
    return response;
  }

  // Sends a response under the session id and request id and removes the request from the session.
  public static void sendResponseAndRemoveRequest(String sessionId, String requestId, Map<String, String> response) {
    DatabaseReference responseRef = FirebaseDatabase.getInstance().getReference();
    responseRef.child(RSPNSE).child(sessionId).child(requestId).setValue(response, new DatabaseReference.CompletionListener() {
     public void onComplete(DatabaseError error, DatabaseReference ref) {
       if (error == null) {
	 System.out.println("Session ID: " + sessionId);
	 System.out.println("Request ID: " + requestId);
	 System.out.println("Successfully sent response");
	 removeRequest(sessionId, requestId);
       }
     } 
    });
  }

  // Removes the request through request id from the session id.
  private static void removeRequest(String sessionId, String requestId) {
    DatabaseReference responseRef = FirebaseDatabase.getInstance().getReference();
    responseRef.child(RQSTS).child(sessionId).child(requestId).removeValue(new DatabaseReference.CompletionListener() { 
     public void onComplete(DatabaseError error, DatabaseReference ref) {
       if (error == null) {
	 System.out.println("Session ID: " + sessionId);
	 System.out.println("Request ID: " + requestId);
	 System.out.println("Successfully removed request");
       }
     } 
    });
  }
}

