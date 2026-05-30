import { useMemo } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch as useDispatchBase, useSelector as useSelectorBase, } from 'react-redux';
import anime from '@slices/anime';
import episode from '@slices/episode';
import gogoApi from '@slices/gogoApi';
import timer from '@slices/timer';
import videoSettings from '@slices/videoSettings';
const createStore = (preloadedState) => configureStore({
    reducer: {
        anime,
        episode,
        videoSettings,
        timer,
        gogoApi,
    },
    preloadedState,
});
let prevStore;
export const initialiseStore = (preloadedState) => {
    let newStore = prevStore ?? createStore(preloadedState);
    if (preloadedState && prevStore) {
        newStore = createStore({ ...prevStore.getState(), ...preloadedState });
        prevStore = undefined;
    }
    // For SSG and SSR always create a new store
    if (typeof window === 'undefined')
        return newStore;
    // Create the store once in the client
    if (!prevStore)
        prevStore = newStore;
    return newStore;
};
export const useStore = (preloadedState) => useMemo(() => initialiseStore(preloadedState), [preloadedState]);
// wrappers around the redux useDispatch and useSelectors for better types
export const useDispatch = () => useDispatchBase();
export const useSelector = (selector) => useSelectorBase(selector);
