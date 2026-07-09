import { reactive } from 'vue'

// 跨组件实例缓存：视图用 v-if/v-else-if 渲染，切换页面时组件会被卸载再挂载，
// 若把数据只存在组件本地 ref 里，每次进入都会重新取数并闪 loading/清空。
// 这里把已取回的数据放在模块级 reactive，进入页面先展示旧数据，
// 新数据返回后再覆盖，实现「进入不闪、回来不空」。

export const discoverCache = reactive({
  banners: [],
  playlists: [],
  newSongs: [],
  demo: false,
  loaded: false
})

export const searchCache = reactive({
  hots: [],
  keyword: '',
  songs: [],
  playlists: [],
  demo: false,
  searched: false,
  loaded: false
})

// 歌单详情按 id 缓存（不同歌单要分别保留）
export const playlistCache = reactive({
  map: {}
})
