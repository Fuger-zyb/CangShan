import { request } from './config'

const baseURL = '/afjd-service'

export async function getBaseMap() { //获取底图
    return request(`${baseURL}/api/map/getBaseMap`, {
        method: 'get'
    })
}


export function getAvailableData() {  //获取可用数据源
    return request(`${baseURL}/api/map/getAvailableData`, {
        method: 'get'
    })
}

export function getSceneData() {  //获取场景
    return request(`${baseURL}/api/map/getSceneData`, {
        method: 'get'
    })
}


export async function saveSceneData(data) {   //保存场景
    return request(`${baseURL}/api/map/saveScene`, {
        method: 'post',
        data
    })
}

export async function delScene(params) {   //删除场景
    return request(`${baseURL}/api/map/delScene`, {
        method: 'get',
        params
    })
}

export async function getScene(params) {   //删除场景
    return request(`${baseURL}/api/map/getScene`, {
        method: 'get',
        params
    })
}

export async function getGlbData(params) {   //获取模型
    return request(`${baseURL}/api/map/getGlbData`, {
        method: 'get',
        params
    })
}