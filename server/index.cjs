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
const os = require('os')

const NCM_PORT = Number(process.env.NCM_PORT) || 4000
const PORT = Number(process.env.PORT) || 3000
// 登录态 cookie（NetEase MUSIC_U 等），通过 Railway 环境变量注入；
// 仅用于后端代理网易云 API，绝不出现在前端代码中，不对外暴露。
const NCM_COOKIE = process.env.NCM_COOKIE || ''

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
  // NeteaseCloudMusicApi 在加载时会同步读取 anonymous_token，
  // 容器里该文件不存在会直接崩溃；先确保它存在（空文件即可走匿名模式）。
  // 用 os.tmpdir() 兼容 Linux(/tmp) 与 Windows，避免硬编码 /tmp 在 Windows 上找不到目录。
  const anonToken = path.join(os.tmpdir(), 'anonymous_token')
  try {
    fs.accessSync(anonToken)
  } catch {
    fs.writeFileSync(anonToken, '')
  }

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
      pathRewrite: { '^/api': '' },
      // 把登录态 cookie 注入到转发给 NCM 的请求头，
      // 否则 /song/url/v1 等接口对大多数歌曲返回 url:null。
      // 注意：NCM 的 cookieToJson 只认 "key=value" 格式，
      // 用户提供的 MUSIC_U 是裸值，必须补 "MUSIC_U=" 前缀才生效。
      onProxyReq(proxyReq, req) {
        if (NCM_COOKIE) {
          const cookieVal = /MUSIC_U=/.test(NCM_COOKIE)
            ? NCM_COOKIE
            : `MUSIC_U=${NCM_COOKIE}`
          proxyReq.setHeader('Cookie', cookieVal)
        }
      }
    })
  )
  console.log('[MusicNest] /api 代理已挂载' + (NCM_COOKIE ? ' (已注入 NCM_COOKIE)' : ' (未配置 NCM_COOKIE)'))
}

initNcm().catch((e) => {
  console.error('[MusicNest] 网易云 API 启动失败:', e)
  // 不退出进程：/health + 前端仍然可用，API 返回空数据走演示模式
})
