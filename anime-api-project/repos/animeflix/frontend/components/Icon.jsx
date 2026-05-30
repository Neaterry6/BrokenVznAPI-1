import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const Icon = ({ icon, text, className }) => {
    const HeroIcon = icon;
    return (_jsxs("div", { className: `flex items-center space-x-1 ${className || ''}`, children: [_jsx(HeroIcon, { className: "h-4 w-4" }), _jsx("p", { className: "text-xs sm:text-sm", children: text })] }));
};
export default Icon;
