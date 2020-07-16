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
import java.util.Set;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.CancellationException;
import java.lang.Iterable;
import java.util.Iterator;
import java.util.Arrays;
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
import com.google.api.core.ApiFuture;
import com.google.api.core.ApiFutures;
import com.google.api.core.SettableApiFuture;
import com.google.api.core.ApiFutureCallback;
import com.google.auth.oauth2.GoogleCredentials;

public class EventCreationManager {
  
  private String sessionId;

  // The database reference to access the database
  private DatabaseReference eventsRef;
  
  // The database reference to access the database
  private DatabaseReference usersRef;

  public EventCreationManager(String sessionId) {
    this.sessionId = sessionId;
    
    if (ServletManagerServlet.isOnDeployedServer) {
      usersRef = FirebaseDatabase.getInstance("https://step-34-2020-user-info.firebaseio.com/").getReference(); 
      eventsRef = FirebaseDatabase.getInstance("https://step-34-2020-events.firebaseio.com/").getReference();
    } else {
      usersRef = FirebaseDatabase.getInstance("https://step-34-2020-test.firebaseio.com/").getReference("user-info"); 
      eventsRef = FirebaseDatabase.getInstance("https://step-34-2020-test.firebaseio.com/").getReference("events");
    }
    
  }

  // Creates a new event from the given event info along with the request id
  public void createEvent(String requestId, Map<String, String> eventInfo) {
    // Check for minimum requirements for event info
    if (!checkMinimumInfoInput(eventInfo)) {
      String errorMessage = "Failed to meet all input requirements.";
      System.err.println(errorMessage);
      
      // Write failed response
      Map<String, String> response = Utility.createResponse("failed", errorMessage);
      Utility.sendResponseAndRemoveRequest(sessionId, requestId, response);
      return;
    }

    // Extract all event information
    String eventId = generateUniqueId();
    String title = eventInfo.get("title");
    String date = eventInfo.get("date");
    String startTime = eventInfo.get("startTime");
    String endTime = eventInfo.get("endTime");
    String description = eventInfo.get("description");
    String plusCode = eventInfo.get("plusCode");
    String location = eventInfo.get("location");
    String imageUrls = eventInfo.get("imageUrls");
    String category = eventInfo.get("category");
    String organization = eventInfo.get("organization");
    String attendees = eventInfo.get("attendees");
    String ownerId = eventInfo.get("uid");
    
    // Turn strings that need to be arrays into arrays
    String[] attendeesArray = Utility.stringToArray(attendees);
    
    // Build a new event
    Event event = new Event.Builder()
	.withEventId(eventId)
	.withName(title)
	.withDate(date)
	.withStartEndTime(startTime, endTime)
	.withDescription(description)
	.withPlusCode(plusCode)
	.atLocation(location)
	.withOwnerId(ownerId)
	.withOrganization(organization)
	.withImageUrls(imageUrls)
	.build();

    // Submit event to the database and add the event id to all attendant's events
    addEventToDatabase(requestId, event, attendeesArray); 
  }

  // Checks to make sure all required elements are inputted
  private boolean checkMinimumInfoInput(Map<String, String> eventInfo) {
    Set<Map.Entry<String, String>> entries = eventInfo.entrySet();
    Iterator<Map.Entry<String,String>> it = entries.iterator();
    while(it.hasNext()) {
      Map.Entry<String, String> entry = it.next();
      if (!entry.getKey().equals("imagePaths") || !entry.getKey().equals("organization")) {
	if (entry.getValue() == null || entry.getValue().isEmpty()) {
	  return false;
	} 
      }
    } 
    return true;
  }

  private String generateUniqueId() {
    return UUID.randomUUID().toString();
  }

  // Adds events to the database and all users who are invited/going to the event
  private void addEventToDatabase(String requestId, Event event, String[] attendees) {
    eventsRef.child(EVNTS).child(event.getEventId()).setValue(event, new DatabaseReference.CompletionListener() {
      public void onComplete(DatabaseError error, DatabaseReference ref) {
	if (error == null) {
	  // Add event under plus code and associated category
	  addEventUnderPlusCodeAndCategory(event.getEventId(), event.getPlusCode(), event.getCategory());
	  // Add event under users and add the attendees list
	  addEventToUserEventDatabase(event.getEventId(), attendees);
	  addAttendeesToDatabase(event.getEventId(), attendees);
	  
	  // Write success response
	  Map<String, String> response = Utility.createResponse("success", "");
	  Utility.sendResponseAndRemoveRequest(sessionId, requestId, response);
	} else {
	  // Write failed response
	  Map<String, String> response = Utility.createResponse("failed", error.getMessage());
	  Utility.sendResponseAndRemoveRequest(sessionId, requestId, response);
	}
      }	
    });
  }

  // Add event under the university plus code under the category specified AND the "All" category.
  // The purpose of this design is so that the client can easily query and filter categories.
  private void addEventUnderPlusCodeAndCategory(String eventId, String plusCode, String category) {
    eventsRef.child(UNI).child(plusCode).child(ALL).push().setValueAsync(eventId);
    eventsRef.child(UNI).child(plusCode).child(CTGRY).child(category).push().setValueAsync(eventId);
  }
 
  // Adds attendees to database to get a list representation of the attendees
  private void addAttendeesToDatabase(String eventId, String[] attendees) {
    for (String attendee : attendees) {
      eventsRef.child(ATND).child(eventId).push().setValueAsync(attendee);
    }
  }
  
  // Adds the event id and associates it with the user
  private void addEventToUserEventDatabase(String eventId, String[] attendees) {
    for (String attendee : attendees) {
      usersRef.child(EVNTS).child(attendee).push().setValueAsync(eventId);
    }
  }
}
