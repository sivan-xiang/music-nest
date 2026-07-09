const http = require('http')
const https = require('https')
function get(u){return new Promise((res,rej)=>{http.get(u,r=>{let b='';r.on('data',d=>b+=d);r.on('end',()=>res(JSON.parse(b)))}).on('error',rej)})}
function headHttps(u){return new Promise((res)=>{const req=https.request(u,{method:'HEAD'},r=>{res(r.statusCode);r.resume()});req.on('error',e=>res('ERR:'+e.message));req.setTimeout(8000,()=>{req.destroy();res('TIMEOUT')});req.end()})}
;(async()=>{
  const s=await get('http://localhost:5173/api/search?keywords=%E5%88%98%E5%BE%B7%E5%8D%8E&type=1&limit=6')
  const songs=s.result.songs
  const ids=songs.map(x=>x.id)
  const d=await get('http://localhost:5173/api/song/detail?ids='+ids.join(','))
  const map={}
  ;(d.songs||[]).forEach(x=>{const al=x.album||x.al; if(al&&al.picUrl) map[x.id]=al.picUrl})
  let ok=0
  for(const x of songs){
    const cover=map[x.id]
    if(cover){ok++; console.log('✓', x.id, x.name, '->', cover.slice(0,46))}
    else {
      const fb=(x.album&&x.album.artist&&x.album.artist.img1v1Url)||(x.artists&&x.artists[0]&&x.artists[0].img1v1Url)
      console.log('~', x.id, x.name, '-> fallback artist:', fb? fb.slice(0,46):'NONE')
    }
  }
  console.log('with cover:', ok+'/'+songs.length)
  const sample = map[ids[0]] || ''
  if(sample.startsWith('https')){
    console.log('https cover status:', await headHttps(sample))
  }
})().catch(e=>console.log('ERR',e.message))
