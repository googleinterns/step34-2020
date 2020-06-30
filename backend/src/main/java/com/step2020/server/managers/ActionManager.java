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
  
  // Where we recieve a new session request
  private static final String INBX = "inbox";

  // Where we store the session ids
  private static final String IDBX = "idBox";

  // This servlet's sessionId
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
    setupCommandListenerAndManageRequests();
  }

  // Sets up the command listener for the user to put in commands with a given code
  private void setupCommandListenerAndManageRequests() {

    // Listens for a new command
    idRef.child(IDBX).child(this.sessionId).addChildEventListener(new ChildEventListener() {

      public void onChildAdded(DataSnapshot snapshot, String prevKey) {
	// Get data from the new command and put them in the form a map
	String key = snapshot.getKey();
	Map<String, String> value = new HashMap();
        Iterable<DataSnapshot> children = snapshot.getChildren();
	Iterator<DataSnapshot> iterator = children.iterator();
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
	userManager.createUserAndAddToDatabase(email, password, name);
	break;
    }
    
  }

  private void setupUserManager() {
    this.userManager = new UserManager();
  }
}

