import r from '../utils/request'
import router from '../router'
// import store from '../store'
// import { ACCESS_TOKEN } from '../store/mutation-types'
// import storage from '../utils/storage'
import { ElNotification } from 'element-plus'
// 需要特殊处理的请求地址

// 解决js相互引用导致，js加载顺序混乱：先加载其他js文件，后加载config.js，出现apiBaseUrl未定义，引发问题


async function request (url, options = {}) {
  const { code, data, msg } = await r({
    url,
    ...options
  })
  
  if (code === '0') {
    return {code, data, msg}
  } else {
    if(msg === '空指针异常：[null]' && url === '/api/login/sysLogin'){
        ElNotification({
            title: '错误码：'+code,
            type: 'error',
            message: '用户名不存在'
          })
    }else{
        ElNotification({
            title: '错误码：'+code,
            type: 'error',
            message: msg
          })
    }
    
    // 登录过期，返回登录页
    if (code === '100' || code === '110') {
    //   store.dispatch('Logout')
      router.replace('/login')
    }
    // 首次登录，需要修改密码
    // if (code === '140') {
    //   storage.set(ACCESS_TOKEN, data.token)
    //   router.replace('/upms/updatePwd')
    // }
    return Promise.reject(msg)
  }
}



export {
  request
}
