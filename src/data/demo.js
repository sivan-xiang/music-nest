/* ============================================================
   演示模式兜底数据
   当本地 NeteaseCloudMusicApi 未启动时，网站依旧可玩：
   - 曲目使用 SoundHelix 免费可播放 MP3
   - 歌词为示例文本，用于演示歌词滚动动画
   真实数据请在后端启动后由 API 提供。
   ============================================================ */

function makeLrc(pairs) {
  return pairs
    .map(([t, text]) => {
      const m = Math.floor(t / 60)
      const s = Math.floor(t % 60)
      const ms = Math.floor((t % 1) * 100)
      return `[${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}]${text}`
    })
    .join('\n')
}

const cover = (seed) => `https://picsum.photos/seed/${seed}/300/300`

const poemLrc = (title) =>
  makeLrc([
    [2, title],
    [8, '风穿过山谷，带来一阵清凉'],
    [16, '云在天上慢慢地走'],
    [24, '我把心事折成纸船'],
    [32, '放进时间的河流'],
    [40, '（间奏）'],
    [52, '月光铺满窗台的时候'],
    [60, '想念便有了形状'],
    [70, '愿你在远方也被温柔以待'],
    [82, '—— 音乐小窝 Demo ——']
  ])

const tracks = [
  {
    id: 1001,
    name: '晨雾微光',
    artists: [{ id: 1, name: '折鹤' }],
    artistName: '折鹤',
    album: { id: 11, name: '清新集', picUrl: cover('mist') },
    duration: 372,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    lrc: poemLrc('晨雾微光')
  },
  {
    id: 1002,
    name: '海边的风',
    artists: [{ id: 2, name: '蓝鲸' }],
    artistName: '蓝鲸',
    album: { id: 12, name: '潮汐', picUrl: cover('sea') },
    duration: 426,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    lrc: poemLrc('海边的风')
  },
  {
    id: 1003,
    name: '纸飞机',
    artists: [{ id: 3, name: '小满' }],
    artistName: '小满',
    album: { id: 13, name: '童年邮筒', picUrl: cover('plane') },
    duration: 295,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    lrc: poemLrc('纸飞机')
  },
  {
    id: 1004,
    name: '晚安星球',
    artists: [{ id: 4, name: '拾光' }],
    artistName: '拾光',
    album: { id: 14, name: '夜航', picUrl: cover('star') },
    duration: 358,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    lrc: poemLrc('晚安星球')
  },
  {
    id: 1005,
    name: '柠檬汽水',
    artists: [{ id: 5, name: '汽水君' }],
    artistName: '汽水君',
    album: { id: 15, name: '夏日限定', picUrl: cover('lemon') },
    duration: 311,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    lrc: poemLrc('柠檬汽水')
  },
  {
    id: 1006,
    name: '山间来信',
    artists: [{ id: 6, name: '远山' }],
    artistName: '远山',
    album: { id: 16, name: '徒步笔记', picUrl: cover('mountain') },
    duration: 402,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    lrc: poemLrc('山间来信')
  },
  {
    id: 1007,
    name: '棉花糖云',
    artists: [{ id: 7, name: '云朵工厂' }],
    artistName: '云朵工厂',
    album: { id: 17, name: '天空之城', picUrl: cover('cloud') },
    duration: 268,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    lrc: poemLrc('棉花糖云')
  },
  {
    id: 1008,
    name: '星河漫游',
    artists: [{ id: 8, name: '星野' }],
    artistName: '星野',
    album: { id: 18, name: '银河便利店', picUrl: cover('galaxy') },
    duration: 389,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    lrc: poemLrc('星河漫游')
  }
]

const playlists = [
  {
    id: 9001,
    name: '清晨第一缕光',
    coverImgUrl: cover('pl-morning'),
    description: '醒来就该听点轻盈的。',
    creator: '音乐小窝',
    tags: ['清晨', '舒缓'],
    tracks: [tracks[0], tracks[2], tracks[4], tracks[6]]
  },
  {
    id: 9002,
    name: '夜晚的温柔',
    coverImgUrl: cover('pl-night'),
    description: '睡前把世界调成静音。',
    creator: '音乐小窝',
    tags: ['夜晚', '治愈'],
    tracks: [tracks[3], tracks[1], tracks[7], tracks[5]]
  }
]

export const demoTracks = tracks
export const demoPlaylists = playlists
