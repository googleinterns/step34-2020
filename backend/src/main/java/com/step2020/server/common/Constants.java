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

public final class Constants {

  // Where we receive new session requests
  public static final String INBX = "inbox";

  // Where we receive requests from session ids
  public static final String RQSTS = "REQUESTS";

  // Where we send responses from requests given by session ids
  public static final String RSPNSE = "RESPONSES";
  
  // Where we put events associated with user
  public static final String EVNTS = "events";
  
  // Where we put user information
  public static final String USRS = "users";

}
