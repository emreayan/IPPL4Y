// Mock IPTV data with categories for Live TV, Series, and Movies

// LIVE TV CHANNELS
export const liveCategories = [
  {
    id: 'cat_news',
    name: 'Haber',
    visible: true,
    channels: [
      {
        id: 'ch_1',
        name: 'TRT Haber',
        logo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=400&fit=crop',
        streamUrl: 'http://example.com/stream1.m3u8',
        visible: true,
        epg: {
          current: { title: 'Ana Haber Bülteni', time: '20:00 - 21:00' },
          next: { title: 'Gece Haberleri', time: '21:00 - 22:00' }
        }
      },
      {
        id: 'ch_2',
        name: 'CNN Türk',
        logo: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=400&h=400&fit=crop',
        streamUrl: 'http://example.com/stream2.m3u8',
        visible: true,
        epg: {
          current: { title: 'Canlı Yayın', time: '19:00 - 22:00' },
          next: { title: 'Gece Görüşü', time: '22:00 - 23:00' }
        }
      },
      {
        id: 'ch_3',
        name: 'NTV',
        logo: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=400&fit=crop',
        streamUrl: 'http://example.com/stream3.m3u8',
        visible: true,
        epg: {
          current: { title: 'Ana Haber', time: '20:00 - 21:00' },
          next: { title: 'Ekonomi Saati', time: '21:00 - 22:00' }
        }
      }
    ]
  },
  {
    id: 'cat_sports',
    name: 'Spor',
    visible: true,
    channels: [
      {
        id: 'ch_4',
        name: 'beIN Sports 1',
        logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',
        streamUrl: 'http://example.com/stream4.m3u8',
        visible: true,
        epg: {
          current: { title: 'Süper Lig Maçı', time: '19:00 - 21:00' },
          next: { title: 'Maç Özeti', time: '21:00 - 22:00' }
        }
      },
      {
        id: 'ch_5',
        name: 'TRT Spor',
        logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop',
        streamUrl: 'http://example.com/stream5.m3u8',
        visible: true,
        epg: {
          current: { title: 'Basketbol Maçı', time: '20:00 - 22:00' },
          next: { title: 'Spor Haberleri', time: '22:00 - 23:00' }
        }
      }
    ]
  },
  {
    id: 'cat_entertainment',
    name: 'Eğlence',
    visible: true,
    channels: [
      {
        id: 'ch_6',
        name: 'Show TV',
        logo: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=400&fit=crop',
        streamUrl: 'http://example.com/stream6.m3u8',
        visible: true,
        epg: {
          current: { title: 'Dizi: Kırmızı Oda', time: '20:00 - 21:30' },
          next: { title: 'Ana Haber', time: '21:30 - 22:00' }
        }
      },
      {
        id: 'ch_7',
        name: 'Star TV',
        logo: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=400&fit=crop',
        streamUrl: 'http://example.com/stream7.m3u8',
        visible: true,
        epg: {
          current: { title: 'Eğlence Programı', time: '20:00 - 22:00' },
          next: { title: 'Gece Kuşağı', time: '22:00 - 00:00' }
        }
      },
      {
        id: 'ch_8',
        name: 'ATV',
        logo: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
        streamUrl: 'http://example.com/stream8.m3u8',
        visible: true,
        epg: {
          current: { title: 'Yarışma Programı', time: '19:00 - 21:00' },
          next: { title: 'Ana Haber', time: '21:00 - 22:00' }
        }
      }
    ]
  },
  {
    id: 'cat_kids',
    name: 'Çocuk',
    visible: true,
    channels: [
      {
        id: 'ch_9',
        name: 'TRT Çocuk',
        logo: 'https://images.unsplash.com/photo-1587616211892-7747709da853?w=400&h=400&fit=crop',
        streamUrl: 'http://example.com/stream9.m3u8',
        visible: true,
        epg: {
          current: { title: 'Çizgi Film', time: '18:00 - 20:00' },
          next: { title: 'Çocuk Programı', time: '20:00 - 21:00' }
        }
      }
    ]
  },
  {
    id: 'cat_documentary',
    name: 'Belgesel',
    visible: true,
    channels: [
      {
        id: 'ch_10',
        name: 'National Geographic',
        logo: 'https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=400&h=400&fit=crop',
        streamUrl: 'http://example.com/stream10.m3u8',
        visible: true,
        epg: {
          current: { title: 'Vahşi Yaşam', time: '20:00 - 21:00' },
          next: { title: 'Okyanus Sırları', time: '21:00 - 22:00' }
        }
      },
      {
        id: 'ch_11',
        name: 'TRT Belgesel',
        logo: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400&h=400&fit=crop',
        streamUrl: 'http://example.com/stream11.m3u8',
        visible: true,
        epg: {
          current: { title: 'Tarih Belgeseli', time: '20:00 - 21:00' },
          next: { title: 'Doğa Belgeseli', time: '21:00 - 22:00' }
        }
      }
    ]
  }
];

// SERIES (TV SHOWS)
export const seriesCategories = [
  {
    id: 'series_cat_drama',
    name: 'Dram',
    visible: true,
    series: [
      {
        id: 'series_1',
        title: 'Breaking Bad',
        poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop',
        year: 2008,
        imdb: 9.5,
        genre: 'Crime, Drama, Thriller',
        description: 'A high school chemistry teacher turned methamphetamine producer.',
        visible: true,
        seasons: [
          {
            season: 1,
            episodes: [
              { episode: 1, title: 'Pilot', duration: '58 min', streamUrl: 'http://example.com/bb_s1e1.m3u8' },
              { episode: 2, title: "Cat's in the Bag", duration: '48 min', streamUrl: 'http://example.com/bb_s1e2.m3u8' },
              { episode: 3, title: "And the Bag's in the River", duration: '48 min', streamUrl: 'http://example.com/bb_s1e3.m3u8' }
            ]
          },
          {
            season: 2,
            episodes: [
              { episode: 1, title: 'Seven Thirty-Seven', duration: '47 min', streamUrl: 'http://example.com/bb_s2e1.m3u8' },
              { episode: 2, title: 'Grilled', duration: '47 min', streamUrl: 'http://example.com/bb_s2e2.m3u8' }
            ]
          }
        ]
      },
      {
        id: 'series_2',
        title: 'The Crown',
        poster: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=300&h=450&fit=crop',
        year: 2016,
        imdb: 8.6,
        genre: 'Biography, Drama, History',
        description: 'Follows the political rivalries and romance of Queen Elizabeth II.',
        visible: true,
        seasons: [
          {
            season: 1,
            episodes: [
              { episode: 1, title: 'Wolferton Splash', duration: '57 min', streamUrl: 'http://example.com/crown_s1e1.m3u8' },
              { episode: 2, title: 'Hyde Park Corner', duration: '63 min', streamUrl: 'http://example.com/crown_s1e2.m3u8' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'series_cat_action',
    name: 'Aksiyon',
    visible: true,
    series: [
      {
        id: 'series_3',
        title: 'The Mandalorian',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop',
        year: 2019,
        imdb: 8.7,
        genre: 'Action, Adventure, Sci-Fi',
        description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy.',
        visible: true,
        seasons: [
          {
            season: 1,
            episodes: [
              { episode: 1, title: 'Chapter 1: The Mandalorian', duration: '39 min', streamUrl: 'http://example.com/mando_s1e1.m3u8' },
              { episode: 2, title: 'Chapter 2: The Child', duration: '33 min', streamUrl: 'http://example.com/mando_s1e2.m3u8' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'series_cat_scifi',
    name: 'Bilim Kurgu',
    visible: true,
    series: [
      {
        id: 'series_4',
        title: 'Stranger Things',
        poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop',
        year: 2016,
        imdb: 8.7,
        genre: 'Drama, Fantasy, Horror',
        description: 'When a young boy disappears, his mother and friends confront terrifying forces.',
        visible: true,
        seasons: [
          {
            season: 1,
            episodes: [
              { episode: 1, title: 'The Vanishing of Will Byers', duration: '49 min', streamUrl: 'http://example.com/st_s1e1.m3u8' },
              { episode: 2, title: 'The Weirdo on Maple Street', duration: '56 min', streamUrl: 'http://example.com/st_s1e2.m3u8' }
            ]
          }
        ]
      }
    ]
  }
];

// MOVIES
export const movieCategories = [
  {
    id: 'movie_cat_action',
    name: 'Aksiyon',
    visible: true,
    movies: [
      {
        id: 'movie_1',
        title: 'The Dark Knight',
        poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=450&fit=crop',
        year: 2008,
        imdb: 9.0,
        duration: '152 min',
        genre: 'Action, Crime, Drama',
        description: 'When the menace known as the Joker wreaks havoc on Gotham.',
        visible: true,
        streamUrl: 'http://example.com/dark_knight.m3u8'
      },
      {
        id: 'movie_2',
        title: 'Gladiator',
        poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop',
        year: 2000,
        imdb: 8.5,
        duration: '155 min',
        genre: 'Action, Adventure, Drama',
        description: 'A former Roman General sets out to exact vengeance.',
        visible: true,
        streamUrl: 'http://example.com/gladiator.m3u8'
      }
    ]
  },
  {
    id: 'movie_cat_scifi',
    name: 'Bilim Kurgu',
    visible: true,
    movies: [
      {
        id: 'movie_3',
        title: 'Inception',
        poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop',
        year: 2010,
        imdb: 8.8,
        duration: '148 min',
        genre: 'Action, Sci-Fi, Thriller',
        description: 'A thief who steals corporate secrets through dream-sharing technology.',
        visible: true,
        streamUrl: 'http://example.com/inception.m3u8'
      },
      {
        id: 'movie_4',
        title: 'Interstellar',
        poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=450&fit=crop',
        year: 2014,
        imdb: 8.6,
        duration: '169 min',
        genre: 'Adventure, Drama, Sci-Fi',
        description: 'A team of explorers travel through a wormhole in space.',
        visible: true,
        streamUrl: 'http://example.com/interstellar.m3u8'
      },
      {
        id: 'movie_5',
        title: 'The Matrix',
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop',
        year: 1999,
        imdb: 8.7,
        duration: '136 min',
        genre: 'Action, Sci-Fi',
        description: 'A computer hacker learns about the true nature of his reality.',
        visible: true,
        streamUrl: 'http://example.com/matrix.m3u8'
      }
    ]
  },
  {
    id: 'movie_cat_adventure',
    name: 'Macera',
    visible: true,
    movies: [
      {
        id: 'movie_6',
        title: 'Avatar',
        poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=450&fit=crop',
        year: 2009,
        imdb: 7.8,
        duration: '162 min',
        genre: 'Action, Adventure, Fantasy',
        description: 'A paraplegic Marine dispatched to the moon Pandora.',
        visible: true,
        streamUrl: 'http://example.com/avatar.m3u8'
      }
    ]
  }
];
