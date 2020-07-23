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
import java.util.Collections;
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
import com.google.firebase.database.ValueEventListener;
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

  // Updates the event with the given update info and request id
  public void updateEvent(String requestId, Map<String, String> updateInfo) {
    // Check if uid and event id exist in the update info
    if (checkRequestInfoForRequiredKeys(updateInfo)) {
      String errorMessage = "Required fields are empty: uid and eventId.";
      Utility.sendFailure(sessionId, requestId, errorMessage);
      return;
    }

    // Get uid and eventId
    String uid = updateInfo.get(UID);
    String eventId = updateInfo.get(EVENTID);

   // Query the ownerId of the event to make sure the request is issued by the owner
    this.eventsRef.child(EVNTS).child(eventId).child("ownerId").addListenerForSingleValueEvent(new ValueEventListener() {
      public void onDataChange(DataSnapshot snapshot) {
	// Get the owner id from the query
	String ownerId = snapshot.getValue(String.class);

	// Check if the ownerId and request uid are the same
	if (ownerId.equals(uid)) {
	  // Remove uid and event id and just leave the info needed to be updated
	  updateInfo.remove(UID);
	  updateInfo.remove(EVENTID);

	  // update event
	  updateEventWithMapInfo(requestId, eventId, updateInfo);
	} else {
	  handleUnownedEventActionForRequestID(sessionId, requestId);
	}
      }
      public void onCancelled(DatabaseError error) {
	// Send failed information
	String errorMessage = error.getMessage();
	Utility.sendFailure(sessionId, requestId, errorMessage);
      }	
    });
  }
  
  // Updates the event with the map info with just the info needed to be updated
  private void updateEventWithMapInfo(String requestId, String eventId, Map<String, String> updateInfo) {
    // Change to updated info into a map of String keys and Object values so Firebase can handle input
    Map<String, Object> updateInfoObject = Collections.<String, Object>unmodifiableMap(updateInfo);

    // Query the event id and update the children with the update information
    this.eventsRef.child(EVNTS).child(eventId).updateChildren(updateInfoObject, new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError databaseError, DatabaseReference databaseReference) {
        // If there aren't any errors, send in a success response, if not, send in failed error
	if (databaseError == null) {
          Utility.sendSuccess(sessionId, requestId);
	} else {
	  String errorMessage = databaseError.getMessage();
	  Utility.sendFailure(sessionId, requestId, errorMessage);
	}
      }
    });
  } 

  // Deletes the event with the requested event id in the requestInfo map and make sure the user is the owner
  public void deleteEvent(String requestId, Map<String, String> requestInfo) {
    // Check to make sure the requestinfo has the required keys
    if (checkRequestInfoForRequiredKeys(requestInfo)) {
      String errorMessage = "Required fields are empty: uid and eventId.";
      Utility.sendFailure(sessionId, requestId, errorMessage);
      return;
    }
   
    // Get the uid and event id
    String uid = requestInfo.get(UID);
    String eventId = requestInfo.get(EVENTID); 

    System.out.println(eventId);
    // Query the event and owner id
    this.eventsRef.child(EVNTS).child(eventId).addListenerForSingleValueEvent(new ValueEventListener() {
      public void onDataChange(DataSnapshot snapshot) {
	String ownerId = snapshot.child("ownerId").getValue(String.class);
	// Check to make sure the ownerId and the uid are the same
	if (ownerId.equals(uid)) {
	  // remove event
	  removeEvent(requestId, eventId);
	} else {
	  handleUnownedEventActionForRequestID(sessionId, requestId);
	}
      }

      public void onCancelled(DatabaseError error) {
	String errorMessage = error.getMessage();
	Utility.sendFailure(sessionId, requestId, errorMessage);
      }	
    });
  }

  private boolean checkRequestInfoForRequiredKeys(Map<String, String> info) {
    return !info.containsKey(UID) && !info.containsKey(EVENTID);  
  }

  // Removes the requested event id and send a response of success or failure
  private void removeEvent(String requestId, String eventId) {
    // Removes event from user-info database from each user
    removeEventFromUsers(requestId, eventId);

    // Removes event from universities and remove all the event info
    removeEventFromUniversityAndEvents(requestId, eventId);
  }

  // Removes the requested event id from user's events and send a response of success or failure
  private void removeEventFromUsers(String requestId, String eventId) {
    // Query the event id from the attendees parent
    this.eventsRef.child(ATND).child(eventId).addListenerForSingleValueEvent(new ValueEventListener() {
      public void onDataChange(DataSnapshot snapshot) {
	// Traverse through all the attendees
	for (DataSnapshot child : snapshot.getChildren()) {
	  // Get the attendees' id
	  String id = child.getValue(String.class);
	  // Query the user's events
	  usersRef.child(EVNTS).child(id).addListenerForSingleValueEvent(new ValueEventListener() {
	    public void onDataChange(DataSnapshot snapshot) {
	      // Traverse through each event to find the event
	      for (DataSnapshot child : snapshot.getChildren()) {
		// Get key value pair
		String childEventId = child.getValue(String.class);
		String key = child.getKey();

		// Check if the eventId is the same as the eventId we want to delete and delete it
		if (childEventId.equals(eventId)) {
		  usersRef.child(EVNTS).child(id).child(key).removeValueAsync();
		}
	      }
	      // Remove the entire attendees parent
              removeEventFromAttendees(eventId);
	    }
	    public void onCancelled(DatabaseError error) {
	      String errorMessage = error.getMessage();
	      Utility.sendFailure(sessionId, requestId, errorMessage);
	    }	
	  });
	}
      }
      public void onCancelled(DatabaseError error) {
	String errorMessage = error.getMessage();
	Utility.sendFailure(sessionId, requestId, errorMessage);
      }	
    });
  }

  // Remove event from the attendees parent
  private void removeEventFromAttendees(String eventId) {
    this.eventsRef.child(ATND).child(eventId).removeValueAsync();
  }
  
  // Remove event from the univeristy parent and remove event info
  private void removeEventFromUniversityAndEvents(String requestId, String eventId) {
    // Query the event info
    this.eventsRef.child(EVNTS).child(eventId).addListenerForSingleValueEvent(new ValueEventListener() {
      public void onDataChange(DataSnapshot snapshot) {
	// Get the plus code and category
	String plusCode = snapshot.child("plusCode").getValue(String.class);
	String category = snapshot.child("category").getValue(String.class);
	
	// Remove the event info
	removeEventFromEvents(requestId, eventId);

	// Remove the event from the university plus code in the ALL category
	eventsRef.child(UNI).child(plusCode).child(ALL).addListenerForSingleValueEvent(new ValueEventListener() {
	  public void onDataChange(DataSnapshot snapshot) { 
	    for (DataSnapshot child : snapshot.getChildren()) {
	      String childEventId = child.getValue(String.class);
	      String key = child.getKey();
	      if (childEventId.equals(eventId)) {
		eventsRef.child(UNI).child(plusCode).child(ALL).child(key).removeValueAsync();
	      }
	    }
	  }
	  public void onCancelled(DatabaseError error) {
	    String errorMessage = error.getMessage();
	    Utility.sendFailure(sessionId, requestId, errorMessage);
	  }	
	});
	
	// Remove the event from the university plus code in the specified category
	eventsRef.child(UNI).child(plusCode).child(category).addListenerForSingleValueEvent(new ValueEventListener() {
	  public void onDataChange(DataSnapshot snapshot) { 
	    for (DataSnapshot child : snapshot.getChildren()) {
	      String childEventId = child.getValue(String.class);
	      String key = child.getKey();
	      if (childEventId.equals(eventId)) {
		eventsRef.child(UNI).child(plusCode).child(category).child(key).removeValueAsync();
	      }
	    }
	  }
	  public void onCancelled(DatabaseError error) {
	    String errorMessage = error.getMessage();
	    Utility.sendFailure(sessionId, requestId, errorMessage);
	  }	
	});
      }
      public void onCancelled(DatabaseError error) {
	String errorMessage = error.getMessage();
	Utility.sendFailure(sessionId, requestId, errorMessage);
      }	
    });
  }

  // Remove the event info with the given event id
  private void removeEventFromEvents(String requestId, String eventId) {
    this.eventsRef.child(EVNTS).child(eventId).removeValue(new DatabaseReference.CompletionListener() {
      @Override
      public void onComplete(DatabaseError databaseError, DatabaseReference databaseReference) {
        if (databaseError == null) {
          Utility.sendSuccess(sessionId, requestId);
	} else {
	  String errorMessage = databaseError.getMessage();
	  Utility.sendFailure(sessionId, requestId, errorMessage);
	}
      }
    });
  }
  
  private void handleUnownedEventActionForRequestID(String sessionId, String requestId) {
    String errorMessage = "You are not the owner of this event.";
    Utility.sendFailure(sessionId, requestId, errorMessage);
  }
 
    // Creates a new event from the given event info along with the request id
  public void createEvent(String requestId, Map<String, String> eventInfo) {
    // Check for minimum requirements for event info
    if (!checkMinimumInfoInput(eventInfo)) {
      String errorMessage = "Failed to meet all input requirements.";
      System.err.println(errorMessage);

      // Write failed response
      Utility.sendFailure(sessionId, requestId, errorMessage);
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
    String locationName = eventInfo.get("locationName");
    String imageUrls = eventInfo.get("imagePaths");
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
    .withLocationName(locationName)
    .withCategory(category)
    .withOwnerId(ownerId)
    .withOrganization(organization)
    .withImageUrls(imageUrls)
    .withAttendees(attendees)
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
      if (!entry.getKey().equals("imagePaths") && !entry.getKey().equals("organization")) {
        if (entry.getValue() == null || entry.getValue().isEmpty()) {
	  System.out.println(entry.getKey());
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
	  addEventUnderPlusCodeAndCategory(event.getEventId(), event.getPlusCode(), event.getCategory());
          // Add event under users and add the attendees list
          addEventToUserEventDatabase(event.getEventId(), attendees);
          addAttendeesToDatabase(event.getEventId(), attendees);

          // Write success response
          Utility.sendSuccess(sessionId, requestId);
        } else {
          // Write failed response
	  String errorMessage = error.getMessage();
	  Utility.sendFailure(sessionId, requestId, errorMessage);
        }
      }
    });
  }

  // Add event under the university plus code under the category specified AND the "All" category.
  // The purpose of this design is so that the client can easily query and filter categories.
  private void addEventUnderPlusCodeAndCategory(String eventId, String plusCode, String category) {
    eventsRef.child(UNI).child(plusCode).child(ALL).push().setValueAsync(eventId);
    eventsRef.child(UNI).child(plusCode).child(category).push().setValueAsync(eventId);
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
