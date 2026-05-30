import { spawn } from 'child_process';
export class YouTubeDlpAPI {
    async executeYtDlp(args) {
        return new Promise((resolve, reject) => {
            const process = spawn('yt-dlp', args);
            let stdout = '';
            let stderr = '';
            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            process.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                }
                else {
                    reject(new Error(`yt-dlp failed with code ${code}: ${stderr}`));
                }
            });
        });
    }
    // Search for videos
    async search(query, maxResults = 10) {
        try {
            const searchQuery = `ytsearch${maxResults}:${query}`;
            const args = [
                '--dump-json',
                '--no-playlist',
                '--flat-playlist',
                searchQuery
            ];
            const output = await this.executeYtDlp(args);
            const lines = output.trim().split('\n').filter(line => line.trim());
            const results = [];
            for (const line of lines) {
                try {
                    const data = JSON.parse(line);
                    if (data.id && data.title) {
                        results.push({
                            videoId: data.id,
                            title: data.title,
                            channel: data.uploader || data.channel || 'Unknown',
                            duration: this.formatDuration(data.duration || 0),
                            viewCount: this.formatViewCount(data.view_count || 0),
                            thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.id}/maxresdefault.jpg`,
                            uploadDate: data.upload_date || undefined
                        });
                    }
                }
                catch (parseError) {
                    console.error('Error parsing search result:', parseError);
                }
            }
            return results;
        }
        catch (error) {
            console.error('Search error:', error);
            throw new Error('Failed to search videos');
        }
    }
    // Get playable stream URL
    async getPlayInfo(videoId) {
        try {
            const url = this.constructYouTubeUrl(videoId);
            const args = [
                '--dump-json',
                '--format', 'best[ext=mp4]/best',
                '--no-playlist',
                url
            ];
            const output = await this.executeYtDlp(args);
            const data = JSON.parse(output.trim());
            return {
                title: data.title,
                thumbnail: data.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                duration: this.formatDuration(data.duration || 0),
                channel: data.uploader || data.channel || 'Unknown',
                viewCount: this.formatViewCount(data.view_count || 0),
                description: data.description,
                uploadDate: data.upload_date,
                streamUrl: data.url,
                format: data.ext || 'mp4'
            };
        }
        catch (error) {
            console.error('Play info error:', error);
            throw new Error('Failed to get play information');
        }
    }
    // Get video download URL
    async getVideoDownload(videoId, quality = 'best') {
        try {
            const url = this.constructYouTubeUrl(videoId);
            let format = 'best[ext=mp4]/best';
            // Handle quality preferences
            switch (quality.toLowerCase()) {
                case '720p':
                    format = 'best[height<=720][ext=mp4]/best[height<=720]';
                    break;
                case '480p':
                    format = 'best[height<=480][ext=mp4]/best[height<=480]';
                    break;
                case '360p':
                    format = 'best[height<=360][ext=mp4]/best[height<=360]';
                    break;
                case '1080p':
                    format = 'best[height<=1080][ext=mp4]/best[height<=1080]';
                    break;
                default:
                    format = 'best[ext=mp4]/best';
            }
            const args = [
                '--dump-json',
                '--format', format,
                '--no-playlist',
                url
            ];
            const output = await this.executeYtDlp(args);
            const data = JSON.parse(output.trim());
            return {
                title: data.title,
                thumbnail: data.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                duration: this.formatDuration(data.duration || 0),
                channel: data.uploader || data.channel || 'Unknown',
                viewCount: this.formatViewCount(data.view_count || 0),
                description: data.description,
                uploadDate: data.upload_date,
                downloadUrl: data.url,
                resolution: `${data.height}p` || 'Unknown',
                filesize: this.formatFilesize(data.filesize || data.filesize_approx),
                format: data.ext || 'mp4'
            };
        }
        catch (error) {
            console.error('Video download error:', error);
            throw new Error('Failed to get video download information');
        }
    }
    // Get audio download URL
    async getAudioDownload(videoId) {
        try {
            const url = this.constructYouTubeUrl(videoId);
            const args = [
                '--dump-json',
                '--format', 'bestaudio[ext=m4a]/bestaudio',
                '--no-playlist',
                url
            ];
            const output = await this.executeYtDlp(args);
            const data = JSON.parse(output.trim());
            return {
                title: data.title,
                thumbnail: data.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                duration: this.formatDuration(data.duration || 0),
                channel: data.uploader || data.channel || 'Unknown',
                viewCount: this.formatViewCount(data.view_count || 0),
                description: data.description,
                uploadDate: data.upload_date,
                downloadUrl: data.url,
                bitrate: `${data.abr}kbps` || 'Unknown',
                filesize: this.formatFilesize(data.filesize || data.filesize_approx),
                format: data.ext || 'm4a'
            };
        }
        catch (error) {
            console.error('Audio download error:', error);
            throw new Error('Failed to get audio download information');
        }
    }
    // Get video information only
    async getVideoInfo(videoId) {
        try {
            const url = this.constructYouTubeUrl(videoId);
            const args = [
                '--dump-json',
                '--no-download',
                '--no-playlist',
                url
            ];
            const output = await this.executeYtDlp(args);
            const data = JSON.parse(output.trim());
            return {
                title: data.title,
                thumbnail: data.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                duration: this.formatDuration(data.duration || 0),
                channel: data.uploader || data.channel || 'Unknown',
                viewCount: this.formatViewCount(data.view_count || 0),
                description: data.description,
                uploadDate: data.upload_date
            };
        }
        catch (error) {
            console.error('Video info error:', error);
            throw new Error('Failed to get video information');
        }
    }
    // Utility functions
    constructYouTubeUrl(videoId) {
        if (videoId.startsWith('http')) {
            return videoId;
        }
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    formatDuration(seconds) {
        if (!seconds || seconds === 0)
            return 'Unknown';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    formatViewCount(views) {
        if (!views || views === 0)
            return 'Unknown';
        if (views >= 1000000000) {
            return `${(views / 1000000000).toFixed(1)}B views`;
        }
        else if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}M views`;
        }
        else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}K views`;
        }
        return `${views} views`;
    }
    formatFilesize(bytes) {
        if (!bytes)
            return 'Unknown';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }
    // Playlist support
    async getPlaylistInfo(playlistUrl) {
        try {
            const args = [
                '--dump-json',
                '--flat-playlist',
                '--no-download',
                playlistUrl
            ];
            const output = await this.executeYtDlp(args);
            const lines = output.trim().split('\n').filter(line => line.trim());
            const videos = [];
            let playlistTitle = 'Unknown Playlist';
            for (const line of lines) {
                try {
                    const data = JSON.parse(line);
                    if (data._type === 'playlist') {
                        playlistTitle = data.title || playlistTitle;
                    }
                    else if (data.id && data.title) {
                        videos.push({
                            videoId: data.id,
                            title: data.title,
                            channel: data.uploader || 'Unknown',
                            duration: this.formatDuration(data.duration || 0),
                            viewCount: 'Unknown',
                            thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.id}/maxresdefault.jpg`
                        });
                    }
                }
                catch (parseError) {
                    console.error('Error parsing playlist item:', parseError);
                }
            }
            return { title: playlistTitle, videos };
        }
        catch (error) {
            console.error('Playlist info error:', error);
            throw new Error('Failed to get playlist information');
        }
    }
}
