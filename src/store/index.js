import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import candidateReducer from './candidateSlice';
import employerReducer from './employerSlice';
import jobsReducer from './jobsSlice';
import adminReducer from './adminSlice';

const appReducer = combineReducers({
    auth: authReducer,
    candidate: candidateReducer,
    employer: employerReducer,
    jobs: jobsReducer,
    admin: adminReducer,
});
export const store = configureStore({
  reducer: (state, action) => {
    if (action.type === 'auth/logout' || action.type === 'auth/loginSuccess') {
      state = { auth: state?.auth };
    }
    return appReducer(state, action);
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
