/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    anime: 1,
};
export const animeSlice = createSlice({
    name: 'anime',
    initialState,
    reducers: {
        setAnime: (state, action) => {
            state.anime = action.payload;
        },
    },
});
export const { setAnime } = animeSlice.actions;
export default animeSlice.reducer;
