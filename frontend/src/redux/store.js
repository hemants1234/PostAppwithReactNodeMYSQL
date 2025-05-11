//import { configureStore } from '@reduxjs/toolkit';
//import authReducer from './authSlice';

//const store = configureStore({
  //reducer: {
  //  auth: authReducer
 // }
//});

//export default store;

import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducers.js";

const store = configureStore({ reducer: rootReducer});

export default store;

