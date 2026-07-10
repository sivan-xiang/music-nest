<script setup>
import { computed } from 'vue'
import { usePlayer } from '../store/player.js'
import { formatTime } from '../utils/lrc.js'
import AlbumArt from './AlbumArt.vue'

const emit = defineEmits(['open-now'])
const { state, togglePlay, next, prev, seek, setVolume, cycleMode, isFav, toggleFav } = usePlayer()

const pct = computed(() =>
  state.duration ? (state.currentTime / state.duration) * 100 : 0
)
const fav = computed(() => (state.current ? isFav(state.current.id) : false))
const modeLabel = computed(
  () => ({ order: '列表循环', one: '单曲循环', shuffle: '随机播放' }[state.mode])
)

function onSeek(e) {
  const bar = e.currentTarget
  const rect = bar.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  seek(ratio * state.duration)
}
</script>

<template>
  <footer class="player glass" :style="{ '--pct': pct + '%' }">
    <div class="left" @click="state.current && emit('open-now')">
      <AlbumArt :src="state.current?.album?.picUrl" :playing="state.isPlaying" :size="56" />
      <div class="eq-bars" :class="{ playing: state.isPlaying }" v-if="state.current">
        <i v-for="n in 5" :key="n"></i>
      </div>
      <div class="info" v-if="state.current">
        <div class="title ellipsis">{{ state.current.name }}</div>
        <div class="artist ellipsis">{{ state.current.artistName }}</div>
      </div>
      <div class="info" v-else>
        <div class="title muted">还没有在播放</div>
        <div class="artist muted">选一首歌开始吧</div>
      </div>
      <button v-if="state.current" class="hfav" :class="{ on: fav }" @click="toggleFav(state.current)" title="收藏">
        <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.2C.6 8.9 2 5.5 5.2 5.1 7 4.9 8.6 5.8 9.4 7.2L12 12l2.6-4.8C15.4 5.8 17 4.9 18.8 5.1 22 5.5 23.4 8.9 22 11.8 19.5 16.4 12 21 12 21z"/></svg>
      </button>
    </div>

    <div class="center">
      <div class="controls">
        <button class="ctl" @click="cycleMode" :title="modeLabel">{{ modeLabel }}</button>
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
        <button class="ctl expand" @click="emit('open-now')" title="打开播放页">⤢</button>
      </div>
      <div class="progress" @click="onSeek">
        <div class="track"><div class="fill" :style="{ width: pct + '%' }"></div></div>
        <div class="times">
          <span>{{ formatTime(state.currentTime) }}</span>
          <span>{{ formatTime(state.duration) }}</span>
        </div>
      </div>
    </div>

    <div class="right">
      <button class="ctl vol" title="音量">
        <svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zM16 9a3 3 0 010 6M18.5 7a6 6 0 010 10"/></svg>
      </button>
      <input
        class="vol-range"
        type="range" min="0" max="1" step="0.01"
        :value="state.volume"
        @input="setVolume(parseFloat($event.target.value))"
      />
    </div>

    <transition name="toast">
      <div class="toast" v-if="state.toast">{{ state.toast }}</div>
    </transition>
  </footer>
</template>

<style scoped>
.player {
  position: fixed;
  left: calc(var(--sidebar-w) + 48px);
  right: 16px; bottom: 16px; height: var(--player-h);
  display: grid; grid-template-columns: 1fr 2fr 1fr; align-items: center;
  padding: 0 20px; gap: 18px; z-index: 50;
  border-radius: 22px; border: 1px solid var(--surface-line);
  box-shadow: var(--shadow-float);
}
.left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.eq-bars { display: flex; align-items: flex-end; gap: 3px; height: 26px; width: 22px; justify-content: center; }
.eq-bars i { width: 3px; height: 100%; border-radius: 2px; background: var(--grad-primary); transform-origin: bottom; transform: scaleY(.28); }
.eq-bars.playing i { animation: eqBar .9s ease-in-out infinite; }
.eq-bars i:nth-child(2) { animation-delay: .15s; }
.eq-bars i:nth-child(3) { animation-delay: .3s; }
.eq-bars i:nth-child(4) { animation-delay: .45s; }
.eq-bars i:nth-child(5) { animation-delay: .6s; }
.info { min-width: 0; cursor: pointer; }
.title { font-size: 14.5px; font-weight: 700; }
.artist { font-size: 12.5px; color: var(--text-dim); }
.hfav { width: 30px; height: 30px; display: grid; place-items: center; margin-left: 4px; }
.hfav svg { width: 18px; height: 18px; fill: none; stroke: var(--text-dim); stroke-width: 1.7; transition:.18s; }
.hfav.on svg { fill: #ff8fa3; stroke: #ff8fa3; }
.hfav.on { animation: pop .45s cubic-bezier(.2, .7, .3, 1); }

.center { display: flex; flex-direction: column; gap: 6px; }
.controls { display: flex; align-items: center; justify-content: center; gap: 14px; }
.ctl { color: var(--text-soft); font-size: 12px; font-weight: 600; transition: .18s; }
.ctl:hover { color: var(--text); }
.ctl.ico svg, .ctl.vol svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linejoin: round; stroke-linecap: round; }
.play-btn {
  width: 46px; height: 46px; border-radius: 50%; background: var(--grad-primary); color: #fff;
  display: grid; place-items: center; box-shadow: 0 8px 22px rgba(120,160,200,.4); transition: .18s;
}
.play-btn:hover { transform: scale(1.06); color: #fff; }
.play-btn svg { width: 22px; height: 22px; fill: #fff; }
.expand { font-size: 16px; }

.progress { display: flex; align-items: center; gap: 12px; }
.track { flex: 1; height: 5px; border-radius: 99px; background: rgba(120,140,160,.2); cursor: pointer; overflow: hidden; }
.fill { height: 100%; border-radius: 99px; background: var(--grad-primary); }
.times { display: flex; justify-content: space-between; width: 78px; font-size: 11.5px; color: var(--text-dim); font-variant-numeric: tabular-nums; }

.right { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.vol-range { width: 92px; accent-color: #5bc0be; }

.toast {
  position: absolute; left: 50%; top: -18px; transform: translate(-50%, -100%);
  background: rgba(40,46,60,.92); color: #fff; padding: 9px 16px; border-radius: 12px;
  font-size: 12.5px; white-space: nowrap; box-shadow: 0 10px 30px rgba(0,0,0,.25);
  backdrop-filter: blur(6px);
}
.toast-enter-active, .toast-leave-active { transition: .28s cubic-bezier(.2,.7,.3,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -80%); }

/* ============ 移动端：常驻迷你播放条（位于底部 Tab 栏之上） ============ */
@media (max-width: 820px) {
  .player {
    left: 0; right: 0;
    bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom));
    height: var(--player-h);
    padding: 0 12px; gap: 8px;
    grid-template-columns: 1fr auto;
    border-radius: 16px 16px 0 0;
  }
  .player .right { display: none; }              /* 隐藏音量 */
  .player .center { gap: 0; padding: 0; }
  .player .progress { display: none; }           /* 迷你条不显示进度条 */
  .player .controls { gap: 4px; }
  .player .controls .ctl:first-child { display: none; } /* 隐藏“列表循环”文字按钮 */
  .player .left { gap: 10px; }
  .player .info .title { font-size: 13px; }
  .player .info .artist { font-size: 11.5px; }
  .player .hfav { display: none; }
  .player .eq-bars { width: 16px; height: 22px; }
  .player .play-btn { width: 42px; height: 42px; }
  .player .play-btn svg { width: 20px; height: 20px; }
  .player .expand { display: none; }          /* 移动端去掉打开播放页图标，点歌名即可展开 */
  /* 底部细进度线：纯展示，跟随播放进度（--pct 由组件传入） */
  .player::after {
    content: '';
    position: absolute; left: 0; bottom: 0;
    width: var(--pct, 0%); height: 2px;
    background: var(--grad-primary);
    border-radius: 0 2px 2px 0;
    z-index: 1;
  }
}
</style>
