<template>
  <div style="width: 100%; height: 100%;">
    <!-- 地图容器 -->
    <div id="map-container" ref="mapContainer">
      <div class="measurement-toolbars" id="measurement-toolbars">

        <div class="tool" :class="{ 'active-tool': measurementTool === 'distance' }" @click="switchTool('distance')">
          <calcite-icon icon="measure" scale="s" />
        </div>
        <div class="tool" :class="{ 'active-tool': measurementTool === 'area' }" @click="switchTool('area')">
          <calcite-icon icon="measure-area" scale="s" />
        </div>
        <div class="tool" @click="clearMeasurement()">
          <calcite-icon icon="trash" scale="s" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted,getCurrentInstance } from 'vue';
import Map from '@geoscene/core/Map';
import MapView from '@geoscene/core/views/MapView';
import Measurement from '@geoscene/core/widgets/Measurement';
import "@esri/calcite-components/dist/components/calcite-icon";
// 地图和视图实例
const mapContainer = ref(null);
let measurementWidget = null;
let measurementTool = ref(null)
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
// 初始化地图
onMounted(() => {
  // 创建地图实例
  const map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
  });

  // 创建视图
  const view = new MapView({
    container: mapContainer.value, // 地图容器
    map: map,
    center: [119.32, 26.02],
    zoom: 13, // 缩放级别
  });

  // 初始化测量微件
  measurementWidget = new Measurement({
    view: view,
    activeTool: null, // 默认不激活任何工具,
  });

  // 将测量微件添加到地图视图中
  // view.ui.add(measurementWidget, 'top-right');

});


// 清除测量结果
const clearMeasurement = () => {

  if (measurementWidget) {
    measurementWidget.clear(); // 清除测量结果
    measurementTool.value = null
  }
};

const switchTool = (tool) => {
  // clearMeasurement()
  //  const tool = measurement.activeTool === "distance" ? "area" : "distance";
  
  if (measurementWidget) {
    if (measurementTool.value === tool) {
      clearMeasurement()

    } else {
      clearMeasurement()
      measurementWidget.activeTool = tool; // 设置激活的工具
      measurementTool.value = tool
    }
    
  }

}

</script>

<style scoped>
#map-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.collapseIconClass {
  color: red;
  background-color: blue;
}

.measurement-toolbars {
  display: flex;
  position: absolute;
  top: 20px;
  right: 20px;
}

.tool {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #fff;
  cursor: pointer;
}

.tool:hover {
  background-color: rgb(212, 208, 208);
}

.active-tool {
  background-color: rgb(212, 208, 208);
}
</style>