import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef } from 'react';
import AnimeCard from '@components/anime/Card';
const Section = ({ title, animeList }) => {
    const animeListRef = useRef(null);
    return (_jsxs("div", { children: [_jsx("p", { className: "mt-4 ml-3 text-base font-semibold text-white sm:ml-6 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl", children: title }), _jsx("div", { tabIndex: 0, className: "mt-2 mb-8 ml-2 flex space-x-4 overflow-y-hidden overflow-x-scroll p-1 outline-none scrollbar-hide sm:ml-6", ref: animeListRef, onMouseEnter: () => animeListRef.current.focus(), children: animeList.map((anime) => (_jsx(AnimeCard, { anime: anime }, anime.id))) })] }));
};
export default Section;
