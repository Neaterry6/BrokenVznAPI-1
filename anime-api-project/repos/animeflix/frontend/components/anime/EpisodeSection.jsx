import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef } from 'react';
import EpisodeCard from '@components/anime/Episode';
const Section = ({ anime, episodes }) => {
    const animeListRef = useRef(null);
    return (_jsxs(_Fragment, { children: [_jsx("p", { className: "mt-4 ml-3 text-base font-semibold text-white sm:ml-6 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl", children: "Episodes" }), _jsx("div", { tabIndex: 0, className: "mt-2 mb-8 ml-3 flex space-x-4 overflow-y-hidden overflow-x-scroll outline-none scrollbar-hide sm:ml-6", ref: animeListRef, onMouseEnter: () => animeListRef.current.focus(), children: new Array(episodes.episodeCount > 8 ? 8 : episodes.episodeCount)
                    .fill(1)
                    .map((_v, i) => (_jsx(EpisodeCard, { anime: anime, number: i + 1, episode: episodes.episodes.nodes[i] }, i + 1))) })] }));
};
export default Section;
