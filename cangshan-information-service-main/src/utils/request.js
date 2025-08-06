import axios from 'axios'
// import store from '../store'
// import storage from '../utils/storage'
import { VueAxios } from './axios'
// import { ACCESS_TOKEN } from '../store/mutation-types'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  // baseURL: process.env.VUE_APP_API_BASE_URL, // 一个应用可能有许多模块，基础路径不尽相同，不在统一请求工具进行设置
  timeout: 40000 // 请求超时时间
})

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    // 从 localstorage 获取 token
    // const token = storage.get(ACCESS_TOKEN)
    if (error.response.status === 403) {
      console.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
        console.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
    //   if (token) {
    //     store.dispatch('Logout').then(() => {
    //       setTimeout(() => {
    //         window.location.reload()
    //       }, 1500)
    //     })
    //   }
    }
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(config => {
  const { url } = config
//   const token = storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
//   if (token) {
    // config.headers['Access-Token'] = token
    // config.headers['Authorization'] = `token=${token}`
//   }

 
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  return response.data
}, errorHandler)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}
