const https = require('https')
const http = require('http')

function fetchUrl(url, referer) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http
    const headers = { 'User-Agent': 'Mozilla/5.0' }
    if (referer) headers['Referer'] = referer
    const req = lib.get(url, { headers, timeout: 8000 }, (res) => {
      resolve({ status: res.statusCode, ct: res.headers['content-type'] })
      res.resume()
    })
    req.on('error', (e) => resolve({ error: e.message }))
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }) })
  })
}

http.get('http://localhost:5173/api/search?keywords=%E5%91%A8%E6%9D%B0%E4%BC%A6&type=1&limit=3', (res) => {
  let body = ''
  res.on('data', (d) => (body += d))
  res.on('end', async () => {
    let data
    try { data = JSON.parse(body) } catch { console.log('JSON parse fail, raw len', body.length); return }
    const songs = data?.result?.songs || []
    console.log('songs count:', songs.length)
    for (const s of songs) {
      const al = s.album || s.al || {}
      const pic = al.picUrl || al.pic
      console.log('PIC:', pic)
      if (pic) {
        console.log('  no-referrer :', JSON.stringify(await fetchUrl(pic)))
        console.log('  wk referer  :', JSON.stringify(await fetchUrl(pic, 'http://localhost:5173/')))
      }
    }
    // 也测歌单封面
    http.get('http://localhost:5173/api/search?keywords=%E6%8E%A8%E8%8D%90&type=1000&limit=2', (r2) => {
      let b2 = ''
      r2.on('data', (d) => (b2 += d))
      r2.on('end', async () => {
        const d2 = JSON.parse(b2)
        const pls = d2?.result?.playlists || []
        console.log('playlists count:', pls.length)
        for (const p of pls.slice(0, 2)) {
          const pic = p.coverImgUrl || p.picUrl
          console.log('PLCOVER:', pic)
          if (pic) {
            console.log('  no-referrer :', JSON.stringify(await fetchUrl(pic)))
            console.log('  wk referer  :', JSON.stringify(await fetchUrl(pic, 'http://localhost:5173/')))
          }
        }
      })
    })
  })
})
