import useSWR from 'swr';
const useVideoSources = (id, episode, dub) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const fetcher = async (id, episode) => fetch(`/api/anime/?id=${id}&episode=${episode}`).then((res) => res.json());
    const { data, error } = useSWR([id, episode], fetcher, {
        revalidateOnFocus: false,
    });
    return {
        sources: dub ? data?.dub.sources : data?.sub.sources,
        referer: dub ? data?.dub.Referer : data?.sub.Referer,
        episodes: data?.episodes,
        isLoading: !error && !data,
        isError: error,
    };
};
export default useVideoSources;
