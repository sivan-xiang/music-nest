<script setup>
import { computed } from 'vue'
import { usePlayer } from '../store/player.js'
import { formatTime } from '../utils/lrc.js'
import AlbumArt from '../components/AlbumArt.vue'
import LyricsPanel from '../components/LyricsPanel.vue'

const emit = defineEmits(['close'])
const { state, togglePlay, next, prev, seek, cycleMode, isFav, toggleFav } = usePlayer()

const fav = computed(() => (state.current ? isFav(state.current.id) : false))
const pct = computed(() => (state.duration ? (state.currentTime / state.duration) * 100 : 0))
const modeLabel = computed(() => ({ order: '列表循环', one: '单曲循环', shuffle: '随机播放' }[state.mode]))

function onSeek(e) {
  const bar = e.currentTarget
  const rect = bar.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  seek(ratio * state.duration)
}
</script>

<template>
  <div class="now" v-if="state.current">
    <div class="bg" :style="{ backgroundImage: `url(${state.current.album?.picUrl})` }"></div>
    <div class="bg-mask"></div>

    <button class="close" @click="emit('close')" title="返回">✕</button>

    <div class="stage">
      <div class="left">
        <div class="turntable" :class="{ playing: state.isPlaying }">
          <AlbumArt :src="state.current.album?.picUrl" :playing="state.isPlaying" :size="300" />
          <span class="tonearm"></span>
        </div>
        <div class="title">{{ state.current.name }}</div>
        <div class="artist">{{ state.current.artistName }}</div>
        <div class="album muted">{{ state.current.album?.name }}</div>

        <div class="actions">
          <button class="act" :class="{ on: fav }" @click="toggleFav(state.current)" title="收藏">
            <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.2C.6 8.9 2 5.5 5.2 5.1 7 4.9 8.6 5.8 9.4 7.2L12 12l2.6-4.8C15.4 5.8 17 4.9 18.8 5.1 22 5.5 23.4 8.9 22 11.8 19.5 16.4 12 21 12 21z"/></svg>
          </button>
          <button class="act" @click="cycleMode" :title="modeLabel">{{ modeLabel }}</button>
        </div>

        <div class="progress" @click="onSeek">
          <div class="track"><div class="fill" :style="{ width: pct + '%' }"></div></div>
          <div class="times">
            <span>{{ formatTime(state.currentTime) }}</span>
            <span>{{ formatTime(state.duration) }}</span>
          </div>
        </div>

        <div class="controls">
          <button class="ctl" @click="cycleMode" title="播放模式">{{ modeLabel[0] }}</button>
          <button class="ctl ico" @click="prev" title="上一首">
            <svg viewBox="0 0 24 24"><path d="M6 5v14M19 5L9 12l10 7z"/></svg>
          </button>
          <button class="ctl play-btn" @click="togglePlay" :title="state.isPlaying ? '暂停' : '播放'">
            <svg v-if="!state.isPlaying" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <svg v-else viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
          </button>
          <button class="ctl ico" @click="next" title="下一首">
            <svg viewBox="0 0 24 24"><path d="M18 5v14M5 5l10 7L5 19z"/></svg>
          </button>
          <button class="ctl" @click="emit('close')" title="收起">⤓</button>
        </div>
      </div>

      <div class="right">
        <LyricsPanel :lines="state.lyrics" :active-index="state.lyricIndex" @seek="seek" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.now { position: fixed; inset: 0; z-index: 80; display: flex; }
.bg { position: absolute; inset: -10%; background-size: cover; background-position: center; filter: blur(60px) saturate(140%); transform: scale(1.2); opacity: .9; }
.bg-mask { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(244,247,248,.78), rgba(244,247,248,.9)); backdrop-filter: blur(8px); }
.close { position: absolute; top: 22px; right: 26px; width: 42px; height: 42px; border-radius: 50%; background: var(--surface-strong); color: var(--text-soft); font-size: 18px; z-index: 2; transition: .2s; }
.close:hover { background: var(--surface-hover); transform: rotate(90deg); }

.stage { position: relative; z-index: 1; flex: 1; display: grid; grid-template-columns: 1fr; gap: 22px; padding: 64px 24px; align-items: center; overflow-y: auto; }

.left { display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%; max-width: 380px; margin: 0 auto; }
.turntable { position: relative; width: 100%; max-width: 320px; margin: 0 auto; }
.tonearm {
  position: absolute; top: 2px; right: 16px;
  width: 72px; height: 72px; transform-origin: top right;
  transform: rotate(-34deg); transition: transform .6s cubic-bezier(.2, .7, .3, 1);
  pointer-events: none; z-index: 3;
}
.tonearm::before {
  content: ''; position: absolute; top: 0; right: 0;
  width: 13px; height: 13px; border-radius: 50%;
  background: var(--text-soft); box-shadow: 0 2px 6px rgba(0, 0, 0, .22);
}
.tonearm::after {
  content: ''; position: absolute; top: 6px; right: 5px;
  width: 5px; height: 58px; border-radius: 5px;
  background: linear-gradient(var(--text-soft), var(--c-teal));
  transform-origin: top center;
}
.turntable.playing .tonearm { transform: rotate(6deg); }
.left .title { font-size: 26px; font-weight: 800; margin-top: 26px; max-width: 320px; }
.left .artist { font-size: 15px; color: var(--text-soft); margin-top: 6px; }
.left .album { font-size: 13px; margin-top: 2px; }

.actions { display: flex; gap: 14px; margin: 22px 0 14px; }
.act { padding: 8px 16px; border-radius: 99px; background: var(--surface-strong); color: var(--text-soft); font-size: 13px; font-weight: 600; border: 1px solid var(--surface-line); transition: .2s; }
.act:hover { background: var(--surface-hover); }
.act.on { color: #ff8fa3; animation: pop .45s cubic-bezier(.2, .7, .3, 1); }
.act.on svg { fill: #ff8fa3; }
.act svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.7; vertical-align: -3px; margin-right: 5px; }

.progress { width: 100%; max-width: 340px; margin-bottom: 18px; }
.track { height: 5px; border-radius: 99px; background: rgba(120,140,160,.25); cursor: pointer; overflow: hidden; }
.fill { height: 100%; border-radius: 99px; background: var(--grad-primary); }
.times { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--text-dim); margin-top: 6px; font-variant-numeric: tabular-nums; }

.controls { display: flex; align-items: center; gap: 18px; }
.ctl { color: var(--text-soft); font-size: 13px; font-weight: 600; transition: .18s; }
.ctl:hover { color: var(--text); }
.ctl.ico svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linejoin: round; stroke-linecap: round; }
.play-btn { width: 60px; height: 60px; border-radius: 50%; background: var(--grad-primary); color: #fff; display: grid; place-items: center; box-shadow: 0 12px 30px rgba(120,160,200,.45); transition: .18s; }
.play-btn:hover { transform: scale(1.06); color: #fff; }
.play-btn svg { width: 28px; height: 28px; fill: #fff; }

.right { height: 320px; display: flex; }
.right :deep(.lyrics) { flex: 1; }

  @media (max-width: 820px) {
    .close { top: calc(env(safe-area-inset-top) + 16px); right: 16px; }
    .stage {
      padding: calc(env(safe-area-inset-top) + 40px) 18px calc(env(safe-area-inset-bottom) + 24px);
      gap: 18px;
    }
    .left { max-width: 300px; }
    .turntable { max-width: 280px; }
    .left .title { font-size: 22px; margin-top: 20px; }
    .left .artist { font-size: 14px; }
    .actions { gap: 12px; margin: 16px 0 12px; }
    .controls { gap: 14px; }
    .right { height: 280px; }
  }
</style>
