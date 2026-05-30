/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    useDub: false,
    useProxy: false,
};
export const videoSettingsSlice = createSlice({
    name: 'videoSettings',
    initialState,
    reducers: {
        toggleProxy: (state) => {
            state.useProxy = !state.useProxy;
        },
        toggleDub: (state) => {
            state.useDub = !state.useDub;
        },
        setProxy: (state, action) => {
            state.useProxy = action.payload;
        },
        setDub: (state, action) => {
            state.useDub = action.payload;
        },
    },
});
export const { setDub, setProxy, toggleDub, toggleProxy } = videoSettingsSlice.actions;
export default videoSettingsSlice.reducer;
