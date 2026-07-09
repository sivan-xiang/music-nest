import { createApp } from 'vue'
import App from './App.vue'
import './store/theme.js' // 副作用：应用已保存的主题，避免首屏闪烁
import './styles/global.css'

createApp(App).mount('#app')
