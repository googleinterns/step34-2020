// index.js file that creates an action.

import { CHANGE_MAP_STATE } from "../constants/action-types";

export function changeMapState(payload) {
  return {
    type: CHANGE_MAP_STATE, payload
  };
}
