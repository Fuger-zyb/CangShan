<template>
    <div>
        <input v-model="vecMapLayerUrl" placeholder="矢量底图图层URL" />
        <input v-model="vecAnnoLayerUrl" placeholder="矢量注记图层URL" />
        <input v-model="imgMapLayerUrl" placeholder="影像底图图层URL" />
        <input v-model="imgAnnoLayerUrl" placeholder="影像注记图层URL" />
        <input v-model="tokenkUrl" placeholder="拦截器匹配Url" />
        <input v-model="tokenPrefix" placeholder="token头前缀" />
        <input v-model="token" placeholder="token头" />
        <button @click="addBasemap">1、添加底图</button>
        <button @click="addTokenConfig">2、添加请求头</button>

    </div>
    <div>
        <input v-model="baimoUrl" placeholder="白膜URL" />
        <button @click="addBaimo('1')">3、添加白膜Json</button>
        <button @click="addBaimo('2')">3、添加白膜SceneLayer</button>
        <button @click="addMap('1')">4、添加地图矢量</button>
        <button @click="addMap('2')">4、添加地图影像</button>
    </div>
    <div style="height: 100%; width: 100%;">
        <div ref="mapView" class="map-container"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick,getCurrentInstance } from 'vue';
import TileLayer from '@geoscene/core/layers/TileLayer';
import Basemap from "@geoscene/core/Basemap.js";
import Map from "@geoscene/core/Map";
import SceneView from "@geoscene/core/views/SceneView.js";
import IntegratedMesh3DTilesLayer from "@geoscene/core/layers/IntegratedMesh3DTilesLayer.js";
import config from '@geoscene/core/config';
import IntegratedMeshLayer from "@geoscene/core/layers/IntegratedMeshLayer.js";
import ElevationLayer from "@geoscene/core/layers/ElevationLayer.js";
import SceneLayer from "@geoscene/core/layers/SceneLayer.js";
import Ground from "@geoscene/core/Ground";
import Layer from "@geoscene/core/layers/Layer.js";
import SpatialReference from "@geoscene/core/geometry/SpatialReference";

const mapView = ref(null);
const vecMapLayerUrl = ref('');
const vecAnnoLayerUrl = ref('');
let vectorBasemap= null
const imgMapLayerUrl = ref('');
const imgAnnoLayerUrl = ref('');
let imageBasemap = null
const baimoUrl = ref('');
let baimoLayer= null
const tokenkUrl = ref('');
const token = ref('');
const tokenPrefix = ref('access_token');

function addTokenConfig() {
    config.request.interceptors.push({
        urls: tokenkUrl.value,
        before: function (params) {
             params.requestOptions.query = { 
                ...params.requestOptions.query,
                [tokenPrefix.value]: token.value,
            };
        }
    })
}
function addBasemap() {
    // 矢量底图
    const vecMapLayer = new TileLayer({
        url: vecMapLayerUrl.value,
        id: 'vec_map_layer',
    });
    // 矢量底图注记
    const vecAnnoLayer = new TileLayer({
        url: vecAnnoLayerUrl.value,
        id: 'vec_anno_layer',
    });

    // 矢量base 
    vectorBasemap = new Basemap({
        baseLayers: [vecMapLayer, vecAnnoLayer],
        title: '矢量电子地图',
        id: 'vector_basemap',
    });


   //福州影像
    const imgMapLayer = new TileLayer({
        url: imgMapLayerUrl.value,
        id: 'img_map_layer',
    });
    //影像注记
    const imgAnnoLayer = new TileLayer({
        url: imgAnnoLayerUrl.value,
        id: 'img_anno_layer',
    });

    // 影像base
    imageBasemap = new Basemap({
        baseLayers: [imgMapLayer, imgAnnoLayer],
        title: '影像电子地图',
        id: 'image_basemap',
    });
}
function addBaimo(type) {
    if(type === '1'){
        baimoLayer = new IntegratedMesh3DTilesLayer({
                url: baimoUrl.value,
                id: 'baimo_layer',
            });
    }else if(type === '2'){
        baimoLayer = new SceneLayer({
                url: baimoUrl.value,
                id: 'baimo_layer',
        });
    }
    
}
function addMap(type) {
    const map = new Map({
        basemap: type === '1'?vectorBasemap:imageBasemap, // 底图
        layers: [baimoLayer] // 添加三维模型
    });
    const view = new SceneView({
        container: mapView.value,
        map: map,
        camera: {
            position: {
                x: 119.24710768082393,
                y: 25.803507590235707,
                z: 10425.959744638763,
              },
              heading: 17.177181065500992,
              tilt: 68.53908340770785
            }
    });
}

</script>

<style>
.map-container {
    height: 100%;
    width: 100%;
}
</style>