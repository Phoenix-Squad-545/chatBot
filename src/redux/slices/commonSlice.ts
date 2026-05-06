import { createSlice } from "@reduxjs/toolkit"

interface CommonState {
    count:number
    recordingDuration: number;
//define your commonslice types
}

const initialState: CommonState = {
    count:0,
    recordingDuration: 0,
//define your commonslice state
}

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    //define your actions
    increment:(state)=>{
      state.count += 1
    },
    decrement:(state)=>{
        state.count -= 1
      },
     duration : (state, action)=>{
        state.recordingDuration = action.payload
      }
  },
})

export const {
decrement,increment,duration
} = commonSlice.actions
export default commonSlice.reducer
