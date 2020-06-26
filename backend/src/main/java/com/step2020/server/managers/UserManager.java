// Copyright 2019 Google LLC
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

  private String currentUID;

  private DatabaseReference usersRef;

  public UserManager() {
    
    FirebaseOptions options = null;

    // Build new Firebase instance for this servlet instance
    try {
      options = new FirebaseOptions.Builder()
	.setCredentials(GoogleCredentials.getApplicationDefault())
	.setDatabaseUrl("https://step-34-2020-user-info.firebaseio.com")
	.build();
      FirebaseApp.initializeApp(options);
    } catch (Exception e) {
      System.err.println(e.toString());
    }
    // Connect database reference
    usersRef = FirebaseDatabase.getInstance().getReference(USRS);
  }

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

  public void createUserAndAddToDatabase(String email, String password, String name) {
    CreateRequest request = new CreateRequest()
      .setEmail(email)
      .setPassword(password)
      .setDisplayName(name)
      .setDisabled(false);

    UserRecord userRecord = null; 
    try {
      userRecord = FirebaseAuth.getInstance().createUser(request);
    } catch (FirebaseAuthException e) {
      System.err.println(e);
      return;
    }

    String uid = userRecord.getUid();
    System.out.println("Created authentication user");
    
    User user = new User.Builder()
      .withEmail(email)
      .withName(name)
      .withUID(uid)
      .build();
    
    if (user == null) {
      System.err.println("Uid not specified");
      return;
    }

    this.currentUID = uid;

    usersRef.child(uid).setValue(user.getMapRepresentation(), new DatabaseReference.CompletionListener() {
      public void onComplete(DatabaseError error, DatabaseReference ref) {
        if (error == null) {
	  System.out.println("User created");
	}	  
      }
    });
  }
}

