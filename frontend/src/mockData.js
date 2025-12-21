// Mock data for IPTV Smarters Pro clone

export const mockChannels = [
  {
    id: 1,
    name: "HBO",
    logo: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=400&fit=crop",
    category: "Entertainment",
    epg: {
      current: { title: "Game of Thrones", time: "20:00 - 21:00" },
      next: { title: "Succession", time: "21:00 - 22:00" }
    },
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 2,
    name: "ESPN",
    logo: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop",
    category: "Sports",
    epg: {
      current: { title: "NBA Live", time: "19:30 - 22:00" },
      next: { title: "SportsCenter", time: "22:00 - 23:00" }
    },
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 3,
    name: "CNN",
    logo: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=400&fit=crop",
    category: "News",
    epg: {
      current: { title: "Breaking News", time: "20:00 - 21:00" },
      next: { title: "World Report", time: "21:00 - 22:00" }
    },
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 4,
    name: "Discovery",
    logo: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&h=400&fit=crop",
    category: "Documentary",
    epg: {
      current: { title: "Planet Earth", time: "20:00 - 21:00" },
      next: { title: "Wild Life", time: "21:00 - 22:00" }
    },
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 5,
    name: "Comedy Central",
    logo: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=400&fit=crop",
    category: "Entertainment",
    epg: {
      current: { title: "Stand Up Comedy", time: "20:00 - 21:00" },
      next: { title: "Late Night Show", time: "21:00 - 22:00" }
    },
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 6,
    name: "National Geographic",
    logo: "https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=400&h=400&fit=crop",
    category: "Documentary",
    epg: {
      current: { title: "Wildlife Adventures", time: "20:00 - 21:00" },
      next: { title: "Ocean Mysteries", time: "21:00 - 22:00" }
    },
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 7,
    name: "MTV",
    logo: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
    category: "Music",
    epg: {
      current: { title: "Top Music Videos", time: "20:00 - 21:00" },
      next: { title: "Live Concert", time: "21:00 - 22:00" }
    },
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 8,
    name: "Fox Sports",
    logo: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop",
    category: "Sports",
    epg: {
      current: { title: "Football Match", time: "20:00 - 22:00" },
      next: { title: "Post Game Analysis", time: "22:00 - 23:00" }
    },
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  }
];

export const mockMovies = [
  {
    id: 1,
    title: "The Dark Knight",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=450&fit=crop",
    year: 2008,
    rating: 9.0,
    duration: "152 min",
    genre: "Action, Crime, Drama",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 2,
    title: "Inception",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop",
    year: 2010,
    rating: 8.8,
    duration: "148 min",
    genre: "Action, Sci-Fi, Thriller",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 3,
    title: "Interstellar",
    poster: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=450&fit=crop",
    year: 2014,
    rating: 8.6,
    duration: "169 min",
    genre: "Adventure, Drama, Sci-Fi",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 4,
    title: "The Matrix",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    year: 1999,
    rating: 8.7,
    duration: "136 min",
    genre: "Action, Sci-Fi",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 5,
    title: "Gladiator",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop",
    year: 2000,
    rating: 8.5,
    duration: "155 min",
    genre: "Action, Adventure, Drama",
    description: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 6,
    title: "Avatar",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=450&fit=crop",
    year: 2009,
    rating: 7.8,
    duration: "162 min",
    genre: "Action, Adventure, Fantasy",
    description: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world.",
    streamUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
  }
];

export const mockSeries = [
  {
    id: 1,
    title: "Breaking Bad",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop",
    year: 2008,
    rating: 9.5,
    seasons: 5,
    genre: "Crime, Drama, Thriller",
    description: "A high school chemistry teacher turned methamphetamine producer partners with a former student.",
    seasonData: [
      {
        season: 1,
        episodes: [
          { episode: 1, title: "Pilot", duration: "58 min" },
          { episode: 2, title: "Cat's in the Bag", duration: "48 min" },
          { episode: 3, title: "And the Bag's in the River", duration: "48 min" }
        ]
      },
      {
        season: 2,
        episodes: [
          { episode: 1, title: "Seven Thirty-Seven", duration: "47 min" },
          { episode: 2, title: "Grilled", duration: "47 min" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Stranger Things",
    poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop",
    year: 2016,
    rating: 8.7,
    seasons: 4,
    genre: "Drama, Fantasy, Horror",
    description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.",
    seasonData: [
      {
        season: 1,
        episodes: [
          { episode: 1, title: "The Vanishing of Will Byers", duration: "49 min" },
          { episode: 2, title: "The Weirdo on Maple Street", duration: "56 min" }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "The Crown",
    poster: "https://images.unsplash.com/photo-1512070679279-8988d32161be?w=300&h=450&fit=crop",
    year: 2016,
    rating: 8.6,
    seasons: 6,
    genre: "Biography, Drama, History",
    description: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the 20th century.",
    seasonData: [
      {
        season: 1,
        episodes: [
          { episode: 1, title: "Wolferton Splash", duration: "57 min" },
          { episode: 2, title: "Hyde Park Corner", duration: "63 min" }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "The Mandalorian",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop",
    year: 2019,
    rating: 8.7,
    seasons: 3,
    genre: "Action, Adventure, Sci-Fi",
    description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
    seasonData: [
      {
        season: 1,
        episodes: [
          { episode: 1, title: "Chapter 1: The Mandalorian", duration: "39 min" },
          { episode: 2, title: "Chapter 2: The Child", duration: "33 min" }
        ]
      }
    ]
  }
];

export const categories = {
  liveTV: ["All", "Entertainment", "Sports", "News", "Documentary", "Music", "Kids"],
  movies: ["All", "Action", "Drama", "Comedy", "Sci-Fi", "Thriller", "Horror"],
  series: ["All", "Drama", "Comedy", "Action", "Sci-Fi", "Fantasy"]
};
