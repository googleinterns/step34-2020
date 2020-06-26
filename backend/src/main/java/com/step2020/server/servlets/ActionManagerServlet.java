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

package com.step2020.server.servlets;

import com.step2020.server.common.*;
import com.step2020.server.managers.*;
import java.util.Map;
import java.util.Random;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.FileInputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletConfig;
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

@WebServlet(name = "actionmanager", value = "")
public class ActionManagerServlet extends HttpServlet {
  
  // Where we recieve a new session request
  private static final String INBX = "inbox";

  // Where we store the session ids
  private static final String IDBX = "idBox";

  private String sessionId;

  private UserManager userManager;

  private DatabaseReference idRef;

  @Override
  public void init(ServletConfig config) {
    
    FirebaseOptions options = null;

    // Build new Firebase instance for this servlet instance
    try {
      options = new FirebaseOptions.Builder()
	.setCredentials(GoogleCredentials.getApplicationDefault())
	.setDatabaseUrl("https://step-34-2020.firebaseio.com")
	.build();
      FirebaseApp.initializeApp(options);
    } catch (Exception e) {
      System.err.println(e.toString());
    }

    // Connect database reference
    idRef = FirebaseDatabase.getInstance().getReference();
    
    generateUniqueSessionId();
    listenForNewUserSessionAndSendSessionId();
  }

  /*
   * Listens for a new user to enter the site, then sends a unique session id to the client.
   * Once the client has sent a new session request, this method will send the servlet instance session id
   * to Firebase, where the client will pickup. This method will also setup the command listener.
   */
  private void listenForNewUserSessionAndSendSessionId() {
    idRef.child(INBX).limitToLast(1).addChildEventListener(new ChildEventListener() {

      // Listen for when a new child has been added in the inbox
      public void onChildAdded(DataSnapshot snapshot, String prevKey) {
	String key = snapshot.getKey();
	// Run a transaction with that child so that only this child will be linked with this servlet instance
        idRef.child(IDBX + "/" + sessionId).runTransaction(new Transaction.Handler() { 
	  public Transaction.Result doTransaction(MutableData currentData) {

	    // When the data is null (which should always be the case), set the session id
            if (currentData.getValue() == null) {
              currentData.setValue(sessionId);
            }
	    // Return successful transaction status
            return Transaction.success(currentData);
          }
          
	  public void onComplete(DatabaseError error, boolean committed, DataSnapshot snapshot) {
	    if (error == null) {
	      setupCommandListener();
	    }
	  }
	});       
	idRef.child(INBX).child(key).removeValueAsync();
	idRef.child(INBX).limitToLast(1).removeEventListener(this);
      }

      public void onCancelled(DatabaseError error) {}

      public void onChildChanged(DataSnapshot snapshot, String prevKey) {}

      public void onChildMoved(DataSnapshot snapshot, String prevKey) {}

      public void onChildRemoved(DataSnapshot snapshot) {}
    });
  }

  private void setupCommandListener() {
    setupUserManager();
    idRef.child(IDBX).child(this.sessionId).addChildEventListener(new ChildEventListener() {

      // Listen for when a new child has been added in the inbox
      public void onChildAdded(DataSnapshot snapshot, String prevKey) {
	String uid = (String)snapshot.child("uid").getValue();
        Integer code = (Integer)snapshot.child("code").getValue();
	String key = (String)snapshot.child("key").getValue();
        Object value = snapshot.child("value").getValue();
	manageRequests(uid, code, key, value);
      }

      public void onCancelled(DatabaseError error) {}

      public void onChildChanged(DataSnapshot snapshot, String prevKey) {}

      public void onChildMoved(DataSnapshot snapshot, String prevKey) {}

      public void onChildRemoved(DataSnapshot snapshot) {}
    });
  }

  private void manageRequests(String uid, Integer code, String key, Object value) {
    Map requestValue = null;
    if (value instanceof Map) {
      requestValue = (Map) value;
    }

    switch(code) {
      case 1:
	userManager.createUserAndAddToDatabase(requestValue);
	break;
    }
  }

  private void generateUniqueSessionId() {
    StringBuilder idBuilder = new StringBuilder();
    Random random = new Random();
    for(int i = 0; i < 16; i++) {
      int digit = random.nextInt(10);
      idBuilder.append(digit);
    }
    sessionId = idBuilder.toString();
  }

  private void setupUserManager() {
    userManager = new UserManager();
  }

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    doPost(req, resp);
  }

  @Override
  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.setContentType("text/plain");
    resp.getWriter().println("Session id: " + this.sessionId);
  }
}

