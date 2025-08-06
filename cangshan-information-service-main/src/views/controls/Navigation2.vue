<template>
    <div style="height: 100%; width: 100%;">
        <div id="map-container"></div>
    </div>

    <el-card class="button-card">
        <el-button class="button" @click="addNavigation">新增navigation</el-button>
        <el-button class="button" @click="removeNavigation">移除navigation</el-button>
    </el-card>
</template>

<script setup>
import { onMounted,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import SceneView from "@geoscene/core/views/SceneView.js";
import NavigationToggle from "@geoscene/core/widgets/NavigationToggle";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
let view = null
onMounted(() => {
    const map = new Map({
    //   basemap: "tianditu-image", // 底图图层服务
      basemap:globalVectorBasemap
    });

    view = new SceneView({
        map: map,
        center: [119.32, 26.02],
        zoom: 12,
        container: "map-container"
    });
    view.ui.empty("top-left");
})

let navigation = null
const addNavigation = () => {
    if (navigation === null) {
        navigation = new NavigationToggle({
            view: view,
            id: "myNavigation"
        });

        view.ui.add(navigation, {
            position: "top-right"
        });
    }
}

const removeNavigation = () => {
    view.ui.remove("myNavigation");
    navigation = null
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