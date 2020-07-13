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
  private String description;
  private String location;
  private String ownerId;
  private String organization;
  private String imagePaths;

  public static class Builder {

    private String eventId;
    private String eventName;
    private String description;
    private String location;
    private String ownerId;
    private String organization;
    private String imagePaths;

    public Builder() {
      this.eventId = "";
      this.eventName = "";
      this.description = "";
      this.location = "";
      this.ownerId = "";
      this.organization = "";
      this.imagePaths = "[]";
    }

    public Builder withEventId(String id) {
      this.eventId = id;
      return this;
    }

    public Builder withName(String name) {
      this.eventName = name;
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

    public Builder withImagePaths(String paths) {
      this.imagePaths = paths;
      return this;
    }

    public Event build() {
      Event event = new Event();
      event.eventId = this.eventId;
      event.eventName = this.eventName;
      event.description = this.description;
      event.location = this.location;
      event.ownerId = this.ownerId;
      event.organization = this.organization;
      event.imagePaths = this.imagePaths;

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

  public String getDescription() {
    return this.description;
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

  public String getImagePaths() {
    return this.imagePaths;
  }
}
