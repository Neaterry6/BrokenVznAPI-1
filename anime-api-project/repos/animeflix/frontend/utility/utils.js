export const proxyUrl = (url, referer) => {
    return `/api/video/proxy?src=${encodeURIComponent(url)}&referer=${encodeURIComponent(referer)}`;
};
export const arrayToString = (data) => typeof data === 'string' ? data : data.join('');
export const stripHtml = (data) => data.replace(/<\/?\w*\\?>/gm, '');
