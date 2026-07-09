<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const root = ref(null)
let raf = 0
function onMove(e) {
  if (raf) return
  raf = requestAnimationFrame(() => {
    const x = (e.clientX / window.innerWidth - 0.5).toFixed(3)
    const y = (e.clientY / window.innerHeight - 0.5).toFixed(3)
    if (root.value) {
      root.value.style.setProperty('--px', x)
      root.value.style.setProperty('--py', y)
    }
    raf = 0
  })
}
onMounted(() => window.addEventListener('mousemove', onMove, { passive: true }))
onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  if (raf) cancelAnimationFrame(raf)
})

// 漂浮光尘：错落上行，营造空灵氛围
const motes = Array.from({ length: 20 }, () => ({
  left: (Math.random() * 100).toFixed(2),
  size: (3 + Math.random() * 6).toFixed(1),
  dur: (9 + Math.random() * 12).toFixed(2),
  delay: (-Math.random() * 22).toFixed(2),
  drift: (Math.random() * 2 - 1) * 70,
  op: (0.35 + Math.random() * 0.4).toFixed(2)
}))
</script>

<template>
  <div class="particles" ref="root" aria-hidden="true">
    <div class="layer">
      <span class="blob b1"></span>
      <span class="blob b2"></span>
      <span class="blob b3"></span>
    </div>
    <div class="dust">
      <span
        v-for="(m, i) in motes"
        :key="i"
        class="mote"
        :style="{
          left: m.left + '%',
          width: m.size + 'px',
          height: m.size + 'px',
          '--dur': m.dur + 's',
          '--delay': m.delay + 's',
          '--drift': m.drift + 'px',
          '--op': m.op
        }"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.particles {
  position: fixed; inset: 0; z-index: 0; overflow: hidden;
  pointer-events: none; --px: 0; --py: 0;
}
/* 视差层：随鼠标轻微反向位移，制造景深 */
.layer, .dust {
  position: absolute; inset: -8%;
  transition: transform .7s cubic-bezier(.2, .7, .3, 1);
  transform: translate3d(calc(var(--px) * 34px), calc(var(--py) * 34px), 0);
}
.dust { transform: translate3d(calc(var(--px) * -24px), calc(var(--py) * -24px), 0); }

/* 流动雾光团 */
.blob {
  position: absolute; border-radius: 50%; filter: blur(46px); opacity: .5;
  will-change: transform;
}
.b1 {
  width: 40vmax; height: 40vmax; left: -8vmax; top: -10vmax;
  background: radial-gradient(circle, rgba(134, 230, 207, .5), transparent 62%);
  animation: blobFloat 22s ease-in-out infinite;
}
.b2 {
  width: 36vmax; height: 36vmax; right: -6vmax; top: 6vmax;
  background: radial-gradient(circle, rgba(194, 179, 238, .48), transparent 62%);
  animation: blobFloat 29s ease-in-out infinite reverse;
}
.b3 {
  width: 34vmax; height: 34vmax; left: 28vmax; bottom: -16vmax;
  background: radial-gradient(circle, rgba(179, 220, 247, .5), transparent 62%);
  animation: blobFloat 25s ease-in-out infinite;
}

/* 漂浮光尘 */
.mote {
  position: absolute; bottom: -6%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, .95), rgba(205, 235, 240, .25) 70%, transparent);
  box-shadow: 0 0 9px rgba(255, 255, 255, .45);
  animation: floatUp var(--dur) linear var(--delay) infinite;
  will-change: transform, opacity;
}
[data-theme="dark"] .mote {
  background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, .82), rgba(160, 200, 210, .2) 70%, transparent);
  box-shadow: 0 0 9px rgba(180, 220, 230, .5);
}

@keyframes blobFloat {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  33%  { transform: translate3d(4%, 5%, 0) scale(1.08); }
  66%  { transform: translate3d(-3%, 3%, 0) scale(.95); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes floatUp {
  0%   { transform: translateY(0) translateX(0); opacity: 0; }
  12%  { opacity: var(--op); }
  50%  { transform: translateY(-52vh) translateX(var(--drift)); }
  88%  { opacity: var(--op); }
  100% { transform: translateY(-104vh) translateX(0); opacity: 0; }
}
</style>
