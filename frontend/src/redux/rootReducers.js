import { combineReducers } from "redux";
import authReducer from './authSlice';
import postReducer from './postSlice';

const rootReducer = combineReducers(
    {
        auth: authReducer,
        posts: postReducer,
    }
);

export default rootReducer;