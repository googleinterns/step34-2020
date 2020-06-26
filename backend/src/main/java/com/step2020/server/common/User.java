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

import java.util.Map;
import java.util.HashMap;

public class User {
  
  private String email;
  private String name;
  private String uid;

  public static class Builder {

    private String email;
    private String name;
    private String uid;

    public Builder() {
      this.email = "";
      this.name = "";
      this.uid = "";
    }

    public Builder withEmail(String email) {
      this.email = email;
      return this;
    }
    
    public Builder withName(String name) {
      this.name = name;
      return this;
    }
    
    public Builder withUID(String id) {
      this.uid = id;
      return this;
    }

    public Builder fromUser(User user) {
      this.email = user.getEmail();
      this.name = user.getName();
      this.uid = user.getUID();
      return this;
    }

    public User build() {
      if (this.uid == null || this.uid.isEmpty()) {
	System.err.println("UID cannot be empty or null");
	return null;
      }	
      User user = new User();
      user.email = this.email;
      user.name = this.name;
      user.uid = this.uid;
      return user;
    }

  }
  
  public User() {}

  public String getEmail() {
    return this.email;
  }

  public String getName() {
    return this.name;
  }

  public String getUID() {
    return this.uid;
  }

  public Map<String, String> getMapRepresentation() {
    Map<String, String> map = new HashMap();
    map.put("email", this.email);
    map.put("name", this.name);
    map.put("uid", this.uid);
    return map; 
  }
}
