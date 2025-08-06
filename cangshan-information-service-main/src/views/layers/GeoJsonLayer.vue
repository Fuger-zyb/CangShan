<template>
    <div style="height: 100%; width: 100%;">
        <div id="map-container"></div>
    </div>
</template>

<script setup>
import { onMounted,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from '@geoscene/core/views/MapView'
import GeoJSONLayer from "@geoscene/core/layers/GeoJSONLayer.js";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

onMounted(() => {
    const map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
    });

    const view = new MapView({
        map: map,
        center: [119.29011391153638, 26.085134828708952],
        zoom: 17,
        container: "map-container"
    });

    const geojsonData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [119.29011391153638, 26.085134828708952]
      },
      properties: {
        name: "北京市"
      }
    }
  ]
};


    const geoJSONLayer = new GeoJSONLayer({
        url: "http://218.85.80.179:3690/data/cangshan/building84.geojson",
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-fill", // 使用简单填充符号
                color: [255, 0, 0, 0.5], // 设置为红色，半透明
                outline: {
                    color: [255, 0, 0, 1], // 设置边框为红色，不透明
                    width: 1 // 边框宽度
                }
            }
        }
    });
    map.add(geoJSONLayer);  // adds the layer to the map
});


</script>


<style scoped>
#map-container {
    width: 100%;
    height: 100%;
}
</style>