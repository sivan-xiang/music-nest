<script setup>
defineProps({
  src: { type: String, default: '' },
  playing: { type: Boolean, default: false },
  size: { type: Number, default: 220 }
})
</script>

<template>
  <div class="vinyl" :style="{ width: size + 'px', height: size + 'px' }">
    <div class="disc" :class="{ spin: playing }">
      <div class="grooves"></div>
      <div class="cover" :style="{ backgroundImage: src ? `url(${src})` : 'var(--grad-primary)' }">
        <span v-if="!src" class="note">♪</span>
      </div>
      <div class="hole"></div>
    </div>
  </div>
</template>

<style scoped>
.vinyl { position: relative; }
.disc {
  position: relative; width: 100%; height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, #2b2b33 0 30%, #1c1c22 30% 100%);
  box-shadow: 0 18px 50px rgba(40,50,70,.35);
  display: grid; place-items: center;
}
.disc.spin { animation: spin 18s linear infinite; }
.grooves {
  position: absolute; inset: 8%; border-radius: 50%;
  background: repeating-radial-gradient(circle at 50% 50%,
    rgba(255,255,255,.04) 0 2px, rgba(0,0,0,.18) 2px 4px);
}
.cover {
  position: relative; width: 62%; height: 62%; border-radius: 50%;
  background-size: cover; background-position: center;
  box-shadow: inset 0 0 0 4px rgba(255,255,255,.12);
  display: grid; place-items: center;
}
.note { color: #fff; font-size: 26px; opacity: .8; }
.hole {
  position: absolute; width: 12px; height: 12px; border-radius: 50%;
  background: var(--bg); box-shadow: 0 0 0 3px rgba(0,0,0,.35);
}
</style>
