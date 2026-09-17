import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import candidateReducer from './candidateSlice';
import employerReducer from './employerSlice';
import jobsReducer from './jobsSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    candidate: candidateReducer,
    employer: employerReducer,
    jobs: jobsReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
