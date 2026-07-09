/* Vercel serverless 模式入口
 * NeteaseCloudMusicApi 内部会 app.listen()，但在 serverless 环境下
 * listen 失败不影响 express 的 request handler，Vercel 会把请求转发到这里，
 * 我们缓存 app 实例并直接 (req, res) 处理。 */
const { serveNcmApi } = require('NeteaseCloudMusicApi/server')

let cached = null

module.exports = async (req, res) => {
  if (!cached) {
    cached = await serveNcmApi({ port: Number(process.env.PORT) || 3000 })
  }
  return cached(req, res)
}
