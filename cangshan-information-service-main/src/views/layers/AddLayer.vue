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
import FeatureLayer from "@geoscene/core/layers/FeatureLayer";
import MapImageLayer from '@geoscene/core/layers/MapImageLayer';
import LayerList from "@geoscene/core/widgets/LayerList.js";

const mapContainer = ref(null);
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

onMounted(() => {
  // 创建地图实例
  const map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
  });

  // 创建视图
  const view = new MapView({
    container: mapContainer.value,
    map: map,
    center: [119.32, 26.02],
    zoom: 13
  });

  // 加载 MapServer 服务
  const featureLayer = new MapImageLayer({
    url: 'http://218.85.80.179:6080/arcgis/rest/services/csskpt/grid_cangshan/MapServer',
    title: '网格',
  });

  // 将图层添加到地图
  map.add(featureLayer);

  const poi = new FeatureLayer({
    url: 'http://218.85.80.179:6080/arcgis/rest/services/csskpt/poi_cangshan/MapServer/0', // 指定图层索引
    title: 'POI',
    outFields: ["*"], // 确保加载所有字段
    popupEnabled: true, // 启用弹出窗口
    popupTemplate: {
      title: "要素信息", // 弹出窗口标题
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "name", // 字段名称
              label: "名称", // 显示的标签
              visible: true
            },
            {
              fieldName: "address",
              label: "地址",
              visible: true
            },
            {
              fieldName: "type",
              label: "类型",
              visible: true
            },
            {
              fieldName: "tel",
              label: "电话号码",
              visible: true
            },
            {
              fieldName: "POI_type",
              label: "POI类型",
              visible: true
            },
            {
              fieldName: "pname",
              label: "POI名称",
              visible: true
            },
            {
              fieldName: "cityname",
              label: "城市",
              visible: true
            },
            {
              fieldName: "adname",
              label: "地址名称",
              visible: true
            },
            {
              fieldName: "adcode",
              label: "adcode",
              visible: true
            },
          ]
        }
      ]
    }
  });

  poi.renderer = {
    type: "simple",  // autocasts as new SimpleRenderer()
    symbol: {
      type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
      size: 5,
      color: 'blue',
      outline: {  // autocasts as new SimpleLineSymbol()
        width: 0.5,
        color: "white"
      }
    }
  };
  map.add(poi);
  poi.visible = false
  // 图层管理
  let layerList = new LayerList({
    view: view
  });
  // Adds widget below other elements in the top left corner of the view
  view.ui.add(layerList, {
    position: "top-right"
  });

});
</script>

<style scoped>
#map-container {
  width: 100%;
  height: 100%;
}
</style>