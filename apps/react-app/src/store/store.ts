import { configureStore } from "@reduxjs/toolkit";

import { protectedApiSlice } from "./api/protectedApi";
import { publicApiSlice } from "./api/publicApi";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [publicApiSlice.reducerPath]: publicApiSlice.reducer,
    [protectedApiSlice.reducerPath]: protectedApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      publicApiSlice.middleware,
      protectedApiSlice.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
