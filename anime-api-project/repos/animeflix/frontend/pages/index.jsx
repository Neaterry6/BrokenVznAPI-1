import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getAnimeByIds, indexPage } from '@animeflix/api';
import Banner from '@components/anime/Banner';
import Section from '@components/anime/Section';
import Header from '@components/Header';
import progressBar from '@components/Progress';
export const getServerSideProps = async () => {
    const data = await indexPage({
        perPage: 8,
        page: 1,
        seasonYear: new Date().getFullYear(),
    });
    return {
        props: {
            ...data,
        },
    };
};
const Index = ({ banner, trending, popular, topRated, }) => {
    // finish the progress bar
    progressBar.finish();
    const [recentlyWatched, setRecentlyWatched] = useState([]);
    // populate recentlyWatched
    useEffect(() => {
        const ids = Object.keys(localStorage)
            .filter((key) => key.startsWith('Anime'))
            .map((key) => parseInt(key.replace('Anime', ''), 10));
        getAnimeByIds({
            perPage: 12,
            page: 1,
            ids,
        }).then((data) => setRecentlyWatched(data.Page.media));
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsx(Banner, { anime: banner }), _jsx(Section, { title: "Trending Now", animeList: trending.media }), recentlyWatched.length > 0 ? (_jsx(Section, { title: "Continue watching", animeList: recentlyWatched })) : null, _jsx(Section, { title: "Popular", animeList: popular.media }), _jsx(Section, { title: "Top Rated (All time)", animeList: topRated.media })] }));
};
export default Index;
