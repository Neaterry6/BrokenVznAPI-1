import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { watchPage } from '@animeflix/api';
import { NextSeo } from 'next-seo';
import Genre from '@components/Genre';
import Header from '@components/Header';
import progressBar from '@components/Progress';
import RecommendationCard from '@components/watch/Card';
import Episode from '@components/watch/Episode';
import WatchControls from '@components/watch/WatchControls';
import useVideoSources from '@hooks/useVideoSources';
import { setAnime } from '@slices/anime';
import { setEpisode } from '@slices/episode';
import { setSources, setTotalEpisodes, resetSources } from '@slices/gogoApi';
import { setProxy } from '@slices/videoSettings';
import { initialiseStore, useDispatch, useSelector } from '@store/store';
import { convertToDate, convertToTime } from '@utility/time';
import { arrayToString, proxyUrl } from '@utility/utils';
import { proxyFreeUrls } from '../../constants';
const VideoPlayer = dynamic(() => import('@components/watch/VideoPlayer'), {
    ssr: false,
});
export const getServerSideProps = async (context) => {
    const store = initialiseStore();
    const { id } = context.params;
    const { episode } = context.query;
    store.dispatch(setAnime(parseInt(arrayToString(id), 10)));
    if (episode) {
        store.dispatch(setEpisode(parseInt(arrayToString(episode), 10)));
    }
    const data = await watchPage({
        id: parseInt(arrayToString(id), 10),
        perPage: 20,
    });
    const recommended = data.recommended.recommendations.map((anime) => anime.mediaRecommendation);
    return {
        props: {
            anime: data.anime,
            recommended,
            initialReduxState: store.getState(),
        },
    };
};
const Watch = ({ anime, recommended, }) => {
    // finish the progress bar
    progressBar.finish();
    const router = useRouter();
    const dispatch = useDispatch();
    const [animeId, episode] = useSelector((store) => [
        store.anime.anime,
        store.episode.episode,
    ]);
    const { useDub, useProxy } = useSelector((store) => store.videoSettings);
    const videoLink = useSelector((store) => store.gogoApi.videoLink);
    const routerRef = useRef(router);
    useEffect(() => {
        // only run when the initial episode value was not supplied
        if (routerRef.current.query.episode)
            return;
        // get the saved episode
        const savedState = localStorage.getItem(`Anime${animeId}`) || '1-0';
        const savedEpisode = savedState.split('-').map((v) => parseInt(v, 10))[0];
        // update the episode
        dispatch(setEpisode(savedEpisode));
    }, [animeId, dispatch]);
    // update the router url
    useEffect(() => {
        routerRef.current.replace({
            pathname: '/watch/[id]',
            query: { id: animeId, episode },
        }, `/watch/${animeId}/?episode=${episode}`, {
            shallow: true,
        });
    }, [animeId, episode]);
    // get the videolink, episode of the anime
    const { sources, referer, isError, isLoading, episodes } = useVideoSources(animeId, episode, useDub);
    // set the videosources
    useEffect(() => {
        if (isLoading) {
            dispatch(resetSources());
        }
        dispatch(setSources(sources));
    }, [dispatch, isLoading, sources]);
    // set the total episodes the animes has
    useEffect(() => {
        if (isLoading)
            return;
        dispatch(setTotalEpisodes(episodes));
    }, [dispatch, episodes, isLoading]);
    // set the should use proxy by matching regex
    useEffect(() => {
        if (isLoading)
            return;
        dispatch(setProxy(!videoLink.match(proxyFreeUrls)));
    }, [dispatch, isLoading, videoLink]);
    // get data about next airing episode
    const { nextAiringEpisode } = anime;
    return (_jsxs(_Fragment, { children: [_jsx(NextSeo, { title: `${anime.title.romaji || anime.title.english} | Episode ${episode}`, description: anime.description, openGraph: {
                    images: [
                        {
                            type: 'large',
                            url: anime.bannerImage,
                            alt: `Banner Image for ${anime.title.english || anime.title.romaji}`,
                        },
                        {
                            url: anime.coverImage.large || anime.coverImage.medium,
                            alt: `Cover Image for ${anime.title.english || anime.title.romaji}`,
                        },
                    ],
                } }), _jsx(Header, {}), _jsxs("div", { className: "space-x-4 sm:mt-4 lg:flex", children: [_jsxs("div", { className: "mx-auto max-w-[800px] flex-shrink-0 sm:p-4 lg:mx-0 lg:ml-4 lg:w-[65%] lg:max-w-full lg:p-0", children: [!isError ? (_jsx(VideoPlayer, { src: useProxy ? proxyUrl(videoLink, referer) : videoLink, poster: anime.bannerImage })) : (_jsx("p", { className: "mt-4 ml-3 text-base font-semibold text-white sm:ml-6 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl", children: "Sorry, the anime video couldn't be found" })), _jsx("div", { className: "flex w-full items-center justify-between", children: _jsx("p", { className: "m-2 mt-4 text-base font-semibold text-white sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl", children: `${anime.title.romaji || anime.title.english}${anime.format !== 'MOVIE' ? ` | Episode ${episode}` : ''}` }) }), _jsx("div", { className: "mx-3 flex flex-wrap gap-x-1 gap-y-1 sm:gap-x-2", children: anime.genres.map((genre) => (_jsx(Genre, { genre: genre }, genre))) }), nextAiringEpisode ? (_jsxs("div", { className: "mt-2 p-2 text-gray-400", children: [anime.title.romaji || anime.title.english, " Episode", ' ', nextAiringEpisode.episode, " will release on the", ' ', _jsxs("div", { className: "inline-block font-bold text-gray-400", children: [convertToDate(nextAiringEpisode.airingAt * 1000), "."] }), ' ', "Further episodes of the anime will air every", ' ', convertToTime(nextAiringEpisode.airingAt * 1000), "."] })) : null, _jsx(WatchControls, {}), _jsx(Episode, {}), _jsx("p", { className: "m-2 text-gray-400 line-clamp-6 md:line-clamp-none", children: anime.description.replace(/<\w*\\?>/g, '') })] }), _jsxs("div", { className: "mx-auto", children: [_jsx("p", { className: "text-base font-semibold text-white sm:text-lg md:text-xl lg:mt-0 lg:text-2xl xl:text-3xl 2xl:text-4xl", children: "Recommended animes" }), recommended.map((recommendation) => (_jsx(RecommendationCard, { anime: recommendation }, recommendation.id)))] })] })] }));
};
export default Watch;
