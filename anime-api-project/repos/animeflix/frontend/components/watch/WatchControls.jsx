import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { toggleDub, toggleProxy } from '@store/slices/videoSettings';
import { useDispatch, useSelector } from '@store/store';
const Toggler = ({ label, checked, action }) => {
    const dispatch = useDispatch();
    return (_jsxs("label", { className: "p2 relative mr-2 flex items-center justify-between text-white", children: [label, _jsx("input", { type: "checkbox", checked: checked, onChange: () => dispatch(action), className: "peer absolute left-0 top-0 h-full w-full appearance-none" }), _jsx("span", { className: `
                  ml-2 flex h-5 w-9 flex-shrink-0 items-center
                  rounded-full bg-gray-300 p-1
                  after:h-4 after:w-4 after:rounded-full after:bg-gray-500 after:shadow-lg
                  after:duration-300 peer-checked:bg-red-500 peer-checked:after:translate-x-3 peer-checked:after:bg-gray-800
                ` })] }));
};
const WatchControls = () => {
    const [useProxy, useDub] = useSelector((store) => [
        store.videoSettings.useProxy,
        store.videoSettings.useDub,
    ]);
    return (_jsxs("div", { className: "m-2 flex space-x-4", children: [_jsx(Toggler, { label: "Use Proxy?", checked: useProxy, action: toggleProxy() }), _jsx(Toggler, { label: "Watch Dubbed?", checked: useDub, action: toggleDub() })] }));
};
export default WatchControls;
