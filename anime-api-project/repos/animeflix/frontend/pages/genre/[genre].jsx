import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRouter } from 'next/router';
import { searchGenre } from '@animeflix/api';
import { NextSeo } from 'next-seo';
import Card from '@components/anime/Card';
import Header from '@components/Header';
import progressBar from '@components/Progress';
export const getServerSideProps = async (context) => {
    let { genre } = context.params;
    genre = typeof genre === 'string' ? genre : genre.join('');
    const data = await searchGenre({
        genre,
        perPage: 25,
        page: 1,
    });
    return {
        props: {
            searchResults: data.Page.media,
        },
    };
};
const Genre = ({ searchResults, }) => {
    const router = useRouter();
    const { genre } = router.query;
    progressBar.finish();
    return (_jsxs(_Fragment, { children: [_jsx(NextSeo, { title: `Animes for Genre ${genre} | Animeflix` }), _jsx(Header, {}), _jsxs("p", { className: "mt-4 ml-3 text-base font-semibold text-white sm:ml-6 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl", children: ["Found ", searchResults.length, " results for Genre ", genre] }), _jsx("div", { className: "mt-2 grid grid-cols-2 place-items-center gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6", children: searchResults.map((anime) => (_jsx(Card, { anime: anime }, anime.id))) })] }));
};
export default Genre;
