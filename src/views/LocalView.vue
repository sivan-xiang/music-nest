<script setup>
import { ref } from 'vue'
import { usePlayer } from '../store/player.js'

const { state, addLocalFiles, playTrack, openNow } = usePlayer()
const fileInput = ref(null)
const over = ref(false)

function onPick(e) {
  addLocalFiles(e.target.files)
  e.target.value = '' // 允许重复选择同一文件
}
function onDrop(e) {
  over.value = false
  addLocalFiles(e.dataTransfer.files)
}
// 点整行：播放 + 进入全屏播放页
function playRow(t) {
  playTrack(t, state.localTracks)
  openNow()
}
// 点播放键：只播放/暂停，不进页（与列表项一致）
function playBtn(t) {
  playTrack(t, state.localTracks)
}
function isPlaying(t) {
  return state.current && state.current.id === t.id && state.isPlaying
}
function clearAll() {
  state.localTracks = []
}
</script>

<template>
  <div class="local">
    <header class="head">
      <h1>本地音乐</h1>
      <p class="desc">导入设备上的音频文件即可播放 · 刷新页面后需重新导入</p>
    </header>

    <label
      class="drop"
      :class="{ over }"
      @dragover.prevent="over = true"
      @dragleave.prevent="over = false"
      @drop.prevent="onDrop"
    >
      <input ref="fileInput" type="file" accept="audio/*" multiple hidden @change="onPick" />
      <div class="drop-ico">♫</div>
      <div class="drop-title">点击选择音乐，或把文件拖到这里</div>
      <div class="drop-sub">支持 mp3 / flac / wav / m4a / ogg 等</div>
    </label>

    <div v-if="state.localTracks.length" class="panel">
      <div class="panel-bar">
        <span>已导入 {{ state.localTracks.length }} 首</span>
        <button class="clear" @click="clearAll">清空</button>
      </div>
      <ul class="list">
        <li
          v-for="t in state.localTracks"
          :key="t.id"
          class="row"
          :class="{ active: state.current && state.current.id === t.id }"
          @click="playRow(t)"
        >
          <div class="cv">
            <img v-if="t.coverImgUrl" :src="t.coverImgUrl" alt="" />
            <span v-else class="cv-ph">♪</span>
          </div>
          <div class="meta">
            <div class="nm ellipsis">{{ t.name }}</div>
            <div class="ar ellipsis">{{ t.artist }}</div>
          </div>
          <button class="play" @click.stop="playBtn(t)" :title="isPlaying(t) ? '正在播放（点此暂停）' : '播放'">
            {{ isPlaying(t) ? '⏸' : '▶' }}
          </button>
        </li>
      </ul>
    </div>

    <p v-else class="empty-tip">还没有本地歌曲，点击上方区域选择或拖入文件吧～</p>
  </div>
</template>

<style scoped>
.local { padding: 30px 26px 12px; height: 100%; overflow-y: auto; }
.head h1 { font-family: var(--font-display); font-size: 26px; margin: 0; }
.desc { color: var(--text-dim); font-size: 13px; margin: 6px 0 20px; }

.drop {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 38px 20px; border-radius: var(--radius-lg);
  border: 2px dashed var(--surface-line);
  background: var(--surface-strong);
  text-align: center; cursor: pointer; transition: .2s;
}
.drop:hover { border-color: var(--grad-primary); }
.drop.over { border-color: #2b8f86; background: var(--grad-soft); transform: scale(1.01); }
.drop-ico { font-size: 34px; color: var(--c-teal); }
.drop-title { font-size: 15px; font-weight: 600; }
.drop-sub { font-size: 12px; color: var(--text-dim); }

.panel { margin-top: 22px; }
.panel-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; color: var(--text-dim); font-size: 13px; }
.clear { color: var(--text-dim); font-size: 13px; padding: 4px 10px; border-radius: 99px; border: 1px solid var(--surface-line); background: none; cursor: pointer; }
.clear:hover { color: var(--text); }

.list { display: flex; flex-direction: column; gap: 4px; }
.row { display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: var(--radius-md); cursor: pointer; transition: .16s; }
.row:hover { background: var(--surface-hover); }
.row.active { background: var(--grad-soft); }
.cv { width: 46px; height: 46px; border-radius: 10px; overflow: hidden; flex: 0 0 auto; background: var(--surface-strong); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-card); }
.cv img { width: 100%; height: 100%; object-fit: cover; }
.cv-ph { color: var(--c-teal); font-size: 20px; }
.meta { flex: 1; min-width: 0; }
.nm { font-size: 14.5px; font-weight: 600; }
.ar { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
.play { width: 38px; height: 38px; border-radius: 50%; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; background: var(--grad-primary); color: #fff; font-size: 14px; border: none; cursor: pointer; }
.play:active { transform: scale(.92); }

.empty-tip { text-align: center; color: var(--text-dim); margin-top: 26px; font-size: 13px; }

/* ============ 移动端 ============ */
@media (max-width: 820px) {
  .local { padding: 22px 16px 12px; }
  .head h1 { font-size: 22px; }
  .drop { padding: 30px 16px; }
  .cv { width: 42px; height: 42px; }
  .play { width: 40px; height: 40px; }
}
</style>
