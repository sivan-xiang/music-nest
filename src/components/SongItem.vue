<script setup>
import { computed } from 'vue'
import { usePlayer } from '../store/player.js'
import { formatTime } from '../utils/lrc.js'

const props = defineProps({
  track: { type: Object, required: true },
  index: { type: Number, default: 0 },
  playlist: { type: Array, default: () => [] }
})
const emit = defineEmits(['play'])
const { state, isFav, toggleFav, togglePlay, playTrack, openNow } = usePlayer()

const isCurrent = computed(() => state.current && state.current.id === props.track.id)
const playingHere = computed(() => isCurrent.value && state.isPlaying)
const fav = computed(() => isFav(props.track.id))
function onPlay() {
  // 点歌曲（图片/名称/整行）→ 非当前歌则播放它，随后进入全屏播放页
  if (!isCurrent.value) playTrack(props.track, props.playlist)
  openNow()
}
function onPlayButton() {
  // 仅播放/暂停，不进入播放页（让列表里能直接暂停/继续当前歌）
  if (isCurrent.value) togglePlay()
  else playTrack(props.track, props.playlist)
}
</script>

<template>
  <div class="song" :class="{ active: isCurrent }" @click="onPlay">
    <div class="idx">
      <span v-if="!playingHere" class="num">{{ String(index + 1).padStart(2, '0') }}</span>
      <span v-else class="eq"><i></i><i></i><i></i></span>
    </div>

    <img class="cover" :src="track.album?.picUrl" alt="" loading="lazy" />

    <div class="meta">
      <div class="name ellipsis" :title="track.name">{{ track.name }}</div>
      <div class="artist ellipsis">{{ track.artistName }}<span class="album" v-if="track.album?.name"> · {{ track.album.name }}</span></div>
    </div>

    <button class="fav" :class="{ on: fav }" :title="fav ? '取消收藏' : '收藏'" @click.stop="toggleFav(track)">
      <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.2C.6 8.9 2 5.5 5.2 5.1 7 4.9 8.6 5.8 9.4 7.2L12 12l2.6-4.8C15.4 5.8 17 4.9 18.8 5.1 22 5.5 23.4 8.9 22 11.8 19.5 16.4 12 21 12 21z"/></svg>
    </button>

    <div class="dur">{{ formatTime(track.duration) }}</div>

    <button class="play" @click.stop="onPlayButton" :title="playingHere ? '正在播放（点此暂停）' : '播放'">
      <svg v-if="!playingHere" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      <svg v-else viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
    </button>
  </div>
</template>

<style scoped>
.song {
  position: relative; overflow: hidden;
  display: grid; grid-template-columns: 34px 46px 1fr 40px 52px 40px;
  align-items: center; gap: 14px; padding: 9px 14px;
  border-radius: var(--radius-sm); cursor: pointer; transition: .18s;
  animation: rise .5s cubic-bezier(.2, .7, .3, 1) both;
  animation-delay: calc(var(--i, 0) * 45ms);
}
.song:hover { background: var(--surface-hover); }
.song:hover .cover { transform: scale(1.06); }
.song::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(105deg, transparent 38%, rgba(255, 255, 255, .42) 50%, transparent 62%);
  transform: translateX(-130%); opacity: 0;
}
.song:hover::after { animation: shimmer .9s ease; }
.song.active { background: var(--grad-soft); }
.idx { text-align: center; color: var(--text-dim); font-size: 13px; font-variant-numeric: tabular-nums; }
.eq { display: inline-flex; gap: 2px; align-items: flex-end; height: 16px; justify-content: center; }
.eq i { width: 3px; background: var(--c-teal); border-radius: 2px; animation: eq 0.9s ease-in-out infinite; }
.eq i:nth-child(2){ animation-delay: .25s } .eq i:nth-child(3){ animation-delay: .5s }
@keyframes eq { 0%,100%{ height:4px } 50%{ height:16px } }
.cover { width: 46px; height: 46px; border-radius: 10px; object-fit: cover; box-shadow: var(--shadow-card); transition: transform .3s cubic-bezier(.2, .7, .3, 1); }
.meta { min-width: 0; }
.name { font-size: 14.5px; font-weight: 600; }
.song.active .name { color: #2b8f86; }
.artist { font-size: 12.5px; color: var(--text-dim); }
.album { color: var(--text-dim); }
.fav { width: 30px; height: 30px; display: grid; place-items: center; opacity: 0; transition: .18s; }
.song:hover .fav { opacity: 1; }
.fav svg { width: 17px; height: 17px; fill: none; stroke: var(--text-dim); stroke-width: 1.7; transition: .18s; }
.fav.on { opacity: 1; animation: pop .45s cubic-bezier(.2, .7, .3, 1); }
.fav.on svg { fill: #ff8fa3; stroke: #ff8fa3; }
.fav:hover svg { stroke: #ff8fa3; }
.dur { font-size: 12.5px; color: var(--text-dim); text-align: right; font-variant-numeric: tabular-nums; }
.play {
  width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
  background: var(--grad-primary); color: #fff; opacity: 0; transform: scale(.85); transition: .18s;
  box-shadow: 0 6px 16px rgba(120,160,200,.4);
}
.song:hover .play { opacity: 1; transform: scale(1); }
.play svg { width: 18px; height: 18px; fill: #fff; }

/* ============ 移动端：取消时长列，操作按钮常显（触屏无 hover） ============ */
@media (max-width: 820px) {
  .song { grid-template-columns: 30px 44px 1fr 38px 38px; gap: 10px; padding: 8px 10px; }
  .dur { display: none; }
  .fav { opacity: 1; width: 28px; height: 28px; }
  .play { opacity: 1; transform: scale(1); width: 32px; height: 32px; }
  .idx { font-size: 12px; }
  .name { font-size: 14px; }
  .artist { font-size: 12px; }
}
@media (hover: none) {
  .song:hover::after { animation: none; }
  .song:hover .cover { transform: none; }
}
</style>
