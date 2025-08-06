<template>
    <div style="height: 100%; width: 100%;">
        <div id="map-container"></div>
    </div>
</template>

<script setup>
import { onMounted,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from '@geoscene/core/views/MapView'
import GraphicsLayer from "@geoscene/core/layers/GraphicsLayer";
import Point from "@geoscene/core/geometry/Point";
import Graphic from "@geoscene/core/Graphic";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

const graphicsLayer = new GraphicsLayer();
let view
onMounted(() => {

    const map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
    });

    view = new MapView({
        map: map,
        center: [119.32, 26.02],
        zoom: 13,
        container: "map-container"
    });
    map.add(graphicsLayer)
    loadJsonFromUrl("http://218.85.80.179:3690/data/cangshan/louyu.json");

});

const addPointsFromJson = (jsonData) => {
    jsonData.features.forEach((feature) => {
        const point = new Point({
            x: feature.geometry.x,
            y: feature.geometry.y,
            spatialReference: { wkid: 4326 }, // WGS84 坐标系
        });

        const graphic = new Graphic({
            geometry: point,
            symbol: {
                type: "simple-marker",
                color: [255, 0, 0, 0.8],
                size: 12,
                outline: {
                    color: [255, 255, 255],
                    width: 2,
                },
            },
            attributes: feature.attributes, // 绑定属性
            popupTemplate: {
                title: "{楼宇名称}", // 弹出窗口标题
                content: "地址：{楼宇地址}", // 弹出窗口内容
            },
        });
        graphicsLayer.add(graphic);
    });
};

const loadJsonFromUrl = async (url) => {
    try {
        const response = await fetch(url);
        const jsonData = await response.json();
        addPointsFromJson(jsonData);

        // 确保地图加载完成后,将视角转到graphicsLayer中所有点位的范围
        view.when(() => {
            view.goTo({
                target: graphicsLayer.graphics
            });
        });
    } catch (error) {
        console.error("加载 JSON 数据失败:", error);
    }
};
</script>


<style scoped>
#map-container {
    width: 100%;
    height: 100%;
}
</style>