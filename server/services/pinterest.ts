import axios from 'axios';
import * as cheerio from 'cheerio';

export interface PinterestSearchRequest {
  text: string;
}

export interface PinterestResponse {
  success: boolean;
  creator: string;
  data?: string[];
  error?: string;
  message?: string;
}

export interface PinterestPin {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link?: string;
  board?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    username: string;
  };
  created_at?: string;
  stats?: {
    saves: number;
    comments: number;
  };
}

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  pin_count: number;
  follower_count?: number;
  created_at?: string;
  privacy: string;
  owner: {
    id: string;
    username: string;
  };
}

export interface PinterestUser {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  follower_count?: number;
  following_count?: number;
  board_count?: number;
  pin_count?: number;
  image_url?: string;
  website_url?: string;
}

export interface PinterestSearchResult {
  success: boolean;
  data?: PinterestPin[];
  error?: string;
  creator: string;
  pagination?: {
    current_page: number;
    has_next: boolean;
    bookmark?: string;
  };
}

export interface PinterestBoardResult {
  success: boolean;
  data?: PinterestBoard[];
  error?: string;
  creator: string;
}

export interface PinterestUserResult {
  success: boolean;
  data?: PinterestUser;
  error?: string;
  creator: string;
}

export class PinterestService {
  private creator = '@BrokenVZN';

  async searchImages(query: string): Promise<PinterestResponse> {
    try {
      if (!query) {
        return {
          success: false,
          creator: this.creator,
          message: "Please provide a search query"
        };
      }

      // Use Pinterest search without hardcoded cookies for security
      const response = await axios.get(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });

      const $ = cheerio.load(response.data);
      const result: string[] = [];
      const finalResult: string[] = [];

      $('div > a').each((i, elem) => {
        const link = $(elem).find('img').attr('src');
        if (link) {
          result.push(link);
        }
      });

      result.forEach((v) => {
        if (v && v.includes('236')) {
          finalResult.push(v.replace(/236/g, '736')); // Replace image resolution
        }
      });

      finalResult.shift(); // Remove the first result if necessary

      if (!finalResult.length) {
        return {
          success: false,
          creator: this.creator,
          message: "No results found"
        };
      }

      return {
        success: true,
        creator: this.creator,
        data: finalResult
      };
    } catch (error) {
      return {
        success: false,
        creator: this.creator,
        error: error instanceof Error ? error.message : 'An error occurred while fetching data'
      };
    }
  }

  async searchPins(query: string, limit: number = 25): Promise<PinterestSearchResult> {
    try {
      if (!query) {
        return {
          success: false,
          error: "Please provide a search query",
          creator: this.creator
        };
      }

      // Simulate Pinterest pin search results
      // In a real implementation, this would use Pinterest API v5 with proper OAuth
      const mockPins: PinterestPin[] = [
        {
          id: "1",
          title: `${query} - Beautiful Design Inspiration`,
          description: `Amazing ${query} design ideas and inspiration for your next project`,
          image_url: `https://i.pinimg.com/564x/sample1.jpg`,
          link: `https://pinterest.com/pin/sample1/`,
          board: {
            id: "board1",
            name: "Design Ideas"
          },
          user: {
            id: "user1",
            username: "designlover"
          },
          created_at: new Date().toISOString(),
          stats: {
            saves: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 100)
          }
        },
        {
          id: "2", 
          title: `${query} - Creative Collection`,
          description: `Curated collection of ${query} pins for inspiration`,
          image_url: `https://i.pinimg.com/564x/sample2.jpg`,
          link: `https://pinterest.com/pin/sample2/`,
          board: {
            id: "board2",
            name: "Creative Collection"
          },
          user: {
            id: "user2",
            username: "creativemind"
          },
          created_at: new Date(Date.now() - 86400000).toISOString(),
          stats: {
            saves: Math.floor(Math.random() * 1500),
            comments: Math.floor(Math.random() * 150)
          }
        }
      ];

      return {
        success: true,
        data: mockPins.slice(0, limit),
        creator: this.creator,
        pagination: {
          current_page: 1,
          has_next: mockPins.length > limit,
          bookmark: "next_page_token"
        }
      };

    } catch (error) {
      console.error("Error searching Pinterest pins:", error);
      return {
        success: false,
        error: "Failed to search Pinterest pins",
        creator: this.creator
      };
    }
  }

  async getUserBoards(username: string): Promise<PinterestBoardResult> {
    try {
      if (!username) {
        return {
          success: false,
          error: "Please provide a username",
          creator: this.creator
        };
      }

      // Simulate user boards data
      const mockBoards: PinterestBoard[] = [
        {
          id: "board1",
          name: "Design Inspiration",
          description: "Beautiful design ideas and inspiration",
          image_url: "https://i.pinimg.com/564x/board1.jpg",
          pin_count: 250,
          follower_count: 1500,
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          privacy: "public",
          owner: {
            id: "user1",
            username: username
          }
        },
        {
          id: "board2",
          name: "Home Decor",
          description: "Home decoration and interior design ideas",
          image_url: "https://i.pinimg.com/564x/board2.jpg",
          pin_count: 180,
          follower_count: 800,
          created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
          privacy: "public",
          owner: {
            id: "user1",
            username: username
          }
        }
      ];

      return {
        success: true,
        data: mockBoards,
        creator: this.creator
      };

    } catch (error) {
      console.error("Error getting user boards:", error);
      return {
        success: false,
        error: "Failed to get user boards",
        creator: this.creator
      };
    }
  }

  async getUserProfile(username: string): Promise<PinterestUserResult> {
    try {
      if (!username) {
        return {
          success: false,
          error: "Please provide a username",
          creator: this.creator
        };
      }

      // Simulate user profile data
      const mockUser: PinterestUser = {
        id: "user1",
        username: username,
        first_name: "Pinterest",
        last_name: "User",
        bio: "Creative designer sharing inspiration and ideas",
        follower_count: 5000,
        following_count: 1200,
        board_count: 25,
        pin_count: 2500,
        image_url: `https://i.pinimg.com/564x/avatar_${username}.jpg`,
        website_url: `https://${username}.portfolio.com`
      };

      return {
        success: true,
        data: mockUser,
        creator: this.creator
      };

    } catch (error) {
      console.error("Error getting user profile:", error);
      return {
        success: false,
        error: "Failed to get user profile",
        creator: this.creator
      };
    }
  }

  async getBoardPins(boardId: string, limit: number = 25): Promise<PinterestSearchResult> {
    try {
      if (!boardId) {
        return {
          success: false,
          error: "Please provide a board ID",
          creator: this.creator
        };
      }

      // Simulate board pins data
      const mockPins: PinterestPin[] = [
        {
          id: "pin1",
          title: "Stunning Design Concept",
          description: "Beautiful design concept with modern aesthetics",
          image_url: "https://i.pinimg.com/564x/pin1.jpg",
          link: "https://pinterest.com/pin/pin1/",
          board: {
            id: boardId,
            name: "Design Board"
          },
          user: {
            id: "user1",
            username: "designer"
          },
          created_at: new Date().toISOString(),
          stats: {
            saves: Math.floor(Math.random() * 2000),
            comments: Math.floor(Math.random() * 200)
          }
        }
      ];

      return {
        success: true,
        data: mockPins.slice(0, limit),
        creator: this.creator,
        pagination: {
          current_page: 1,
          has_next: false
        }
      };

    } catch (error) {
      console.error("Error getting board pins:", error);
      return {
        success: false,
        error: "Failed to get board pins",
        creator: this.creator
      };
    }
  }

  async getTrendingPins(category?: string, limit: number = 25): Promise<PinterestSearchResult> {
    try {
      const categoryLabel = category || "trending";
      
      // Simulate trending pins data
      const mockTrendingPins: PinterestPin[] = [
        {
          id: "trending1",
          title: `${categoryLabel} - Trending Design`,
          description: `Popular ${categoryLabel} pins that are trending right now`,
          image_url: "https://i.pinimg.com/564x/trending1.jpg",
          link: "https://pinterest.com/pin/trending1/",
          board: {
            id: "trendingBoard1",
            name: "Trending Designs"
          },
          user: {
            id: "trendingUser1",
            username: "trendspotter"
          },
          created_at: new Date().toISOString(),
          stats: {
            saves: Math.floor(Math.random() * 5000),
            comments: Math.floor(Math.random() * 500)
          }
        },
        {
          id: "trending2",
          title: `${categoryLabel} - Popular Choice`,
          description: `Most popular ${categoryLabel} pins this week`,
          image_url: "https://i.pinimg.com/564x/trending2.jpg",
          link: "https://pinterest.com/pin/trending2/",
          board: {
            id: "trendingBoard2",
            name: "Popular Picks"
          },
          user: {
            id: "trendingUser2",
            username: "popularpicks"
          },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          stats: {
            saves: Math.floor(Math.random() * 4000),
            comments: Math.floor(Math.random() * 400)
          }
        }
      ];

      return {
        success: true,
        data: mockTrendingPins.slice(0, limit),
        creator: this.creator,
        pagination: {
          current_page: 1,
          has_next: mockTrendingPins.length > limit
        }
      };

    } catch (error) {
      console.error("Error getting trending pins:", error);
      return {
        success: false,
        error: "Failed to get trending pins",
        creator: this.creator
      };
    }
  }
}

export const pinterestService = new PinterestService();