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

package com.step2020.server.servlets;

import com.step2020.server.common.*;
import com.step2020.server.managers.*;
import static com.step2020.server.common.Constants.*;

import java.util.Map;
import java.util.HashMap;
import java.lang.Iterable;
import java.util.Iterator;
import java.util.Set;
import java.util.HashSet;
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
import com.google.appengine.api.utils.*;

@WebServlet(name = "servletmanager", value = "")
public class ServletManagerServlet extends HttpServlet {

  // Checks if the environment is deployed or not
  public static boolean isOnDeployedServer = SystemProperty.environment.value() == SystemProperty.Environment.Value.Production;

  // The database reference to access the database
  private DatabaseReference idRef;

  // All active sessions in this servlet
  private Map<String, ActionManager> activeSessions;

  @Override
  public void init(ServletConfig config) { 
    FirebaseOptions options = null;
    // Build new Firebase instance for this servlet instance
    try {
      if (isOnDeployedServer) {
	options = new FirebaseOptions.Builder()
	  .setCredentials(GoogleCredentials.getApplicationDefault())
	  .setDatabaseUrl("https://step-34-2020.firebaseio.com")
	  .build();
	FirebaseApp.initializeApp(options);
      } else {
	options = new FirebaseOptions.Builder()
	  .setCredentials(GoogleCredentials.getApplicationDefault())
	  .setDatabaseUrl("https://step-34-2020-test.firebaseio.com")
	  .build();
	FirebaseApp.initializeApp(options);
      }
    } catch (Exception e) {
      System.err.println(e.toString());
    }

    // Connect database reference
    idRef = FirebaseDatabase.getInstance().getReference();

    activeSessions = new HashMap();
    
    // Listen for new sessions
    listenForNewUserSessionAndSendSessionId();
  }

  /*
   * Listens for a new user to enter the site, then sends a unique session id to the client.
   * Once the client has sent a new session request, this method will send the servlet instance session id
   * to Firebase, where the client will pickup. This method will also setup the command listener.
   */
  private void listenForNewUserSessionAndSendSessionId() {
    Query inboxReference = idRef.child(INBX).limitToLast(1);
    inboxReference.addChildEventListener(new ChildEventListener() {

      // Listen for when a new child has been added in the inbox
      public void onChildAdded(DataSnapshot snapshot, String prevKey) {
	String key = snapshot.getKey();	
    	String sessionId = generateUniqueSessionId();
	// Run a transaction with that child so that only this child will be linked with this servlet instance
        idRef.child(INBX + "/" + key).child("id").runTransaction(new Transaction.Handler() { 
	  public Transaction.Result doTransaction(MutableData currentData) {

	    // When the data is null/empty (which should always be the case), set the session id
            if (currentData.getValue(String.class) == null || currentData.getValue(String.class).isEmpty()) {
	      // Create a new action manager for the session and add to active sessions
	      ActionManager actionManager = new ActionManager(sessionId);
	      activeSessions.put(sessionId, actionManager);

	      // Set session ids to firebase
              currentData.setValue(sessionId);
            } else {
	      // Abort transaction
	      return Transaction.abort();
	    }
	    // Return successful transaction status
            return Transaction.success(currentData);
          }
          
	  public void onComplete(DatabaseError error, boolean committed, DataSnapshot snapshot) {
	    // if the transaction was a success, setup the command listener
	    if (error == null) {
	      System.out.println("Transaction Success");
	    } else {
	      addIdToPushedKey("failed", key);
	      System.err.println("Transaction failure reason: " + error.getMessage());
	    }
	  }
	});       
      }

      public void onCancelled(DatabaseError error) {
        System.err.println("Error code: " + error.getCode() + " message:" + error.getMessage());
      }

      public void onChildChanged(DataSnapshot snapshot, String prevKey) {}

      public void onChildMoved(DataSnapshot snapshot, String prevKey) {}

      public void onChildRemoved(DataSnapshot snapshot) {}
    });
  }

  // Sets the given key's id with the Id so the client knows the servlet is ready
  private void addIdToPushedKey(String id, String key) {
    this.idRef.child(INBX).child(key).child("id").setValueAsync(id);
  }

  // Returns a new generated unique session id for this servlet instance
  private String generateUniqueSessionId() {
    String sessionId = "";
    do {
      StringBuilder idBuilder = new StringBuilder();
      Random random = new Random();
      for (int i = 0; i < 16; i++) {
	int digit = random.nextInt(10);
	idBuilder.append(digit);
      }
      sessionId = idBuilder.toString();
    } while (checkIfSessionIdIsActive(sessionId)); 
    return sessionId;
  }

  // Check if the current session id is active
  private boolean checkIfSessionIdIsActive(String sessionId) {
    return this.activeSessions.containsKey(sessionId);
  }

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    doPost(req, resp);
  }

  @Override
  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.setContentType("text/plain");
  }

  @Override
  public void destroy() {
    this.activeSessions.clear();
  }
}

