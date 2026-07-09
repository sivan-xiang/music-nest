const http = require('http')
function get(url){return new Promise((res,rej)=>{http.get(url,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{res(JSON.parse(b))}catch(e){rej(e)}})}).on('error',rej)})}
;(async()=>{
  const s = await get('http://localhost:5173/api/search?keywords=%E5%91%A8%E6%9D%B0%E4%BC%A6&type=1&limit=1')
  const song = s.result.songs[0]
  console.log('SEARCH song keys:', Object.keys(song))
  console.log('SEARCH song.album:', JSON.stringify(song.album))
  console.log('SEARCH song.al:', JSON.stringify(song.al))

  const n = await get('http://localhost:5173/api/personalized/newsong?limit=1')
  const ns = (n.result && n.result[0] && (n.result[0].song || n.result[0])) || {}
  console.log('NEWSONG album:', JSON.stringify(ns.album || ns.al))
  console.log('NEWSONG keys:', Object.keys(ns))

  const ps = await get('http://localhost:5173/api/search?keywords=%E6%8E%A8%E8%8D%90&type=1000&limit=1')
  const pid = ps.result.playlists[0].id
  const p = await get('http://localhost:5173/api/playlist/detail?id=' + pid)
  const tr = p.playlist.tracks[0]
  console.log('PLAYLIST track.album:', JSON.stringify(tr.album || tr.al))
})().catch(e=>console.log('ERR', e.message))
