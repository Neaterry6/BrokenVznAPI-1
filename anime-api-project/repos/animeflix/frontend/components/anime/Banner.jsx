import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ClockIcon, ThumbUpIcon } from '@heroicons/react/outline';
import { PlayIcon } from '@heroicons/react/solid';
import Genre from '@components/Genre';
import Icon from '@components/Icon';
import progressBar from '@components/Progress';
import { stripHtml } from '@utility/utils';
const Banner = ({ anime }) => {
    const router = useRouter();
    // finish the progress bar if the bannerimage doesn't exist
    useEffect(() => {
        if (!anime.bannerImage)
            progressBar.finish();
    }, [anime.bannerImage]);
    return (_jsxs("div", { className: "relative h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[450px]", children: [anime.bannerImage && (_jsx(Image, { priority: true, src: anime.bannerImage, alt: `Banner for ${anime.title.english || anime.title.romaji}`, layout: "fill", objectFit: "cover", className: "opacity-60", onLoadingComplete: progressBar.finish })), _jsxs("div", { className: "absolute ml-4 mt-4 space-y-2 text-white sm:ml-8 sm:mt-6 md:space-y-3 lg:mt-8 xl:mt-10 2xl:mt-12", children: [_jsx("p", { className: "text-xl font-extrabold line-clamp-1 sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl", children: anime.title.romaji || anime.title.english }), _jsx("p", { className: "text-sm font-normal text-gray-300 line-clamp-1 sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl", children: anime.title.english ?? anime.title.romaji }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Icon, { icon: PlayIcon, text: anime.format }), _jsx(Icon, { icon: ClockIcon, text: `${anime.duration} Min/Ep` }), _jsx(Icon, { icon: ThumbUpIcon, text: `${anime.meanScore}%` })] }), _jsx("div", { className: "mr-2 flex flex-wrap gap-x-2 gap-y-1 sm:gap-x-3 md:gap-x-4", children: anime.genres.map((genre) => (_jsx(Genre, { genre: genre }, genre))) }), _jsx("p", { className: "hidden max-w-3xl md:block md:line-clamp-3 lg:line-clamp-4 xl:line-clamp-5 2xl:line-clamp-6", children: stripHtml(anime.description) }), _jsx(Link, { href: `/${router.route === '/' ? 'anime' : 'watch'}/${anime.id}`, passHref: true, children: _jsx("a", { children: _jsxs("button", { className: "mt-2 flex transform items-center rounded-lg bg-[#C3073F] px-2 py-1 text-xs text-white transition duration-300 ease-in active:scale-90 sm:text-sm md:text-base", children: [_jsx(PlayIcon, { className: "mr-1 w-5" }), router.route === '/' ? 'Read More' : 'Watch Now'] }) }) })] })] }));
};
export default Banner;
