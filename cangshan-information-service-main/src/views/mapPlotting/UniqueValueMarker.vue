<template>
    <div style="height: 100%; width: 100%;">
        <div id="map-container"></div>
    </div>
</template>

<script setup>
import { onMounted,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from '@geoscene/core/views/MapView'
import Point from "@geoscene/core/geometry/Point";
import Graphic from "@geoscene/core/Graphic";
import FeatureLayer from "@geoscene/core/layers/FeatureLayer";
import LabelClass from "@geoscene/core/layers/support/LabelClass.js";
import PictureMarkerSymbol from "@geoscene/core/symbols/PictureMarkerSymbol.js";
import UniqueValueRenderer from "@geoscene/core/renderers/UniqueValueRenderer.js";
let view
let map
let featureLayer
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
onMounted(() => {
    map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
    });

    view = new MapView({
        map: map,
        center: [119.32, 26.02],
        zoom: 13,
        container: "map-container"
    });

    loadJsonFromUrl("http://218.85.80.179:3690/data/cangshan/louyu.json");
})


const addPointsFromJson = (jsonData) => {
    const graphics = []
    jsonData.features.forEach((feature) => {
        const point = new Point({
            x: feature.geometry.x,
            y: feature.geometry.y,
            spatialReference: { wkid: 4326 }, // WGS84 坐标系
        });

        const graphic = new Graphic({
            geometry: point,
            attributes: feature.attributes, // 绑定属性

        });
        graphics.push(graphic);
    });

    console.log("graphic", graphics)
    return graphics
};

const loadJsonFromUrl = async (url) => {
    try {
        const response = await fetch(url);
        const jsonData = await response.json();
        const graphics = addPointsFromJson(jsonData);
        const uniqueValueRenderer = new UniqueValueRenderer({
            field: "楼宇名称", // 替换为你的分类字段名称
            defaultSymbol: new PictureMarkerSymbol({
                url: '/csfq/public/building.svg',
                width: 30,
                height: 30
            }),
            uniqueValueInfos: [

                {
                    value: "鳌峰广场2号楼",
                    symbol: {
                        type: "picture-marker",
                        url: "/csfq/public/building.svg",
                        width: 60,
                        height: 60
                    }
                },
                {
                    value: "鳌峰广场1号楼",
                    symbol: {
                        type: "picture-marker",
                        url: "/csfq/public/building.svg",
                        width: 60,
                        height: 60
                    }
                },

            ]
        });
        featureLayer = new FeatureLayer({
            source: graphics,
            objectIdField: "OBJECTID",
            fields: [
                {
                    name: "OBJECTID",
                    alias: "Object ID",
                    type: "oid"
                },
                {
                    name: "楼宇名称",
                    alias: "楼宇名称",
                    type: "string"
                },
                {
                    name: "楼宇地址",
                    alias: "楼宇地址",
                    type: "string"
                }
            ],
            geometryType: "point",        // 明确几何类型
            spatialReference: { wkid: 4326 },

            popupTemplate: {
                title: "{楼宇名称}", // 弹出窗口标题
                content: "地址：{楼宇地址}", // 弹出窗口内容
            },
        });
        featureLayer.renderer = uniqueValueRenderer
        map.add(featureLayer);

        const labelClass = new LabelClass({
            labelExpressionInfo: { expression: "$feature.楼宇名称" },
            symbol: {
                type: "text",
                color: "black",
                haloSize: 1,
                haloColor: "white"
            },
            labelPlacement: "above-center",
        });

        featureLayer.labelingInfo = [labelClass];

        // 可选：缩放到数据范围
        view.whenLayerView(featureLayer).then(() => {
            view.goTo(featureLayer.fullExtent);
        });

    } catch (error) {
        console.error("数据加载失败:", error);
    }
};

</script>


<style scoped>
#map-container {
    width: 100%;
    height: 100%;
}
</style>