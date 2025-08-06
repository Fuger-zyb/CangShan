<template>
    <div id="map-container"></div>
  </template>
  
  <script setup>
import { onMounted,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from "@geoscene/core/views/MapView";
import GraphicsLayer from "@geoscene/core/layers/GraphicsLayer"
import Point from "@geoscene/core/geometry/Point"
import Polyline from "@geoscene/core/geometry/Polyline"
import Polygon from "@geoscene/core/geometry/Polygon"
import Circle from "@geoscene/core/geometry/Circle"
import Graphic from "@geoscene/core/Graphic"
import SimpleMarkerSymbol from "@geoscene/core/symbols/SimpleMarkerSymbol"
import SimpleLineSymbol from "@geoscene/core/symbols/SimpleLineSymbol"
import SimpleFillSymbol from "@geoscene/core/symbols/SimpleFillSymbol"
import TextSymbol from "@geoscene/core/symbols/TextSymbol";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
  
  let view;
  
  onMounted(() => {
    // 初始化地图
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
  
    // 创建图形图层
    const mainLayer = new GraphicsLayer();
    const labelLayer = new GraphicsLayer();
    map.addMany([mainLayer, labelLayer]);
  
    // 创建通用标签样式
    const createLabel = (text, geometry, color, offsetY = 0) => {
      const symbol = new TextSymbol({
        color: color,
        haloColor: "white",
        haloSize: 1.5,
        text: text,
        font: {
          size: 12,
          weight: "bold"
        },
        yoffset: offsetY
      });
      labelLayer.add(new Graphic({ geometry, symbol }));
    };
  
    // 1. 点要素
    const point = new Point({
      longitude: 119.28,
      latitude: 26.03,
      spatialReference: { wkid: 4326 }
    });
    mainLayer.add(new Graphic({
      geometry: point,
      symbol: new SimpleMarkerSymbol({
        color: [226, 119, 40],
        size: 14,
        outline: { color: [255, 255, 255], width: 2 }
      }),
      popupTemplate: {
      title: "点",
      content: "这是一个点"
    }
    }));
    createLabel("点", point, "#e27728", 18);
  
    // 2. 线要素
    const polyline = new Polyline({
      paths: [[
        [119.30, 26.04],
        [119.34, 26.00]
      ]],
      spatialReference: { wkid: 4326 }
    });
    mainLayer.add(new Graphic({
      geometry: polyline,
      symbol: new SimpleLineSymbol({
        color: "#045a8d",
        width: 3
      }),
      popupTemplate: {
      title: "线",
      content: "这是一个线"
    }
    }));
    createLabel("线", polyline.extent.center, "#045a8d");
  
    // 3. 面要素
    const polygon = new Polygon({
      rings: [[
        [119.25, 26.05],
        [119.28, 26.05],
        [119.27, 26.03],
        [119.25, 26.03]
      ]],
      spatialReference: { wkid: 4326 }
    });
    mainLayer.add(new Graphic({
      geometry: polygon,
      symbol: new SimpleFillSymbol({
        color: [108, 136, 65, 0.5],
        outline: { color: "#6c8841", width: 2 }
      }),
      popupTemplate: {
      title: "面",
      content: "这是一个面"
    }
    }));
    createLabel("面", polygon.extent.center, "#6c8841");
  
    // 4. 圆形要素
    const circle = new Circle({
      center: [119.35, 26.01],
      radius: 1500,
      spatialReference: { wkid: 4326 }
    });
    mainLayer.add(new Graphic({
      geometry: circle,
      symbol: new SimpleFillSymbol({
        color: [255, 153, 0, 0.3],
        outline: { color: "#ff9900", width: 2 }
      }),
      popupTemplate: {
      title: "圆",
      content: "这是一个圆"
    }
    }));
    createLabel("圆", circle.center, "#ff9900", -20);
  });
  </script>
  
  <style>
  #map-container {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
  }
  </style>
  