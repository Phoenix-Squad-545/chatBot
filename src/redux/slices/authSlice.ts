import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  loginUserDetails: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginDetails: (state, { payload }) => {
      state.token = payload.token;
      state.loginUserDetails = payload.loginUserDetails;
    },
  },
});

export const { loginDetails } =  authSlice.actions;

export default authSlice.reducer;
