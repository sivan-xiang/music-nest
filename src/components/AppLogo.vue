<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: Number, default: 40 },
  showWord: { type: Boolean, default: false },
  word: { type: String, default: '音乐小窝' },
  // mark 仅图标；tile 为渐变圆角底上的白色音符
  variant: { type: String, default: 'mark' }
})

// 每个实例独立渐变 id，避免多处引用冲突
const uid = Math.random().toString(36).slice(2, 8)
const gid = `mn-${uid}`
const sid = `ms-${uid}`

const box = computed(() => (props.variant === 'tile' ? props.size : props.size))
</script>

<template>
  <span class="logo" :class="variant" :style="{ width: box + 'px', height: box + 'px' }">
    <svg :width="size" :height="size" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#86e6cf" />
          <stop offset="0.55" stop-color="#a9c9f3" />
          <stop offset="1" stop-color="#c9b2ef" />
        </linearGradient>
        <linearGradient :id="sid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="1" stop-color="#eef6ff" />
        </linearGradient>
      </defs>

      <!-- 渐变圆角底（tile 模式） -->
      <rect
        v-if="variant === 'tile'"
        x="5" y="5" width="54" height="54" rx="17"
        :fill="`url(#${gid})`"
      />

      <!-- 柔环（mark 模式） -->
      <circle
        v-else
        cx="32" cy="32" r="29.5"
        fill="none" :stroke="`url(#${gid})`" stroke-width="2.4" opacity="0.9"
      />

      <!-- 音符（双连音符） -->
      <g v-if="variant === 'tile'" fill="#ffffff">
        <ellipse cx="24" cy="41" rx="6" ry="4.6" transform="rotate(-18 24 41)" />
        <ellipse cx="44" cy="37" rx="6" ry="4.6" transform="rotate(-18 44 37)" />
      </g>
      <g
        v-else
        :fill="`url(#${gid})`"
      >
        <ellipse cx="24" cy="41" rx="6" ry="4.6" transform="rotate(-18 24 41)" />
        <ellipse cx="44" cy="37" rx="6" ry="4.6" transform="rotate(-18 44 37)" />
      </g>

      <g
        :stroke="variant === 'tile' ? '#ffffff' : `url(#${gid})`"
        stroke-width="3" stroke-linecap="round" fill="none"
      >
        <path d="M29.5 39V20" />
        <path d="M49.5 35V16" />
        <path d="M29.5 20L49.5 16" stroke-width="4.2" />
      </g>

      <!-- 星芒点缀（ethereal） -->
      <path
        :fill="variant === 'tile' ? '#ffffff' : `url(#${gid})`"
        d="M51 9 L52.4 12.4 L55.8 13.8 L52.4 15.2 L51 18.6 L49.6 15.2 L46.2 13.8 L49.6 12.4 Z"
        opacity="0.92"
      />
    </svg>

    <span v-if="showWord" class="word">{{ word }}</span>
  </span>
</template>

<style scoped>
.logo { display: inline-flex; align-items: center; gap: 12px; line-height: 0; }
.logo .word {
  font-family: var(--font-display, "Noto Serif SC", "Songti SC", serif);
  font-size: 20px; font-weight: 700; letter-spacing: 1px;
  background: var(--grad-primary);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
