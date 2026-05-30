import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Image from 'next/image';
import Link from 'next/link';
const Card = ({ anime, number, episode }) => {
    const title = episode ? episode.titles.canonical : `Episode No. ${number}`;
    return (_jsx(Link, { href: `/watch/${anime.id}?episode=${number}`, passHref: true, children: _jsxs("a", { className: "w-64 transform cursor-pointer p-2 transition duration-300 ease-out hover:scale-105 sm:w-80", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "aspect-w-3 aspect-h-2 relative w-64 sm:w-80", children: _jsx(Image, { alt: "Cover Image", src: (episode && episode.thumbnail?.original.url) ||
                                    anime.coverImage.large ||
                                    anime.coverImage.medium ||
                                    anime.bannerImage, objectFit: "cover", layout: "fill", objectPosition: "center", className: "rounded-md" }) }), _jsx("p", { className: "absolute top-0 right-0 mt-2 h-12 text-xl font-bold text-white", children: number })] }), _jsx("div", { children: _jsx("p", { className: "mt-2 text-sm font-bold text-white line-clamp-2", children: title }) })] }) }));
};
export default Card;
