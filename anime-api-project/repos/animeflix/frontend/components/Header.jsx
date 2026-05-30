import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SearchIcon } from '@heroicons/react/outline';
import AnimeflixIcon from '@components/AnimeFlixIcon';
const Header = () => {
    const router = useRouter();
    const handleKeyPress = (event) => {
        if (event.key === 'Enter')
            router.push(`/search?keyword=${event.currentTarget.value}`);
    };
    return (_jsxs("header", { className: "sticky top-0 z-[51] flex h-12 w-full items-center bg-gray-900 shadow-md", children: [_jsx(Link, { href: "/", passHref: true, children: _jsx("a", { children: _jsx(AnimeflixIcon, { className: "ml-4 h-7 w-7 cursor-pointer sm:ml-6" }) }) }), _jsxs("div", { className: "ml-4 flex items-center rounded bg-gray-50 py-[1px] px-2 sm:ml-6", children: [_jsx(SearchIcon, { className: "h-4 w-4" }), _jsx("input", { className: "w-44 bg-transparent p-1 text-sm text-black placeholder-gray-400 outline-none sm:w-56 md:w-64 lg:w-72", placeholder: "Search for Anime to watch", onKeyPress: handleKeyPress })] })] }));
};
export default Header;
