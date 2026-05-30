import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React, { useRef, useState } from 'react';
import { setEpisode } from '@slices/episode';
import { useDispatch, useSelector } from '@store/store';
const PageButton = ({ start, end, onClick }) => {
    return (_jsxs("button", { onClick: onClick, className: "rounded-md bg-gray-700 px-2 py-1 text-gray-300 transition duration-75 ease-out hover:bg-gray-800 active:scale-90", children: [start, "-", end] }));
};
const Episode = () => {
    const episodes = useSelector((store) => store.gogoApi.totalEpisodes);
    const dispatch = useDispatch();
    const [currentPage, setPage] = useState(1);
    const inputRef = useRef(null);
    // Show 100 episodes per page.
    // for 123 episodes there should be 2 pages
    const pages = Math.ceil(episodes / 100);
    const episodeArray = Array.from({ length: episodes }, (_, i) => i + 1);
    return (_jsxs("div", { children: [_jsxs("div", { className: "m-2 flex", children: [_jsx("span", { className: "text-gray-300 md:text-lg", children: "Go to episode: " }), _jsx("input", { ref: inputRef, className: "ml-2 w-32 rounded-sm p-1 text-sm text-gray-800 placeholder-gray-700 outline-none md:text-base", placeholder: "Episode no.", onKeyDown: (e) => {
                            if (e.key !== 'Enter')
                                return;
                            dispatch(setEpisode(parseInt(inputRef.current.value, 10)));
                            inputRef.current.value = '';
                        } })] }), episodes && (_jsxs("div", { className: "m-2", children: [_jsxs("div", { className: "flex space-x-2", children: [_jsx("span", { className: "text-lg text-gray-300", children: "Episodes: " }), _jsx("div", { className: "flex flex-wrap space-x-2", children: new Array(pages).fill(1).map((_v, i) => (_jsx(PageButton, { start: i * 100 + 1, end: i * 100 + 100 > episodes ? episodes : i * 100 + 100, onClick: () => setPage(i + 1) }, i + 1))) })] }), _jsx("div", { className: "grid grid-cols-11 gap-x-2 gap-y-1 py-1 sm:grid-cols-[repeat(16,_minmax(0,_1fr))] lg:grid-cols-[repeat(20,_minmax(0,_1fr))]  xl:grid-cols-[repeat(25,_minmax(0,_1fr))]", children: episodeArray
                            .slice((currentPage - 1) * 100, currentPage * 100)
                            .map((v) => (_jsx("div", { className: "rounded-sm bg-gray-100 py-[1px] px-1 text-gray-800 hover:bg-gray-400", onClick: () => dispatch(setEpisode(v)), children: v }, v))) })] }))] }));
};
export default Episode;
