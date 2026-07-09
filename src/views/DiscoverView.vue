<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../api/netease.js'
import { demoTracks, demoPlaylists } from '../data/demo.js'
import SongItem from '../components/SongItem.vue'
import { usePlayer } from '../store/player.js'

const emit = defineEmits(['navigate'])
const { playTrack } = usePlayer()

const banners = ref([])
const playlists = ref([])
const newSongs = ref([])
const loading = ref(true)
const demo = ref(false)
const bi = ref(0)
let timer = null

function goPlaylist(p) {
  emit('navigate', { view: 'playlist', params: { playlist: p } })
}
function playNew(t) {
  playTrack(t, newSongs.value)
}

// Banner 按跳转类型分别处理（网易云 banner 不一定是歌单）
function onBannerClick(b) {
  if (b.targetType === 1000) {
    goPlaylist({ id: b.targetId, name: b.title, coverImgUrl: b.pic })
  } else if (b.targetType === 1) {
    // 单曲：拉详情后直接播放
    playTrack({ id: b.targetId, name: b.title, album: { picUrl: b.pic } })
  } else {
    // 专辑 / MV 等暂无独立页，跳搜索兜底，至少点击有反馈
    emit('navigate', { view: 'search', params: { q: b.title } })
  }
}
function bannerTag(b) {
  if (b.targetType === 1000) return '歌单'
  if (b.targetType === 1) return '单曲'
  if (b.targetType === 10) return '专辑'
  return '推荐'
}

function startRotate() {
  if (banners.value.length < 2) return
  timer = setInterval(() => {
    bi.value = (bi.value + 1) % banners.value.length
  }, 5000)
}
function stopRotate() {
  clearInterval(timer)
}

onMounted(async () => {
  try {
    const [b, pl, ns] = await Promise.all([
      api.banner(),
      api.recommendPlaylists(10),
      api.newSongs(12)
    ])
    banners.value = b
    playlists.value = pl
    newSongs.value = ns
    if (!pl.length && !ns.length) throw new Error('empty')
  } catch (e) {
    demo.value = true
    banners.value = demoPlaylists.map((p) => ({ pic: p.coverImgUrl, title: p.name }))
    playlists.value = demoPlaylists
    newSongs.value = demoTracks
  } finally {
    loading.value = false
    startRotate()
  }
})
onUnmounted(stopRotate)
</script>

<template>
  <div class="discover fade-up">
    <div v-if="demo" class="demo-tip">
      🌿 当前为<strong>演示模式</strong>（未检测到本地音乐接口）。启动 <code>NeteaseCloudMusicApi</code> 后即可收听真实曲库。
    </div>

    <!-- Banner -->
    <div class="banner glass" @mouseenter="stopRotate" @mouseleave="startRotate">
      <div
        v-for="(b, i) in banners"
        :key="i"
        class="slide"
        :class="{ on: i === bi }"
        :style="{ backgroundImage: `url(${b.pic})` }"
        @click="onBannerClick(b)"
      >
        <div class="slide-mask"></div>
        <div class="slide-text">
          <span class="tag">{{ bannerTag(b) }}</span>
          <h2>{{ b.title || b.name }}</h2>
        </div>
      </div>
      <div class="dots">
        <i
          v-for="(b, i) in banners"
          :key="i"
          :class="{ on: i === bi }"
          @click="bi = i"
        ></i>
      </div>
    </div>

    <!-- 推荐歌单 -->
    <section class="section">
      <div class="sec-head">
        <h3>推荐歌单</h3>
        <span class="muted">为你精选 · 挑一个心情</span>
      </div>
      <div class="grid">
        <button v-for="(p, i) in playlists" :key="p.id" class="card stagger" :style="{ '--i': i }" @click="goPlaylist(p)">
          <div class="cover" :style="{ backgroundImage: `url(${p.coverImgUrl})` }">
            <span class="play-ic">▶</span>
          </div>
          <div class="c-name ellipsis">{{ p.name }}</div>
          <div class="c-sub ellipsis">{{ (p.creator && (p.creator.nickname || p.creator)) || (p.tags && p.tags.join('/')) || '' }}</div>
        </button>
      </div>
    </section>

    <!-- 新歌速递 -->
    <section class="section">
      <div class="sec-head">
        <h3>新歌速递</h3>
        <span class="muted">新鲜上架 · 双击播放</span>
      </div>
      <div class="list glass">
        <SongItem
          v-for="(t, i) in newSongs"
          :key="t.id"
          :track="t"
          :index="i"
          :playlist="newSongs"
          @play="playNew"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.discover { padding: 26px 30px 40px; height: 100%; overflow-y: auto; }
.demo-tip {
  background: rgba(255, 214, 192, .35); border: 1px solid rgba(255, 180, 140, .5);
  color: #8a5a3c; padding: 10px 16px; border-radius: var(--radius-md);
  font-size: 13.5px; margin-bottom: 20px;
}
.demo-tip code { background: rgba(255,255,255,.6); padding: 1px 6px; border-radius: 6px; }

.banner {
  position: relative; height: 230px; border-radius: var(--radius-lg); overflow: hidden;
  margin-bottom: 30px;
}
.slide {
  position: absolute; inset: 0; background-size: cover; background-position: center;
  opacity: 0; transform: scale(1.04); transition: opacity .8s, transform 1.2s; cursor: pointer;
  pointer-events: none;
}
.slide.on { opacity: 1; transform: scale(1); pointer-events: auto; }
.slide-mask {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(20,30,40,.5), rgba(20,30,40,.05) 60%);
}
.slide-text { position: absolute; left: 34px; bottom: 28px; color: #fff; }
.slide-text .tag {
  display: inline-block; font-size: 12px; padding: 3px 10px; border-radius: 99px;
  background: rgba(255,255,255,.25); backdrop-filter: blur(4px); margin-bottom: 8px;
}
.slide-text h2 { font-size: 28px; font-weight: 800; text-shadow: 0 2px 12px rgba(0,0,0,.3); }

.dots { position: absolute; right: 22px; bottom: 18px; display: flex; gap: 7px; }
.dots i { width: 8px; height: 8px; border-radius: 99px; background: rgba(255,255,255,.5); cursor: pointer; transition: .2s; }
.dots i.on { width: 22px; background: #fff; }

.section { margin-bottom: 34px; }
.sec-head { display: flex; align-items: baseline; gap: 14px; margin-bottom: 16px; }
.sec-head h3 { font-size: 20px; font-weight: 800; }

.grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 18px;
}
.card { text-align: left; transition: .2s; }
.card:hover { transform: translateY(-6px); box-shadow: var(--shadow-soft); }
.card .cover { transition: transform .35s cubic-bezier(.2, .7, .3, 1); }
.card:hover .cover { transform: scale(1.05); }
.cover {
  position: relative; width: 100%; aspect-ratio: 1; border-radius: var(--radius-md);
  background-size: cover; background-position: center; box-shadow: var(--shadow-card);
  overflow: hidden;
}
.play-ic {
  position: absolute; right: 12px; bottom: 12px; width: 40px; height: 40px; border-radius: 50%;
  background: var(--grad-primary); color: #fff; display: grid; place-items: center;
  opacity: 0; transform: scale(.8); transition: .2s; box-shadow: 0 6px 16px rgba(120,160,200,.5);
}
.card:hover .play-ic { opacity: 1; transform: scale(1); }
.c-name { font-size: 14px; font-weight: 600; margin-top: 10px; }
.c-sub { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

.list { border-radius: var(--radius-lg); padding: 6px; }
</style>
