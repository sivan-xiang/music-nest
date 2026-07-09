<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import api from '../api/netease.js'
import SongItem from '../components/SongItem.vue'
import { usePlayer } from '../store/player.js'

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
  loading.value = true
  const pid = props.playlist?.id || props.id
  try {
    detail.value = await api.playlistDetail(pid)
    if (!detail.value?.tracks?.length) throw new Error('empty')
  } catch (e) {
    demo.value = true
    detail.value = props.playlist || { name: '示例歌单', tracks: [] }
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
  <div class="pl fade-up" v-if="detail">
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

    <div v-if="loading" class="state">加载中…</div>
    <div v-else class="list glass">
      <SongItem
        v-for="(t, i) in tracks"
        :key="t.id"
        :track="t"
        :index="i"
        :playlist="tracks"
        @play="playOne"
      />
    </div>
  </div>
</template>

<style scoped>
.pl { padding: 30px 30px 40px; height: 100%; overflow-y: auto; }
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
</style>
