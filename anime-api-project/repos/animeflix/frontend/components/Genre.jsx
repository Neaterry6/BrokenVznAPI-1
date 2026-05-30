import { jsx as _jsx } from "react/jsx-runtime";
import Link from 'next/link';
const Genre = ({ genre }) => {
    return (_jsx(Link, { href: `/genre/${genre}`, passHref: true, children: _jsx("a", { className: "transform rounded bg-black p-1 text-xs text-white transition duration-300 ease-out hover:scale-105 sm:text-sm", children: genre }) }));
};
export default Genre;
