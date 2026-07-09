/* 常驻进程模式（Railway / Render / 任意 Node 平台）
 * 启动 NeteaseCloudMusicApi，监听 PORT（默认 3000） */
const { serveNcmApi } = require('NeteaseCloudMusicApi/server')

const port = Number(process.env.PORT) || 3000
const host = process.env.HOST || ''

serveNcmApi({ port, host })
  .then(() => console.log(`music-nest API running on :${port}`))
  .catch((e) => {
    console.error('API server failed to start:', e)
    process.exit(1)
  })
