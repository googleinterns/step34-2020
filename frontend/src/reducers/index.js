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
    var returnThis = Object.assign({}, state, {
      articles: currState.concat(action.payload)
    });
    console.log("hello from reducers!");
    console.log(returnThis);
    return returnThis;
  }
  return state;
}

export default rootReducer;