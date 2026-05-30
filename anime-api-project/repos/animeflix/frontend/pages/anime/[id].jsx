import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { animePage, getKitsuEpisodes } from '@animeflix/api';
import { MediaStatus, } from '@animeflix/api/aniList';
import { EmojiSadIcon } from '@heroicons/react/solid';
import { NextSeo } from 'next-seo';
import Banner from '@components/anime/Banner';
import EpisodeSection from '@components/anime/EpisodeSection';
import Section from '@components/anime/Section';
import Header from '@components/Header';
export const getServerSideProps = async (context) => {
    let { id } = context.params;
    id = typeof id === 'string' ? id : id.join(' ');
    const data = await animePage({
        id: parseInt(id, 10),
        perPage: 12,
    });
    if (!data.Media) {
        return {
            notFound: true,
        };
    }
    let episodes = {
        episodeCount: 0,
        episodes: null,
    };
    // dont fetch episodes if the anime hasn't released
    if (data.Media.status !== MediaStatus.NotYetReleased) {
        // fetch episode list
        const { title, startDate, season } = data.Media;
        const english = getKitsuEpisodes(title.english, season, startDate.year);
        const romaji = getKitsuEpisodes(title.romaji, season, startDate.year);
        episodes = await Promise.all([english, romaji]).then((r) => {
            return r[0].episodeCount > 0 ? r[0] : r[1];
        });
    }
    return {
        props: {
            anime: data.Media,
            recommended: data.recommended.recommendations.map((r) => r.mediaRecommendation),
            episodes,
        },
    };
};
const Anime = ({ anime, recommended, episodes, }) => {
    return (_jsxs(_Fragment, { children: [_jsx(NextSeo, { title: `${anime.title.romaji || anime.title.english} | Animeflix`, description: anime.description, openGraph: {
                    images: [
                        {
                            type: 'large',
                            url: anime.bannerImage,
                            alt: `Banner Image for ${anime.title.english || anime.title.romaji}`,
                        },
                        {
                            type: 'small',
                            url: anime.coverImage.large || anime.coverImage.medium,
                            alt: `Cover Image for ${anime.title.english || anime.title.romaji}`,
                        },
                    ],
                } }), _jsx(Header, {}), _jsx(Banner, { anime: anime }), anime.format !== 'MOVIE' && episodes.episodeCount > 0 && (_jsx(EpisodeSection, { anime: anime, episodes: episodes })), anime.format !== 'MOVIE' && episodes.episodeCount === 0 && (_jsxs("p", { className: "mt-4 ml-3 flex items-center justify-center text-base font-semibold text-white sm:ml-6 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl", children: ["no episodes found", _jsx(EmojiSadIcon, { className: "w-8" })] })), recommended.length > 0 ? (_jsx(Section, { animeList: recommended, title: "Recommended" })) : (_jsxs("p", { className: "mt-4 ml-3 flex items-center justify-center text-base font-semibold text-white sm:ml-6 sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl", children: ["no recommendations found", _jsx(EmojiSadIcon, { className: "w-8" })] }))] }));
};
export default Anime;
