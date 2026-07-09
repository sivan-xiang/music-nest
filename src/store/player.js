/* ============================================================
   全局播放状态 store（单例）
   - 自带 Audio 元素，任意组件可控制
   - 支持：播放/暂停/上下首/进度/音量/播放模式
   - 歌词按需拉取并解析
   - 我的收藏持久化到 localStorage
   ============================================================ */
import { reactive } from 'vue'
import api from '../api/netease.js'
import { parseLrc, activeLyricIndex } from '../utils/lrc.js'

const audio = new Audio()
audio.preload = 'auto'

const FAV_KEY = 'mn_favorites'

const state = reactive({
  current: null,
  playlist: [],
  index: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  mode: 'order', // order 列表循环 | one 单曲循环 | shuffle 随机
  lyrics: [],
  lyricIndex: -1,
  showNow: false,
  favorites: []
})

const urlCache = new Map()
const lrcCache = new Map()

function loadFav() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || []
  } catch {
    return []
  }
}
function persistFav() {
  localStorage.setItem(FAV_KEY, JSON.stringify(state.favorites))
}

// 初始化收藏
state.favorites = loadFav()

audio.volume = state.volume

audio.addEventListener('timeupdate', () => {
  state.currentTime = audio.currentTime
  if (state.lyrics.length) {
    state.lyricIndex = activeLyricIndex(state.lyrics, audio.currentTime)
  }
})
audio.addEventListener('loadedmetadata', () => {
  state.duration = audio.duration || state.current?.duration || 0
})
audio.addEventListener('play', () => (state.isPlaying = true))
audio.addEventListener('pause', () => (state.isPlaying = false))
audio.addEventListener('ended', onEnded)

async function ensureUrl(track) {
  if (track.url) return track.url
  if (urlCache.has(track.id)) {
    track.url = urlCache.get(track.id)
    return track.url
  }
  const url = await api.songUrl(track.id)
  if (url) {
    urlCache.set(track.id, url)
    track.url = url
  }
  return url
}

async function ensureLyric(track) {
  if (track.lrc) return
  if (lrcCache.has(track.id)) {
    track.lrc = lrcCache.get(track.id).lrc
    track.tlyric = lrcCache.get(track.id).tlyric
    return
  }
  const { lrc, tlyric } = await api.lyric(track.id)
  lrcCache.set(track.id, { lrc, tlyric })
  track.lrc = lrc
  track.tlyric = tlyric
}

async function loadAndPlay(track) {
  state.current = track
  const url = await ensureUrl(track)
  if (!url) {
    // 演示兜底
    if (track.demoUrl) audio.src = track.demoUrl
    else {
      state.current = null
      return
    }
  } else {
    audio.src = url
  }
  await ensureLyric(track)
  state.lyrics = parseLrc(track.lrc || '', track.tlyric || '')
  state.lyricIndex = -1
  try {
    await audio.play()
  } catch (e) {
    console.warn('播放失败（可能是浏览器自动播放限制或链接失效）：', e)
  }
}

function onEnded() {
  if (state.mode === 'one') {
    audio.currentTime = 0
    audio.play()
    return
  }
  playIndex(state.index + 1)
}

/* ---------- 对外方法 ---------- */
function playTrack(track, playlist = []) {
  const list = playlist.length ? playlist : [track]
  state.playlist = list
  const idx = list.findIndex((t) => t.id === track.id)
  state.index = idx >= 0 ? idx : 0
  loadAndPlay(state.playlist[state.index])
}

function playIndex(i) {
  if (!state.playlist.length) return
  let idx = i
  if (state.mode === 'shuffle') {
    if (state.playlist.length <= 1) idx = 0
    else {
      do {
        idx = Math.floor(Math.random() * state.playlist.length)
      } while (idx === state.index)
    }
  } else {
    idx = (i + state.playlist.length) % state.playlist.length
  }
  state.index = idx
  loadAndPlay(state.playlist[idx])
}

function togglePlay() {
  if (!state.current) return
  if (audio.paused) audio.play()
  else audio.pause()
}

function next() {
  playIndex(state.index + 1)
}
function prev() {
  // 3 秒内回到上一首，否则重头播放当前
  if (audio.currentTime > 3) {
    seek(0)
    return
  }
  playIndex(state.index - 1)
}

function seek(t) {
  if (!isFinite(t)) return
  audio.currentTime = t
  state.currentTime = t
}

function setVolume(v) {
  state.volume = v
  audio.volume = v
}

function cycleMode() {
  const order = ['order', 'one', 'shuffle']
  state.mode = order[(order.indexOf(state.mode) + 1) % order.length]
}

function openNow() {
  state.showNow = true
}
function closeNow() {
  state.showNow = false
}

/* ---------- 收藏 ---------- */
function toStored(t) {
  const { raw, url, lrc, tlyric, demoUrl, ...rest } = t
  return { ...rest }
}
function isFav(id) {
  return state.favorites.some((f) => f.id === id)
}
function toggleFav(track) {
  const i = state.favorites.findIndex((f) => f.id === track.id)
  if (i >= 0) state.favorites.splice(i, 1)
  else state.favorites.unshift(toStored(track))
  persistFav()
}
function getFavs() {
  return state.favorites
}

export function usePlayer() {
  return {
    state,
    playTrack,
    playIndex,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    cycleMode,
    openNow,
    closeNow,
    isFav,
    toggleFav,
    getFavs
  }
}
