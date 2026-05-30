/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    totalEpisodes: 1,
    sources: [
        {
            file: 'https://example.com/404',
        },
    ],
    currentSource: 0,
    videoLink: 'https://example.com/404',
};
export const gogoApiSlice = createSlice({
    name: 'gogoApi',
    initialState,
    reducers: {
        setTotalEpisodes: (state, action) => {
            state.totalEpisodes = action.payload;
        },
        setCurrentSource: (state, action) => {
            if (action.payload < state.sources.length)
                return;
            state.currentSource = action.payload;
            state.videoLink = state.sources[state.currentSource].file;
        },
        setSources: (state, action) => {
            if (!action.payload || action.payload.length === 0) {
                state.sources = initialState.sources;
            }
            else {
                state.sources = action.payload;
            }
            state.currentSource = 0;
            state.videoLink = state.sources[state.currentSource].file;
        },
        resetSources: (state) => {
            state.sources = initialState.sources;
            state.currentSource = initialState.currentSource;
            state.videoLink = initialState.videoLink;
        },
    },
});
export const { setTotalEpisodes, setCurrentSource, setSources, resetSources } = gogoApiSlice.actions;
export default gogoApiSlice.reducer;
