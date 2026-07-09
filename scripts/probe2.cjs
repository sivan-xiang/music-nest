const http = require('http')
function get(u){return new Promise((res,rej)=>{http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>{try{res(JSON.parse(b))}catch(e){rej(new Error('parse '+b.slice(0,120)))}})}).on('error',rej)})}
;(async()=>{
  const s = await get('http://localhost:5173/api/search?keywords=%E5%88%98%E5%BE%B7%E5%8D%8E&type=1&limit=3')
  const songs = s.result.songs
  for (const song of songs) {
    const id = song.id
    const d = await get('http://localhost:5173/api/song/detail?ids=' + id)
    const det = d.songs && d.songs[0]
    const a = det ? (det.album || det.al) : null
    const artistPic = (song.album && song.album.artist && song.album.artist.img1v1Url)
      || (song.artists && song.artists[0] && song.artists[0].img1v1Url)
    console.log('id', id, '| name', song.name)
    console.log('   detail picUrl :', a && a.picUrl)
    console.log('   search hasPic :', !!(song.album && song.album.picUrl))
    console.log('   artist img1v1 :', artistPic)
  }
  console.log('--- raw /song/detail?ids=21349 ---')
  const raw = await get('http://localhost:5173/api/song/detail?ids=21349')
  console.log(JSON.stringify(raw).slice(0, 200))
})().catch(e=>console.log('ERR', e.message))
