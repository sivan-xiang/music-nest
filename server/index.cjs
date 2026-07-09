/* 全栈一体服务（Railway 部署入口）
 * - 主服务监听 PORT（Railway 暴露端口）：
 *     /health -> 健康检查（立即响应，不等 NCM API）
 *     其余    -> 托管前端 dist（SPA 回退到 index.html）
 * - 异步启动 NeteaseCloudMusicApi 到内部端口（NCM_PORT），
 *   就绪后挂载 /api 代理到网易云 API（去掉 /api 前缀）
 * 前端已用同源 /api 调用，无需额外跨域配置。
 */
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const NCM_PORT = Number(process.env.NCM_PORT) || 4000
const PORT = Number(process.env.PORT) || 3000

const app = express()
app.use(cors())

// ─── 立即注册：健康检查（Railway / Docker 探针依赖此端点）────
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))

// ─── 立即托管前端 dist（构建产物一定存在，railway.toml 先 build）────
const distDir = path.resolve(__dirname, '..', 'dist')
app.use(express.static(distDir))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') return next()
  res.sendFile(path.join(distDir, 'index.html'))
})

// ─── 立即启动主服务（/health 和前端静态文件立即可用）────
const server = app.listen(PORT, () => {
  console.log(`[MusicNest] 服务已启动: http://localhost:${PORT}`)
})

// ─── 后台异步启动网易云 API，就绪后挂载 /api 代理 ──
async function initNcm() {
  const { createProxyMiddleware } = require('http-proxy-middleware')
  const { serveNcmApi } = require('NeteaseCloudMusicApi/server')

  await serveNcmApi({ port: NCM_PORT })
  console.log(`[MusicNest] 网易云 API 已就绪 (ncm@${NCM_PORT})`)

  // 挂载代理：/api/search → http://127.0.0.1:NCM_PORT/search
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://127.0.0.1:${NCM_PORT}`,
      changeOrigin: true,
      pathRewrite: { '^/api': '' }
    })
  )
  console.log('[MusicNest] /api 代理已挂载')
}

initNcm().catch((e) => {
  console.error('[MusicNest] 网易云 API 启动失败:', e)
  // 不退出进程：/health + 前端仍然可用，API 返回空数据走演示模式
})
