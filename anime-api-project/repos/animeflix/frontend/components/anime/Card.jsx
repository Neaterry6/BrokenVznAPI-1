import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Image from 'next/image';
import Link from 'next/link';
import { ClockIcon, ThumbUpIcon } from '@heroicons/react/outline';
import { PlayIcon } from '@heroicons/react/solid';
import Icon from '@components/Icon';
import { base64SolidImage } from '@utility/image';
const Card = ({ anime }) => {
    const title = anime.title.romaji || anime.title.english;
    return (_jsx(Link, { href: `/anime/${anime.id}`, passHref: true, children: _jsxs("a", { className: "w-46 transform p-2 transition duration-300 ease-out hover:scale-105 sm:w-56", children: [_jsx("div", { className: "aspect-w-7 aspect-h-9 relative w-40 sm:w-52", children: _jsx(Image, { alt: "Cover Image", src: anime.coverImage.large || anime.coverImage.medium, layout: "fill", objectFit: "cover", objectPosition: "center", className: "rounded-md", placeholder: "blur", blurDataURL: `data:image/svg+xml;base64,${base64SolidImage(anime.coverImage.color)}` }) }), _jsxs("div", { children: [_jsx("p", { className: "mt-2 h-9 text-sm font-bold text-white line-clamp-2", children: title }), _jsxs("div", { className: "mt-3 flex space-x-2 text-xs text-white", children: [_jsx(Icon, { icon: PlayIcon, text: anime.format, className: "hidden sm:flex" }), _jsx(Icon, { icon: ClockIcon, text: `${anime.duration} Min` }), _jsx(Icon, { icon: ThumbUpIcon, text: `${anime.meanScore}%` })] })] })] }) }));
};
export default Card;
