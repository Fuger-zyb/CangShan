<template>
    <div style="height: 100%; width: 100%;">
      <!-- 地图容器 -->
      <div id="map-container" ref="mapContainer"></div>
      <!-- 底图切换微件容器 -->
      <!-- <div id="basemap-gallery"></div> -->
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref,getCurrentInstance } from "vue";
  import Map from "@geoscene/core/Map";
  import MapView from "@geoscene/core/views/MapView";
  import MapImageLayer from '@geoscene/core/layers/MapImageLayer';
  
  
  const mapContainer = ref(null);
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
  
  onMounted(() => {
    // 创建地图实例
    const map = new Map({
    //   basemap: "tianditu-image", // 底图图层服务
      basemap:globalVectorBasemap
    });
  
    // 创建视图
    const view = new MapView({
      container: mapContainer.value, // 引用 HTML 中的视图 div
      map: map,
      center: [119.273546, 26.046744], // 设置地图中心坐标
      zoom: 10 // 设置地图缩放级别
    });
  
    // 加载 MapServer 服务
    const featureLayer = new MapImageLayer({
      url: 'http://218.85.80.179:6080/arcgis/rest/services/csskpt/仓山区三维模型分区图/MapServer',
      title: '三维模型分区',
    });
  
    // 将图层添加到地图
    map.add(featureLayer);
  
  
  });
  </script>
  
  <style scoped>
  #map-container {
    width: 100%;
    height: 100%;
    /* 占满整个视口 */
  }
  </style>