/* ============================================================
   LRC 歌词解析工具
   支持：[mm:ss.xx] 文本，一行多时间戳，及译词合并
   ============================================================ */

const TIME_RE = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g

/**
 * 解析 LRC 文本为 [{ time:Number(秒), text:String }]
 * 同时可传入译词（tlyric）文本，按时间就近合并
 */
export function parseLrc(lrcText = '', tlyricText = '') {
  const base = parseSingle(lrcText)
  const trans = parseSingle(tlyricText)

  if (!base.length) return []

  // 把译词按时间映射到原词（找时间最接近的译词行）
  if (trans.length) {
    const map = new Map()
    trans.forEach((t) => map.set(Math.round(t.time), t.text))
    base.forEach((line) => {
      const key = Math.round(line.time)
      if (map.has(key)) line.trans = map.get(key)
    })
  }

  // 过滤掉纯空白行，但保留一个占位，避免空歌词
  const out = base.filter((l) => l.text.trim().length)
  return out.length ? out : base
}

function parseSingle(text) {
  if (!text) return []
  const lines = text.split(/\r?\n/)
  const result = []
  for (const line of lines) {
    TIME_RE.lastIndex = 0
    const stamps = []
    let m
    while ((m = TIME_RE.exec(line))) {
      const min = parseInt(m[1], 10)
      const sec = parseInt(m[2], 10)
      const ms = m[3] ? parseInt(m[3].padEnd(3, '0'), 10) : 0
      stamps.push(min * 60 + sec + ms / 1000)
    }
    if (!stamps.length) continue
    const content = line.replace(TIME_RE, '').trim()
    stamps.forEach((t) => result.push({ time: t, text: content }))
  }
  return result.sort((a, b) => a.time - b.time)
}

/** 根据当前播放时间，返回应高亮的歌词行索引 */
export function activeLyricIndex(lines, currentTime) {
  if (!lines || !lines.length) return -1
  let lo = 0
  let hi = lines.length - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (lines[mid].time <= currentTime + 0.15) {
      ans = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return ans
}

export function formatTime(sec) {
  if (!isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}
