import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import '@geoscene/core/assets/geoscene/themes/light/main.css';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import {vectorBasemap, imageBasemap} from './config/baseMap.js'

const app = createApp(App)
app.use(router);
app.use(ElementPlus)
app.config.globalProperties.$vectorBasemap = vectorBasemap
app.config.globalProperties.$imageBasemap = imageBasemap

app.mount('#app')
