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

package com.step2020.server.common;

import static com.step2020.server.common.Constants.*;
import java.util.Map;
import java.util.HashMap;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;

public class Utility {
  
  private Utility() {
    throw new AssertionError();
  }

  public static void sendSuccess(String sessionId, String requestId) {
    Map<String, String> response = createResponse("success", null);
    sendResponseAndRemoveRequest(sessionId, requestId, response);
  }

  public static void sendFailure(String sessionId, String requestId, String errorMessage) {
    Map<String, String> response = createResponse("failed", errorMessage);
    sendResponseAndRemoveRequest(sessionId, requestId, response);
  }

  // Creates a response based off of the status and message given
  private static Map<String, String> createResponse(String status, String message) {
    Map<String, String> response = new HashMap();
    response.put("status", status);
    response.put("message", message);
    return response;
  }

  // Sends a response under the session id and request id and removes the request from the session.
  private static void sendResponseAndRemoveRequest(String sessionId, String requestId, Map<String, String> response) {
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

  // Changes a string version of an array (ex. [hello, there]) to an array
  public static String[] stringToArray(String stringArray) {
    // Check edge cases
    if (stringArray.isEmpty()) {
      return new String[0];
    }
    if (!stringArray.matches("\\[[^\\[]*\\]")) {
      return new String[0];
    }

    // Remove ending brackets
    String substringArray = stringArray.substring(1, stringArray.length()-1);
    
    return substringArray.split(",");
  }
}
