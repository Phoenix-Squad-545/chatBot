import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slices/commonSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    common: commonReducer,
    auth: authReducer,
  },
});

// Infer RootState & AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
