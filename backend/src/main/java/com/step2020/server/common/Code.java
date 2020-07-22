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

import java.util.Map;
import java.util.HashMap;

public enum Code {
  CREATE_USER(1),
  CREATE_EVENT(5),
  UPDATE_EVENT(6),
  DELETE_EVENT(7);

  private int value;
  private static Map values = new HashMap<>();

  private Code(int value) {
    this.value = value;
  }

  static {
    for (Code code : Code.values()) {
      values.put(code.value, code);
    }
  }

  public static Code valueOf(int code) {
    return (Code) values.get(code);
  }

  public int getValue() {
    return this.value;
  }
}

