/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    startTime: 0,
    currentTime: 0,
};
export const timerSlice = createSlice({
    name: 'timer',
    initialState,
    reducers: {
        setStartTime: (state, action) => {
            state.startTime = action.payload;
        },
        setCurrentTime: (state, action) => {
            if (state.currentTime === Math.ceil(action.payload))
                return;
            state.currentTime = Math.ceil(action.payload);
        },
    },
});
export const { setStartTime, setCurrentTime } = timerSlice.actions;
export default timerSlice.reducer;
