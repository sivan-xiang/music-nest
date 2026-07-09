/* ============================================================
   NeteaseCloudMusicApi 封装
   文档：https://github.com/Binaryify/NeteaseCloudMusicApi
   开发：/api 由 vite 代理到本地 3000 端口
   生产：设置 VITE_API_BASE 环境变量指向你的 API 服务

   封面字段说明（不同接口字段名不一致）：
   - 歌单：/personalized（首页推荐）返回 picUrl；
           /top/playlist、/search(type=1000)、/playlist/detail 返回 coverImgUrl
   - 单曲：/search 结果不含 picUrl，需用 /song/detail 批量补全
   这里在 API 层统一把歌单对象补齐 coverImgUrl 和 picUrl 两个字段。
   ============================================================ */

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:3000')

async function request(path, params = {}) {
  const url = new URL(API_BASE + path, window.location.origin)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

/** 把接口返回的歌手数组转成字符串 */
export function artistsToString(artists = []) {
  if (!Array.isArray(artists)) return ''
  return artists.map((a) => a.name).join(' / ')
}

/** 封面统一走 https，避免将来 https 部署被混合内容策略拦截 */
function httpsUrl(u) {
  return u ? String(u).replace(/^http:\/\//, 'https://') : u
}

/** 歌单对象统一补齐 coverImgUrl / picUrl（不同接口字段名不一致） */
function normalizePlaylist(pl) {
  if (!pl) return pl
  const cover = httpsUrl(pl.coverImgUrl || pl.picUrl)
  return {
    ...pl,
    coverImgUrl: cover,
    picUrl: httpsUrl(pl.picUrl || pl.coverImgUrl)
  }
}

/** 把 Netease 单曲对象归一化为内部统一的 track 结构 */
function normalizeTrack(s) {
  if (!s) return null
  const al = s.album || s.al || {}
  const ar = s.artists || s.ar || []
  return {
    id: s.id,
    name: s.name,
    artists: ar.map((a) => ({ id: a.id, name: a.name })),
    artistName: artistsToString(ar),
    album: { id: al.id, name: al.name, picUrl: httpsUrl(al.picUrl || al.pic) },
    duration: (s.duration || s.dt || 0) / 1000, // 秒
    raw: s
  }
}

/** 批量补全单曲封面（搜索结果单曲不含 picUrl，需用 /song/detail 补） */
async function songDetailBatch(ids) {
  if (!ids.length) return {}
  try {
    const d = await request('/song/detail', { ids: ids.join(',') })
    const map = {}
    ;(d?.songs || []).forEach((s) => {
      const nt = normalizeTrack(s)
      if (nt.album?.picUrl) map[s.id] = nt.album.picUrl
    })
    return map
  } catch {
    return {}
  }
}

/** 搜索结果仍缺封面时的兜底：用歌手头像 img1v1Url */
function artistCoverFallback(track) {
  const raw = track.raw || {}
  const arPic = raw.album?.artist?.img1v1Url
  if (arPic) return httpsUrl(arPic)
  const first = (raw.artists || [])[0]
  return first?.img1v1Url ? httpsUrl(first.img1v1Url) : null
}

export const api = {
  // 搜索：type 1=单曲 1000=歌单 100=歌手
  async searchSongs(keyword, { limit = 30, offset = 0 } = {}) {
    const d = await request('/search', {
      keywords: keyword,
      type: 1,
      limit,
      offset
    })
    const base = (d?.result?.songs || []).map(normalizeTrack)
    // 搜索结果单曲的 album 不含 picUrl，批量用 song/detail 补全；补不到的用歌手头像兜底
    const covers = await songDetailBatch(base.map((t) => t.id))
    base.forEach((t) => {
      if (covers[t.id]) {
        t.album = { ...t.album, picUrl: covers[t.id] }
      } else {
        const fb = artistCoverFallback(t)
        if (fb) t.album = { ...t.album, picUrl: fb }
      }
    })
    return base
  },

  async searchPlaylists(keyword, { limit = 30, offset = 0 } = {}) {
    const d = await request('/search', {
      keywords: keyword,
      type: 1000,
      limit,
      offset
    })
    return (d?.result?.playlists || []).map(normalizePlaylist)
  },

  // 歌曲可播放直链（免费用户一般 standard）
  async songUrl(id, level = 'standard') {
    try {
      const d = await request('/song/url/v1', { id, level })
      return d?.data?.[0]?.url || null
    } catch {
      return null
    }
  },

  // 歌曲详情（封面/歌手/专辑）
  async songDetail(id) {
    const d = await request('/song/detail', { ids: id })
    const s = d?.songs?.[0]
    return normalizeTrack(s)
  },

  // 歌词：原词 + 翻译
  async lyric(id) {
    try {
      const d = await request('/lyric', { id })
      return {
        lrc: d?.lrc?.lyric || '',
        tlyric: d?.tlyric?.lyric || ''
      }
    } catch {
      return { lrc: '', tlyric: '' }
    }
  },

  // 歌单详情（含曲目）
  async playlistDetail(id) {
    const d = await request('/playlist/detail', { id })
    const pl = d?.playlist || {}
    const tracks = (pl.tracks || []).map(normalizeTrack)
    return {
      id: pl.id,
      name: pl.name,
      coverImgUrl: httpsUrl(pl.coverImgUrl || pl.picUrl),
      description: pl.description,
      creator: pl.creator?.nickname,
      tags: pl.tags || [],
      playCount: pl.playCount,
      trackCount: pl.trackCount,
      tracks
    }
  },

  // 首页轮播：接口字段为 bigImageUrl/imageUrl（非 picUrl），模板取 b.pic
  async banner() {
    const d = await request('/banner', { type: 0 })
    return (d?.banners || []).map((b) => ({
      pic: httpsUrl(b.bigImageUrl || b.imageUrl || b.picUrl),
      title: b.typeTitle || b.title || '',
      targetType: b.targetType,
      targetId: b.targetId,
      url: b.url
    }))
  },

  // 推荐新歌
  async newSongs(limit = 12) {
    const d = await request('/personalized/newsong', { limit })
    return (d?.result || []).map((s) => normalizeTrack(s.song || s))
  },

  // 推荐歌单（首页，返回 picUrl）
  async recommendPlaylists(limit = 10) {
    const d = await request('/personalized', { limit })
    return (d?.result || []).map(normalizePlaylist)
  },

  // 热门歌单分类（返回 coverImgUrl）
  async topPlaylists({ cat = '全部', limit = 30, offset = 0 } = {}) {
    const d = await request('/top/playlist', { cat, limit, offset })
    return (d?.playlists || []).map(normalizePlaylist)
  },

  // 热搜词（用于搜索页默认展示）
  async hotSearch(limit = 10) {
    try {
      const d = await request('/search/hot')
      const list = (d?.result?.hots || []).slice(0, limit)
      return list.map((h) => h.first).filter(Boolean)
    } catch {
      return []
    }
  }
}

export default api
