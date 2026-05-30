import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ClockIcon, ThumbUpIcon } from '@heroicons/react/outline';
import { PlayIcon } from '@heroicons/react/solid';
import Icon from '@components/Icon';
import { base64SolidImage } from '@utility/image';
const Card = ({ anime }) => {
    return (_jsx(Link, { href: `/watch/${anime.id}`, passHref: true, children: _jsxs("a", { className: "ml-2 mr-4 flex transform space-x-4 py-2 text-white transition duration-300 ease-out hover:scale-105", children: [_jsx("div", { className: "aspect-h-1 aspect-w-3 relative w-24 flex-shrink-0", children: _jsx(Image, { alt: anime.title.english || anime.title.romaji, src: anime.coverImage.large || anime.coverImage.medium, layout: "fill", objectFit: "cover", className: "rounded-md", placeholder: "blur", blurDataURL: `data:image/svg+xml;base64,${base64SolidImage(anime.coverImage.color)}` }) }), _jsxs("div", { className: "flex flex-col", children: [_jsx("p", { className: "line-clamp-1", children: anime.title.english || anime.title.romaji }), _jsx("p", { className: "text-gray-400 line-clamp-2", children: anime.description.replace(/<\w*\\?>/g, '') }), _jsxs("div", { className: "m-4 flex justify-end space-x-2 text-xs text-white", children: [_jsx(Icon, { icon: PlayIcon, text: anime.format, className: "hidden sm:flex" }), _jsx(Icon, { icon: ClockIcon, text: `${anime.duration} Min` }), _jsx(Icon, { icon: ThumbUpIcon, text: `${anime.meanScore}%` })] })] })] }) }));
};
export default Card;
