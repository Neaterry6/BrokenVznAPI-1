/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    episode: 1,
};
export const episodeSlice = createSlice({
    name: 'episode',
    initialState,
    reducers: {
        incrementEpisode: (state) => {
            state.episode += 1;
        },
        decrementEpisode: (state) => {
            if (!(state.episode <= 1))
                state.episode -= 1;
        },
        setEpisode: (state, action) => {
            state.episode = action.payload;
        },
    },
});
export const { decrementEpisode, incrementEpisode, setEpisode } = episodeSlice.actions;
export default episodeSlice.reducer;
