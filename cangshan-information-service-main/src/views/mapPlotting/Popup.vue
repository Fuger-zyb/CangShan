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
  import Point from "@geoscene/core/geometry/Point";
  import SimpleMarkerSymbol from "@geoscene/core/symbols/SimpleMarkerSymbol";
  import Popup from "@geoscene/core/widgets/Popup";
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
      center: [119.3229, 26.0754], // 设置地图中心坐标
      zoom: 13, // 设置地图缩放级别
    });
  
    // 创建 Graphic
    const pointGraphic = new Graphic({
      geometry: new Point({
        longitude: 119.3229,
        latitude: 26.0754,
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
  
    // 将 Graphic 添加到地图
    view.graphics.add(pointGraphic);
  
    // 配置 Popup
    const popup = new Popup({
      view: view,
      content: `
        <h3>${pointGraphic.attributes.name}</h3>
        <p>${pointGraphic.attributes.description}</p>
      `,
    });
    view.openPopup({
              location: [119.29011391153638, 26.085134828708952], // Popup 显示的位置
              content: `
                <h3>popup1</h3>
                <p>在地图上直接打开</p>
              `,
            });
    view.popupEnabled = false;
    // 监听 Graphic 的点击事件
    view.on("click", (event) => {
      view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const graphic = response.results[0].graphic;
          
          if (graphic === pointGraphic) {
            // 显示 Popup
            view.openPopup({
              location: graphic.geometry, // Popup 显示的位置
              content: `
                <h3>popup2${graphic.attributes.name}</h3>
                <p>点击要素，触发事件打开</p>
              `,
            });
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
  
  .esri-popup {
    background-color: #f0f0f0;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .esri-popup__header-title {
    font-size: 16px;
    font-weight: bold;
  }
  
  .esri-popup__content {
    font-size: 14px;
  }
  </style>