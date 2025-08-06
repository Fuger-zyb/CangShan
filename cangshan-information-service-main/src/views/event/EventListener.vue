<template>
    <div style="height: 100%; width: 100%;">
        <!-- 地图容器 -->
        <div id="map-container" ref="mapContainer"></div>
    </div>

</template>

<script setup>
import { onMounted, ref,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from "@geoscene/core/views/MapView";
import { ElMessage } from 'element-plus'
import Basemap from "@geoscene/core/Basemap.js";
import TileLayer from '@geoscene/core/layers/TileLayer';
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
const mapContainer = ref(null);

onMounted(() => {
    const vecMapLayer = new TileLayer({
        url: 'http://cim.efzcity.com:9653/tcloud/rest/services/BaseVector_CGCS2000/MapServer',
        id: 'vec_map_layer',
    });

    const vecAnnoLayer = new TileLayer({
        url: 'http://cim.efzcity.com:9653/tcloud/rest/services/VectorAnnotation_CGCS2000/MapServer',
        id: 'vec_anno_layer',
    });
    const vectorBasemap = new Basemap({
        baseLayers: [vecMapLayer, vecAnnoLayer],
        title: '矢量电子地图',
        id: 'vector_basemap',
    });
    // 创建地图实例
    const map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
    });

    // 创建视图
    const view = new MapView({
        container: mapContainer.value, // 引用 HTML 中的视图 div
        map: map,
        center: [119.2828, 26.0261], // 设置地图中心坐标
        zoom: 13 // 设置地图缩放级别
    });
    vectorBasemap.load()
        .catch(function (error) {
            // Ignore any failed resources
        })
        .then(function () {
            ElMessage({
                message: '地图加载完成',
                type: 'success'
            })
        });

    // 监听地图加载完成事件
    view.on("blur", () => {
        console.log("浏览器焦点从视图中移开");
    });

    // 监听地图拖拽事件
    view.on("drag", () => {
        ElMessage('地图被拖拽')
    });

    view.on("click", (e) => {
        ElMessage({
            message: '纬度' + e.mapPoint.latitude.toFixed(4) + '经度' + e.mapPoint.longitude.toFixed(4) + "被点击",
            type: 'success'
        })

    });

    // 监听地图缩放事件
    view.on("mouse-wheel", (e) => {
        ElMessage({
            message: e.deltaY > 0 ? '地图缩小' : '地图放大',
            type: 'warning'
        })
    });
});
</script>

<style scoped>
#map-container {
    width: 100%;
    height: 100%;
}
</style>