/* 全栈一体服务（Railway 部署入口）
 * - 启动 NeteaseCloudMusicApi 到内部端口（NCM_PORT）
 * - 主服务监听 PORT（Railway 暴露端口）：
 *     /api/*  -> 代理到网易云 API（去掉 /api 前缀）
 *     /health -> 健康检查
 *     其余    -> 托管前端 dist（SPA 回退到 index.html）
 * 前端已用同源 /api 调用，无需额外跨域配置。
 */
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const { createProxyMiddleware } = require('http-proxy-middleware')
const { serveNcmApi } = require('NeteaseCloudMusicApi/server')

const NCM_PORT = Number(process.env.NCM_PORT) || 4000
const PORT = Number(process.env.PORT) || 3000

serveNcmApi({ port: NCM_PORT })
  .then(() => {
    const app = express()
    app.use(cors())
    app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))

    // /api 前缀代理到网易云 API（去掉 /api 前缀，转发到 /search 等）
    app.use(
      '/api',
      createProxyMiddleware({
        target: `http://127.0.0.1:${NCM_PORT}`,
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      })
    )

    // 生产模式：托管打包后的前端（vite build 生成的 dist）
    const distDir = path.resolve(__dirname, '..', 'dist')
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir))
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next()
        res.sendFile(path.join(distDir, 'index.html'))
      })
    } else {
      console.log('[MusicNest] 未检测到 dist/，仅启动 API 代理模式')
    }

    app.listen(PORT, () => {
      console.log(
        `[MusicNest] 服务已启动: http://localhost:${PORT} (ncm@${NCM_PORT})`
      )
    })
  })
  .catch((e) => {
    console.error('[MusicNest] 启动失败:', e)
    process.exit(1)
  })
