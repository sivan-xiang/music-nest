<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/netease.js'
import { demoTracks, demoPlaylists } from '../data/demo.js'
import SongItem from '../components/SongItem.vue'
import { usePlayer } from '../store/player.js'
import { searchCache } from '../store/viewCache.js'

const props = defineProps({
  q: { type: String, default: '' }
})
const emit = defineEmits(['navigate'])
const { playTrack } = usePlayer()

// 关键词与热搜先读缓存，进入页面不闪空
const keyword = ref(searchCache.keyword)
const tab = ref('songs')
const loading = ref(false)
const hots = ref(searchCache.hots)

// 一次搜索同时拉「单曲 + 歌单」并写回缓存，切换 tab 不再清空
async function runSearch(kw) {
  const k = kw.trim()
  if (!k) return
  loading.value = true
  const [sRes, pRes] = await Promise.all([
    api
      .searchSongs(k, { limit: 40 })
      .then((list) => ({ list, isDemo: false }))
      .catch(() => ({
        list: demoTracks.filter((t) => t.name.includes(k) || t.artistName.includes(k)),
        isDemo: true
      })),
    api
      .searchPlaylists(k, { limit: 30 })
      .then((list) => ({ list, isDemo: false }))
      .catch(() => ({ list: demoPlaylists.filter((p) => p.name.includes(k)), isDemo: true }))
  ])
  // 写回缓存：新数据返回后才更新，进入页面先展示旧结果
  searchCache.songs = sRes.list
  searchCache.playlists = pRes.list
  searchCache.demo = sRes.isDemo && pRes.isDemo
  searchCache.searched = true
  searchCache.keyword = k
  loading.value = false
}

function doSearch() {
  runSearch(keyword.value)
}

function playSong(t) {
  playTrack(t, searchCache.songs)
}
function goPlaylist(p) {
  emit('navigate', { view: 'playlist', params: { playlist: p } })
}
function pickHot(h) {
  keyword.value = h
  runSearch(h)
}

onMounted(async () => {
  // 进入即显示加载态，避免首次进入（拉热搜 + 默认搜索）时出现空白无提示
  loading.value = true
  // 由 banner 等外部带入的查询词：直接搜索并缓存
  if (props.q) {
    keyword.value = props.q
    await runSearch(props.q)
    searchCache.loaded = true
    loading.value = false
    return
  }
  // 已有缓存：恢复展示，不重新搜索（不闪空、不覆盖），也不显示加载态
  if (searchCache.loaded) {
    keyword.value = searchCache.keyword
    hots.value = searchCache.hots
    loading.value = false
    return
  }
  // 首次进入：拉热搜词 + 默认加载一点数据
  try {
    hots.value = await api.hotSearch(10)
  } catch {
    hots.value = []
  }
  searchCache.hots = hots.value
  const def = hots.value[0] || '晴天'
  keyword.value = def
  await runSearch(def)
  searchCache.loaded = true
  loading.value = false
})
</script>

<template>
  <div class="search fade-up">
    <div class="bar glass">
      <svg class="s-ico" viewBox="0 0 24 24"><path d="M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z"/></svg>
      <input
        v-model="keyword"
        placeholder="搜索歌曲、歌手，或歌单…"
        @keyup.enter="doSearch"
      />
      <button class="btn-primary" @click="doSearch">搜索</button>
    </div>

    <div class="tabs">
      <button :class="{ on: tab === 'songs' }" @click="tab = 'songs'">单曲</button>
      <button :class="{ on: tab === 'playlists' }" @click="tab = 'playlists'">歌单</button>
    </div>

    <div v-if="hots.length" class="hots">
      <span class="hots-label">大家都在搜</span>
      <button v-for="h in hots" :key="h" class="hot-chip" @click="pickHot(h)">{{ h }}</button>
    </div>

    <div v-if="searchCache.demo" class="demo-tip">🌿 演示模式：未连接本地接口，仅展示示例匹配结果。</div>

    <div v-if="loading" class="state"><span class="spinner"></span>搜索中…</div>
    <div v-else-if="searchCache.searched && !searchCache.songs.length && !searchCache.playlists.length" class="state muted">
      没有找到「{{ keyword }}」相关结果 🍃
    </div>

    <div v-if="tab === 'songs' && searchCache.songs.length" class="list glass">
      <SongItem
        v-for="(t, i) in searchCache.songs"
        :key="t.id"
        :track="t"
        :index="i"
        :playlist="searchCache.songs"
        @play="playSong"
      />
    </div>

    <div v-if="tab === 'playlists' && searchCache.playlists.length" class="grid">
      <button v-for="(p, i) in searchCache.playlists" :key="p.id" class="card stagger" :style="{ '--i': i }" @click="goPlaylist(p)">
        <div class="cover" :style="{ backgroundImage: `url(${p.coverImgUrl})` }">
          <span class="cnt">{{ (p.trackCount || p.tracks?.length || '') }}</span>
        </div>
        <div class="c-name ellipsis">{{ p.name }}</div>
        <div class="c-sub ellipsis">{{ p.creator?.nickname || '' }}</div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.search { padding: 30px 30px 40px; height: 100%; overflow-y: auto; }
.bar { display: flex; align-items: center; gap: 12px; padding: 8px 8px 8px 18px; border-radius: 99px; max-width: 620px; }
.s-ico { width: 20px; height: 20px; fill: none; stroke: var(--text-dim); stroke-width: 1.8; stroke-linecap: round; }
.bar input { flex: 1; border: none; outline: none; background: transparent; font-size: 15px; color: var(--text); }
.tabs { display: flex; gap: 22px; margin: 22px 0 18px; }
.tabs button { font-size: 15px; font-weight: 600; color: var(--text-dim); padding-bottom: 6px; border-bottom: 2px solid transparent; }
.tabs button.on { color: var(--text); border-color: var(--c-teal); }
.hots { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 18px; }
.hots-label { font-size: 13px; color: var(--text-dim); margin-right: 2px; }
.hot-chip { font-size: 13px; color: var(--text); background: var(--surface); border: 1px solid var(--surface-line); padding: 6px 14px; border-radius: 99px; transition: .18s; }
.hot-chip:hover { background: var(--grad-soft); border-color: var(--c-teal); transform: translateY(-2px); }
.demo-tip { background: rgba(255,214,192,.35); border:1px solid rgba(255,180,140,.5); color:#8a5a3c; padding:9px 16px; border-radius: var(--radius-md); font-size:13px; margin-bottom: 16px; }
.state { padding: 40px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px; }
.spinner { width: 18px; height: 18px; border: 2px solid var(--surface-line); border-top-color: var(--c-teal); border-radius: 50%; animation: spin .7s linear infinite; flex: none; }
@keyframes spin { to { transform: rotate(360deg); } }
.list { border-radius: var(--radius-lg); padding: 6px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 18px; }
.card { text-align: left; transition: .2s; }
.card:hover { transform: translateY(-6px); box-shadow: var(--shadow-soft); }
.card .cover { transition: transform .35s cubic-bezier(.2, .7, .3, 1); }
.card:hover .cover { transform: scale(1.05); }
.cover { position: relative; width: 100%; aspect-ratio: 1; border-radius: var(--radius-md); background-size: cover; background-position: center; box-shadow: var(--shadow-card); }
.cnt { position: absolute; right: 10px; top: 10px; font-size: 11px; color:#fff; background: rgba(0,0,0,.4); padding: 2px 8px; border-radius: 99px; }
.c-name { font-size: 14px; font-weight: 600; margin-top: 10px; }
.c-sub { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

/* ============ 移动端：留白收紧、卡片两列 ============ */
@media (max-width: 820px) {
  .search { padding: 16px 14px 20px; }
  .bar { max-width: none; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .tabs { gap: 16px; margin: 18px 0 14px; }
  .sec-head h3 { font-size: 18px; }
}
</style>
