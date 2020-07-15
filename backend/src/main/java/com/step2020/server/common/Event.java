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

package com.step2020.server.common;

public class Event {
  
  private String eventId;
  private String eventName;
  private String date;
  private String startTime;
  private String endTime;
  private String description;
  private String location;
  private String ownerId;
  private String organization;
  private String imageUrls;

  public static class Builder {

    private String eventId;
    private String eventName;
    private String date;
    private String startTime;
    private String endTime;
    private String description;
    private String location;
    private String ownerId;
    private String organization;
    private String imageUrls;

    public Builder() {
      this.eventId = "";
      this.eventName = "";
      this.date = "";
      this.startTime = "";
      this.endTime = "";
      this.description = "";
      this.location = "";
      this.ownerId = "";
      this.organization = "";
      // imageUrls will be a string in the form of [url0,url1,....]. 
      // This was designed like this because using Lists within an object in Firebase can get wonky.
      this.imageUrls = "[]";
    }

    public Builder withEventId(String id) {
      this.eventId = id;
      return this;
    }

    public Builder withName(String name) {
      this.eventName = name;
      return this;
    }

    public Builder withDate(String date) {
      this.date = date;
      return this;
    }

    public Builder withStartEndTime(String start, String end) {
      this.startTime = start;
      this.endTime = end;
      return this;
    }

    public Builder withDescription(String description) {
      this.description = description;
      return this;
    }

    public Builder atLocation(String location) {
      this.location = location;
      return this;
    }

    public Builder withOwnerId(String id) {
      this.ownerId = id;
      return this;
    }

    public Builder withOrganization(String org) {
      this.organization = org;
      return this;
    }

    // paths will be a string in the form of "[url0,url1,....]". This makes it easier for firebase to handle this data
    public Builder withImageUrls(String urls) {
      this.imageUrls = urls;
      return this;
    }

    public Event build() {
      if (this.eventId.isEmpty() || this.eventName.isEmpty() || this.description.isEmpty() || this.ownerId.isEmpty()
         || this.date.isEmpty() || this.startTime.isEmpty() || this.endTime.isEmpty() || this.location.isEmpty()) {
        throw new AssertionError("Required inputs are not filled.", null); 
      }
      
      Event event = new Event();
      event.eventId = this.eventId;
      event.date = this.date;
      event.startTime = this.startTime;
      event.endTime = this.endTime;
      event.eventName = this.eventName;
      event.description = this.description;
      event.location = this.location;
      event.ownerId = this.ownerId;
      event.organization = this.organization;
      event.imageUrls = this.imageUrls;

      return event;
    }

  }
  
  public Event() {}

  public String getEventId() {
    return this.eventId;
  }

  public String getEventName() {
    return this.eventName;
  }
  
  public String getDate() {
    return this.date;
  }
  
  public String getStartTime() {
    return this.startTime;
  }
  
  public String getEndTime() {
    return this.endTime;
  }

  public String getLocation() {
    return this.location;
  }

  public String getOwnerId() {
    return this.ownerId;
  }

  public String getOrganization() {
    return this.organization;
  }

  public String getImageUrls() {
    return this.imageUrls;
  }
}
