<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import api from '../api/netease.js'
import SongItem from '../components/SongItem.vue'
import { usePlayer } from '../store/player.js'
import { playlistCache } from '../store/viewCache.js'

const props = defineProps({
  playlist: { type: Object, default: null },
  id: { type: [Number, String], default: null }
})
const emit = defineEmits(['navigate'])
const { playTrack } = usePlayer()

const detail = ref(null)
const loading = ref(false)
const demo = ref(false)
const tracks = computed(() => detail.value?.tracks || [])

async function load() {
  // 演示对象自带曲目，直接渲染
  if (props.playlist?.tracks?.length) {
    detail.value = props.playlist
    return
  }
  const pid = props.playlist?.id || props.id
  // 已有缓存：先展示，不闪 loading（回来不空）
  const cached = playlistCache.map[pid]
  if (cached && cached.loaded) {
    detail.value = cached.detail
    demo.value = cached.demo
    loading.value = false
    return
  }
  loading.value = true
  try {
    const d = await api.playlistDetail(pid)
    if (!d?.tracks?.length) throw new Error('empty')
    detail.value = d
    demo.value = false
    playlistCache.map[pid] = { detail: d, demo: false, loaded: true }
  } catch (e) {
    demo.value = true
    detail.value = props.playlist || { name: '示例歌单', tracks: [] }
    playlistCache.map[pid] = { detail: detail.value, demo: true, loaded: true }
  } finally {
    loading.value = false
  }
}

function playAll() {
  if (tracks.value.length) playTrack(tracks.value[0], tracks.value)
}
function playOne(t) {
  playTrack(t, tracks.value)
}

onMounted(load)
watch(() => [props.playlist, props.id], () => {
  demo.value = false
  load()
})
</script>

<template>
  <div class="pl fade-up">
    <!-- 首次进入且无缓存：显示加载占位，避免接口返回前白屏 -->
    <div v-if="loading && !detail" class="loading-wrap">
      <div class="spinner"></div>
      <div class="loading-text">歌单加载中…</div>
    </div>

    <template v-else-if="detail">
      <div v-if="demo" class="demo-tip">🌿 演示模式：未能从接口获取该歌单，已用示例数据展示。</div>

      <header class="head">
        <div class="cover" :style="{ backgroundImage: `url(${detail.coverImgUrl})` }"></div>
        <div class="meta">
          <div class="kind">歌单</div>
          <h1 class="ellipsis">{{ detail.name }}</h1>
          <div class="desc ellipsis" :title="detail.description">{{ detail.description || '——' }}</div>
          <div class="sub">
            <span v-if="detail.creator">by {{ detail.creator }}</span>
            <span v-if="detail.trackCount">· {{ detail.trackCount }} 首</span>
            <span v-if="detail.tags?.length">· {{ detail.tags.join(' / ') }}</span>
          </div>
          <button class="btn-primary play-all" @click="playAll">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            播放全部
          </button>
        </div>
      </header>

      <div class="list glass">
        <SongItem
          v-for="(t, i) in tracks"
          :key="t.id"
          :track="t"
          :index="i"
          :playlist="tracks"
          @play="playOne"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.pl { padding: 30px 30px 40px; height: 100%; overflow-y: auto; }
.loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; min-height: 60vh; }
.spinner { width: 46px; height: 46px; border-radius: 50%; border: 3px solid rgba(91,192,190,.22); border-top-color: #5bc0be; animation: mn-spin .8s linear infinite; }
@keyframes mn-spin { to { transform: rotate(360deg); } }
.loading-text { color: var(--text-dim); font-size: 14px; letter-spacing: 1px; }
.head, .list { animation: mn-fade .45s ease; }
@keyframes mn-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.demo-tip { background: rgba(255,214,192,.35); border:1px solid rgba(255,180,140,.5); color:#8a5a3c; padding:9px 16px; border-radius: var(--radius-md); font-size:13px; margin-bottom: 18px; }
.head { display: flex; gap: 26px; margin-bottom: 26px; }
.cover { width: 190px; height: 190px; border-radius: var(--radius-lg); background-size: cover; background-position: center; box-shadow: var(--shadow-soft); flex: 0 0 auto; }
.meta { display: flex; flex-direction: column; justify-content: center; min-width: 0; }
.kind { font-size: 12px; color: var(--text-dim); letter-spacing: 2px; }
.meta h1 { font-size: 30px; font-weight: 800; margin: 6px 0 10px; }
.desc { font-size: 13.5px; color: var(--text-soft); max-width: 520px; }
.sub { font-size: 12.5px; color: var(--text-dim); margin: 10px 0 18px; display: flex; gap: 6px; flex-wrap: wrap; }
.play-all svg { width: 16px; height: 16px; fill: #fff; }
.state { padding: 40px; text-align: center; color: var(--text-dim); }
.list { border-radius: var(--radius-lg); padding: 6px; }

/* ============ 移动端：封面与信息改为竖向堆叠居中 ============ */
@media (max-width: 820px) {
  .pl { padding: 16px 14px 20px; }
  .head { flex-direction: column; align-items: center; text-align: center; gap: 16px; margin-bottom: 20px; }
  .cover { width: 150px; height: 150px; }
  .meta { align-items: center; }
  .meta h1 { font-size: 22px; }
  .desc { max-width: none; }
  .sub { justify-content: center; }
  .kind { letter-spacing: 1px; }
}
</style>
