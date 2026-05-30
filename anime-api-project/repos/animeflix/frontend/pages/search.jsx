import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRouter } from 'next/router';
import { searchAnime } from '@animeflix/api';
import { NextSeo } from 'next-seo';
import Card from '@components/anime/Card';
import Header from '@components/Header';
import progressBar from '@components/Progress';
export const getServerSideProps = async (context) => {
    const { keyword } = context.query;
    const data = await searchAnime({
        keyword: typeof keyword === 'string' ? keyword : keyword.join(' '),
        page: 1,
        perPage: 20,
    });
    return {
        props: {
            searchResults: data,
        },
    };
};
const Search = ({ searchResults, }) => {
    const router = useRouter();
    const { keyword } = router.query;
    progressBar.finish();
    return (_jsxs(_Fragment, { children: [_jsx(NextSeo, { title: `Results for ${keyword} | Animeflix` }), _jsx(Header, {}), _jsxs("p", { className: "mt-4 ml-3 text-base text-white sm:ml-6 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl", children: ["Results for ", keyword] }), _jsx("div", { className: "mt-2 grid grid-cols-2 place-items-center gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6", children: searchResults.Page.media.map((anime) => (_jsx(Card, { anime: anime }, anime.id))) })] }));
};
export default Search;
