// /frontend/src/redux/reducers/index.js
import { combineReducers } from "redux";
import auth from "./authReducer";
// import other reducers here...

const rootReducer = combineReducers({
  auth,
  // ...others
});

export default rootReducer;
