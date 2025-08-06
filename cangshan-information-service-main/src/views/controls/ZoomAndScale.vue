<template>
    <div style="height: 100%; width: 100%;">
        <div id="map-container"></div>
    </div>

    <el-card class="button-card">
        <el-button class="button" @click="moveZoom">移动默认zoom</el-button>
        <el-button class="button" @click="addZoom">新增zoom</el-button>
        <el-button class="button" @click="removeZoom">移除默认zoom</el-button>
        <el-button class="button" @click="addScale">新增Scale</el-button>
        <el-button class="button" @click="removeScale">移除ScaleBar</el-button>
    </el-card>
</template>

<script setup>
import { onMounted,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from '@geoscene/core/views/MapView'
import Zoom from "@geoscene/core/widgets/Zoom.js";
import ScaleBar from "@geoscene/core/widgets/ScaleBar.js";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

let view = null
onMounted(() => {
    const map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
    });

    view = new MapView({
        map: map,
        center: [119.32, 26.02],
        zoom: 12,
        container: "map-container"
    });

})
const moveZoom = () => {
    view.ui.move("zoom", "bottom-left");

    view.ui.move("zoom", "bottom-left");
}

let zoom = null
const addZoom = () => {
    if (zoom === null) {
        zoom = new Zoom({
            view: view
        });

        view.ui.add(zoom, {
            position: "top-right"
        });
    }
}

const removeZoom = () => {
    view.ui.remove("zoom");
}

let scaleBar = null
const addScale = () => {
    if (scaleBar === null) {
        scaleBar = new ScaleBar({
        view: view
    });
    // Add widget to the bottom left corner of the view
    view.ui.add(scaleBar, {
        position: "bottom-right"
    });
    }
}

const removeScale = () => {
    view.ui.remove(scaleBar);
    scaleBar = null
}
</script>


<style scoped>
#map-container {
    width: 100%;
    height: 100%;
}

.button-card {
    position: absolute;
    top: 80px;
    right: 80px;
    z-index: 1000;
    width: 200px;
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.button {
    margin: 10px 0;
    width: 150px;

}
</style>