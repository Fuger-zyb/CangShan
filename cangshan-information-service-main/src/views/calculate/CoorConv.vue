<template>
    <div style="height: 100%; width: 100%;">
        <div id="map-container"></div>
    </div>
</template>

<script setup>
import { onMounted,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from '@geoscene/core/views/MapView'
import Graphic from "@geoscene/core/Graphic";
import SimpleFillSymbol from "@geoscene/core/symbols/SimpleFillSymbol";
import * as projection from "@geoscene/core/geometry/projection";
import SpatialReference from "@geoscene/core/geometry/SpatialReference";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
onMounted(() => {
    const map = new Map({
    //   basemap: "tianditu-image", // 底图图层服务
      basemap:globalVectorBasemap
    });

    const view = new MapView({
        map: map,
        center: [119.32, 26.02],
        zoom: 13,
        container: "map-container"
    });

    const rings = [
        [
            [13284686.33196003, 3000698.323468965],
            [13282890.061795332, 3001233.382666961],
            [13284437.911618104, 3003258.963916515],
            [13286807.459494941, 3001863.9881503126],
            [13284686.33196003, 3000698.323468965]
        ]
    ];
    const polygon = {
        type: "polygon",
        rings: rings,
        spatialReference: { wkid: 3857 } // 墨卡托投影
    };
    const graphic = new Graphic({
        geometry: polygon,
        symbol: new SimpleFillSymbol({
            color: [255, 0, 0],
            size: 12,
            outline: {
                color: [255, 255, 255],
                width: 2,
            },
        }),
    });

    // 添加 Graphic 到地图
    view.graphics.add(graphic);

    
    let outSpatialReference = new SpatialReference({
        wkid: 4326 //WGS84
    });
    graphic.geometry = projection.project(graphic.geometry, outSpatialReference);
    console.log("转换后", graphic.geometry)
})








</script>


<style scoped>
#map-container {
    width: 100%;
    height: 100%;
}
</style>
