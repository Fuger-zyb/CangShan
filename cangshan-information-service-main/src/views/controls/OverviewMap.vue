<template>
    <div class="container" style="height: 100%; width: 100%;">
        <div id="viewDiv"></div>
        <div id="overviewDiv">
            <div id="extentDiv"></div>
        </div>
    </div>
</template>

<script setup>
import { onMounted,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from '@geoscene/core/views/MapView'
import SceneView from "@geoscene/core/views/SceneView.js";
import Graphic from "@geoscene/core/Graphic";
import * as promiseUtils from "@geoscene/core/core/promiseUtils.js";
import * as reactiveUtils from "@geoscene/core/core/reactiveUtils.js";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
onMounted(() => {
    const mainMap = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
    });

    const overviewMap = new Map({
    //   basemap: "tianditu-image", // 底图图层服务
      basemap:globalImageBasemap
    });

    const mainView = new SceneView({
        container: "viewDiv",
        map: mainMap,
        center: [119.32, 26.02],
        zoom: 13,
    });

    // Create the MapView for overview map
    const mapView = new MapView({
        container: "overviewDiv",
        map: overviewMap,
        constraints: {
            rotationEnabled: false
        }
    });

    console.log("mainView.ui.getComponents()", mainView.ui.getComponents())
    mapView.ui.components = [];

    mapView.when(() => {
        mainView.when(() => {
            setup();
        });
    });

    const extentDebouncer = promiseUtils.debounce(async () => {
        if (mainView.stationary) {
            await mapView.goTo({
                center: mainView.center,
                scale:
                    mainView.scale *
                    2 *
                    Math.max(
                        mainView.width / mapView.width,
                        mainView.height / mapView.height
                    )
            });
        }
    });

    function setup() {
        const extent3Dgraphic = new Graphic({
            geometry: null,
            symbol: {
                type: "simple-fill",
                color: [0, 0, 0, 0.5],
                outline: null
            }
        });
        mapView.graphics.add(extent3Dgraphic);

        reactiveUtils.watch(
            () => mainView.extent,
            (extent) => {
                // Sync the overview map location
                // whenever the 3d view is stationary
                extentDebouncer().then(() => {
                    extent3Dgraphic.geometry = extent;
                });
            },
            {
                initial: true
            }
        );
    }
})
</script>


<style scoped>
.container {
    position: relative;
}
#viewDiv {
    width: 100%;
    height: 100%;
}

#overviewDiv {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 300px;
    height: 200px;
    border: 1px solid black;
    z-index: 1;
    overflow: hidden;
}

#extentDiv {
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    z-index: 2;
}
</style>