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
import java.io.IOException;
import java.io.PrintWriter;
import java.io.FileInputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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
  
  // Where we put events associated with user
  private static final String EVNTS = "events";

  // Where we put user inforamtion 
  private static final String USRS = "users";

  // The currentUID this servlet is serving
  private String currentUID;

  // The database reference for users
  private DatabaseReference usersRef;

  public UserManager() { 
    // Connect database reference
    usersRef = FirebaseDatabase.getInstance("https://step-34-2020-user-info.firebaseio.com").getReference(USRS);
  }

  // Creates a user and adds to the database based on the given information.
  // Checks to make sure the required fields are inputted.
  public void createUserAndAddToDatabase(Map info) {
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

    if (email != null && password != null && name != null) {
      createUserAndAddToDatabase(email, password, name);
    } else {
      System.err.println("Invalid map argument");
    }
  } 

  // Creates a user and adds to database based off of the required fields.
  public void createUserAndAddToDatabase(String email, String password, String name) {
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
      System.err.println(e.toString());
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
	}	  
      }
    });
  }
}

