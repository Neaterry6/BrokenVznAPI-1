import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { Player, Hls, Video } from '@vime/react';
import '@vime/core/themes/default.css';
import { setCurrentTime, setStartTime } from '@slices/timer';
import { useDispatch, useSelector } from '@store/store';
import VideoControls from './VideoControls';
const VideoPlayer = ({ src, poster }) => {
    const dispatch = useDispatch();
    const [startTime, currentTime] = useSelector((store) => [
        store.timer.startTime,
        store.timer.currentTime,
    ]);
    const [anime, episode] = useSelector((store) => [
        store.anime.anime,
        store.episode.episode,
    ]);
    const episodeRef = useRef(episode);
    const videoplayer = useRef(null);
    // Workaround for keyboard shortcuts not working
    useEffect(() => {
        // focus on videoplayer by default
        videoplayer.current.focus();
        // prevent default actions
        videoplayer.current.addEventListener('keydown', (e) => {
            e.preventDefault();
        });
        // Refocus on the videoplayer on fullscreen change
        videoplayer.current.onfullscreenchange = () => {
            videoplayer.current.focus();
        };
        // Enable fullscreen keyboard shortcuts in fullscreen
        document.addEventListener('keydown', (e) => {
            if (videoplayer.current?.isFullscreenActive &&
                e.target !== videoplayer.current) {
                // Create a new keyboard event
                const keyboardEvent = new KeyboardEvent('keydown', {
                    key: e.key,
                    code: e.code,
                    shiftKey: e.shiftKey,
                    ctrlKey: e.ctrlKey,
                    metaKey: e.metaKey,
                });
                // dispatch it to the videoplayer
                videoplayer.current.dispatchEvent(keyboardEvent);
            }
        });
    });
    const timeChangeCallback = (event) => {
        if (videoplayer.current.duration < 0)
            return;
        if (currentTime === Math.ceil(event.detail))
            return;
        dispatch(setCurrentTime(event.detail));
    };
    useEffect(() => {
        const savedState = localStorage.getItem(`Anime${anime}`) || '1-0';
        const [savedEpisode, savedTime] = savedState
            .split('-')
            .map((v) => parseInt(v, 10));
        if (savedEpisode === episode) {
            dispatch(setStartTime(savedTime));
        }
        else {
            dispatch(setStartTime(0));
        }
    }, [anime, dispatch, episode]);
    useEffect(() => {
        if (currentTime <= 120)
            return;
        if (videoplayer.current.duration - currentTime <= 180) {
            localStorage.removeItem(`Anime${anime}`);
            return;
        }
        localStorage.setItem(`Anime${anime}`, `${episodeRef.current}-${currentTime}`);
    }, [anime, currentTime, dispatch]);
    return (_jsxs(Player, { onVmCurrentTimeChange: timeChangeCallback, ref: videoplayer, tabIndex: 0, style: { outline: 'none' }, onVmPlaybackReady: () => {
            videoplayer.current.currentTime = startTime;
        }, children: [src && src.includes('m3u8') ? (_jsx(Hls, { version: "latest", poster: poster, children: _jsx("source", { "data-src": src, type: "application/x-mpegURL" }) }, src)) : (_jsx(Video, { poster: poster, children: _jsx("source", { "data-src": src, type: "video/mp4" }) }, src)), _jsx(VideoControls, {})] }));
};
export default VideoPlayer;
