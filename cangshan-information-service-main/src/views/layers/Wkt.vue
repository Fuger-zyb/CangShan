<template>
  <div ref="mapContainer" class="map-container">
  </div>
</template>

<script setup>
import { ref, onMounted,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from "@geoscene/core/views/MapView";
import GraphicsLayer from "@geoscene/core/layers/GraphicsLayer";
import Graphic from "@geoscene/core/Graphic";
import { wktToGeoJSON } from "@terraformer/wkt";
import { geojsonToArcGIS } from "@terraformer/arcgis";
import Point from "@geoscene/core/geometry/Point";
import Polyline from "@geoscene/core/geometry/Polyline";
import Polygon from "@geoscene/core/geometry/Polygon";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

// 地图相关引用
const mapContainer = ref(null);
let view = ref(null);
const graphicsLayer = new GraphicsLayer();

// 示例 WKT 数据
const samplePointWKT = "POINT (119.3229 26.0754)";
const sampleLineWKT = "LINESTRING (119.3229 26.0754, 119.3329 26.0854)";
const samplePolygonWKT = "POLYGON ((119.31 26.07, 119.32 26.07, 119.31 26.08, 119.31 26.08, 119.30 26.06))";

// 初始化地图
onMounted(() => {
  const map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
  });

  view = new MapView({
    container: mapContainer.value,
    map: map,
    center: [119.3229, 26.0754],
    zoom: 13,
  });

  map.add(graphicsLayer);

  // 添加示例 WKT 数据到地图
  addWktToMap(samplePointWKT);
  addWktToMap(sampleLineWKT);
  addWktToMap(samplePolygonWKT);
});

// 添加 WKT 到地图
const addWktToMap = (wkt) => {
  try {
    // 转换 WKT 为 GeoJSON
    const geojson = wktToGeoJSON(wkt);
    // 转换 GeoJSON 为 ArcGIS 几何
    const arcgisGeometry = geojsonToArcGIS(geojson);

    // 根据几何类型创建对应的 ArcGIS 几何对象
    let geometry;
    if (geojson.type === "Point") {
      geometry = new Point({
        x: arcgisGeometry.x,
        y: arcgisGeometry.y,
        spatialReference: arcgisGeometry.spatialReference,
      });
    } else if (geojson.type === "LineString") {
      geometry = new Polyline({
        paths: arcgisGeometry.paths,
        spatialReference: arcgisGeometry.spatialReference,
      });
    } else if (geojson.type === "Polygon") {
      geometry = new Polygon({
        rings: arcgisGeometry.rings,
        spatialReference: arcgisGeometry.spatialReference,
      });
    } else {
      console.error("不支持的几何类型:", geojson.type);
      return;
    }

    // 创建图形
    const graphic = new Graphic({
      geometry: geometry,
      symbol: getSymbolByType(geojson.type), // 根据几何类型设置符号
    });

    // 将图形添加到图层
    graphicsLayer.add(graphic);

    
  } catch (error) {
    console.error("WKT 解析错误:", error);
    alert("无效的 WKT 格式，请检查输入");
  }
};

// 根据几何类型返回符号
const getSymbolByType = (type) => {
  switch (type) {
    case "Point":
      return {
        type: "simple-marker",
        color: [255, 0, 0, 0.5],
        outline: {
          color: [255, 0, 0],
          width: 2,
        },
      };
    case "LineString":
      return {
        type: "simple-line",
        color: [0, 0, 255, 0.5],
        width: 2,
      };
    case "Polygon":
      return {
        type: "simple-fill",
        color: [0, 255, 0, 0.5],
        outline: {
          color: [0, 255, 0],
          width: 2,
        },
      };
    default:
      return null;
  }
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>