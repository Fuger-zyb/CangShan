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
  import Graphic from "@geoscene/core/Graphic";
  import GraphicsLayer from "@geoscene/core/layers/GraphicsLayer";
  import SimpleMarkerSymbol from "@geoscene/core/symbols/SimpleMarkerSymbol";
  import Point from "@geoscene/core/geometry/Point";
  import { ElMessage } from 'element-plus'
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
  const mapContainer = ref(null);
  
  onMounted(() => {
    // 创建地图实例
    const map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
    });
  
    // 创建视图
    const view = new MapView({
      container: mapContainer.value, // 引用 HTML 中的视图 div
      map: map,
      center: [119.3082, 26.0160], // 设置地图中心坐标
      zoom: 13, // 设置地图缩放级别
    });
  
    // 创建 GraphicsLayer 用于显示 Graphic
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);
  
    // 创建 Graphic
    const pointGraphic = new Graphic({
      geometry: new Point({
        longitude: 119.3082,
        latitude: 26.0160,
      }),
      symbol: new SimpleMarkerSymbol({
        color: [255, 0, 0], // 红色
        size: 12,
        outline: {
          color: [255, 255, 255],
          width: 2,
        },
      }),
      attributes: {
        name: "示例点",
        description: "这是一个示例点",
      },
    });
  
    // 将 Graphic 添加到 GraphicsLayer
    graphicsLayer.add(pointGraphic);
  
    // 监听 Graphic 的鼠标悬浮事件
    view.on("pointer-move", (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const graphic = response.results[0].graphic;
          if (graphic === pointGraphic) {
            // 鼠标悬浮在 Graphic 上
            console.log("鼠标悬浮在 Graphic 上", graphic.attributes);
            view.container.style.cursor = "pointer"; // 改变鼠标样式
          } else {
            view.container.style.cursor = "default"; // 恢复默认鼠标样式
          }
        } else {
          view.container.style.cursor = "default"; // 恢复默认鼠标样式
        }
      });
    });
  
    // 监听 Graphic 的点击事件
    view.on("click", (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const graphic = response.results[0].graphic;
          if (graphic === pointGraphic) {
            // 点击 Graphic
            ElMessage(`点击了 ${graphic.attributes.name}`)
          }
        }
      });
    });
  });
  </script>
  
  <style scoped>
  #map-container {
    width: 100%;
    height: 100%;
  }
  </style>