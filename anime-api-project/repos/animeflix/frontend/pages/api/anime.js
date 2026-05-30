import { getAnime } from '@animeflix/api/gogoanime';
export default async function handler(req, res) {
    let { id, episode } = req.query;
    id = typeof id === 'string' ? id : id.join('');
    episode = typeof episode === 'string' ? episode : episode.join('');
    res.json(await getAnime(parseInt(id, 10), parseInt(episode, 10)));
}
