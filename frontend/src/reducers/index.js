// index.js file that creates a reducer.

import { CHANGE_MAP_STATE } from "../constants/action-types";

const initialState = {
  articles: []
};

function rootReducer(state = initialState, action) {
  if (action.type === CHANGE_MAP_STATE) {
    var currState = state.articles;
    while (currState.length > 0) {
      currState.pop();
    }
    var updatedState = Object.assign({}, state, {
      articles: currState.concat(action.payload)
    });
    console.log(updatedState);
    return updatedState;
  }
  return state;
}

export default rootReducer;
