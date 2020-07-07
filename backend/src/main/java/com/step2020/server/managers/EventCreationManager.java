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
import java.util.List;
import java.util.UUID;
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

public class EventCreationManager {
  
  private String sessionId;

  // The user manager to access user information
  private UserManager userManager;

  // The database reference to access the database
  private DatabaseReference eventsRef;
  
  // The database reference to access the database
  private DatabaseReference usersRef;

  public EventCreationManager(String sessionId, UserManager userManager) {
    this.sessionId = sessionId;
    this.userManager = userManager;
    usersRef = FirebaseDatabase.getInstance("https://step-34-2020-user-info.firebaseio.com/").getReference();
    eventsRef = FirebaseDatabase.getInstance("https://step-34-2020-events.firebaseio.com/").getReference();
  }

  public void createEvent(String requestId, Map<String, String> eventInfo, List<String> attendees) {
    if (!checkMinimumInfoInput(eventInfo)) {
      System.err.println("Failed to meet all input requirements");
      return;
    }

    String eventId = generateUniqueId();
    String name = eventInfo.get("name");
    String description = eventInfo.get("description");
    String location = eventInfo.get("location");
    String imagePath = eventInfo.get("imagePath");
    String organization = eventInfo.get("organization");
    String ownerId = eventInfo.get("owner");

    Event event = new Event.Builder()
      .withEventId(eventId)
      .withName(name)
      .withDescription(description)
      .atLocation(location)
      .withOwnerId(ownerId)
      .withOrganization(organization)
      .withImagePath(imagePath)
      .build();

    addEventToEventsDatabase(event);
    addEventToUserEventDatabase(eventId, attendees);
    addAttendeesToDatabase(eventId, attendees);
  }

  private void addEventToEventsDatabase(Event event) { 
    eventsRef.child(EVNTS).child(event.getEventId()).setValueAsync(event);
  }

  private void addEventToUserEventDatabase(String eventId, List<String> attendees) {
    for (String attendee : attendees) {
      usersRef.child(EVNTS).child(attendee).child(eventId).setValueAsync(eventId);
    }
  }

  private void addAttendeesToDatabase(String eventId, List<String> attendees) {
    eventsRef.child(ATND).child(eventId).setValueAsync(attendees);  
  }

  public void deleteEvent(String requestId, String eventId) {
    
  }

  private boolean checkMinimumInfoInput(Map<String, String> eventInfo) {
    return eventInfo.containsKey("title") && eventInfo.containsKey("description") && eventInfo.containsKey("location");
  }

  private String generateUniqueId() {
    return UUID.randomUUID().toString();
  }

}


