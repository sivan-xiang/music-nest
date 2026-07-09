<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  lines: { type: Array, default: () => [] },
  activeIndex: { type: Number, default: -1 }
})
const emit = defineEmits(['seek'])

const containerRef = ref(null)
const innerRef = ref(null)
const offset = ref(0)

function recompute() {
  const c = containerRef.value
  const inner = innerRef.value
  if (!c || !inner) return
  const el = inner.children[props.activeIndex]
  if (!el) {
    offset.value = 0
    return
  }
  const target = el.offsetTop + el.offsetHeight / 2
  offset.value = c.clientHeight / 2 - target
}

watch(
  () => props.activeIndex,
  () => nextTick(recompute)
)
watch(
  () => props.lines.length,
  () => nextTick(recompute)
)

function onLineClick(i) {
  const line = props.lines[i]
  if (line) emit('seek', line.time)
}
</script>

<template>
  <div class="lyrics" ref="containerRef">
    <div v-if="!lines.length" class="empty">♪ 暂无歌词，享受旋律吧 ♪</div>

    <div v-else class="inner" ref="innerRef" :style="{ transform: `translateY(${offset}px)` }">
      <p
        v-for="(line, i) in lines"
        :key="i"
        class="line"
        :class="{ active: i === activeIndex, near: Math.abs(i - activeIndex) <= 2 }"
        @click="onLineClick(i)"
      >
        <span class="main">{{ line.text || '♪' }}</span>
        <span v-if="line.trans" class="trans">{{ line.trans }}</span>
      </p>
      <div class="pad"></div>
    </div>
  </div>
</template>

<style scoped>
.lyrics {
  position: relative; height: 100%; overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 16%, #000 84%, transparent);
  mask-image: linear-gradient(180deg, transparent, #000 16%, #000 84%, transparent);
}
.inner {
  transition: transform .55s cubic-bezier(.22,.7,.25,1);
  padding: 0 8px;
}
.line {
  text-align: center; padding: 11px 0; cursor: pointer;
  color: var(--text-dim); font-size: 16px; line-height: 1.4;
  opacity: .45; transform: scale(.94); transform-origin: center;
  transition: opacity .4s, transform .4s, color .4s; filter: blur(.3px);
}
.line.near { opacity: .7; filter: none; }
.line.active {
  opacity: 1; transform: scale(1.12); color: var(--text); filter: none;
  font-weight: 700;
}
.line.active .main {
  background: var(--grad-primary);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.main { display: block; }
.trans { display: block; font-size: 12.5px; color: var(--text-dim); margin-top: 4px; font-weight: 400; }
.line.active .trans { color: var(--text-soft); -webkit-text-fill-color: var(--text-soft); }
.pad { height: 30vh; }
.empty {
  height: 100%; display: grid; place-items: center;
  color: var(--text-dim); font-size: 15px; letter-spacing: 1px;
}
</style>
