<template>
  <div style="height: 100%; width: 100%;">
    <!-- 地图容器 -->
    <div id="map-container" ref="mapContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted,getCurrentInstance } from 'vue';
import Map from '@geoscene/core/Map';
import MapView from '@geoscene/core/views/MapView';
import TileLayer from '@geoscene/core/layers/TileLayer';
import BasemapGallery from '@geoscene/core/widgets/BasemapGallery';
import Basemap from "@geoscene/core/Basemap.js";
import Expand from "@geoscene/core/widgets/Expand.js";
// 地图和视图实例
const mapContainer = ref(null);
 
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

// 初始化地图
onMounted(() => {
  // 矢量底图
  const vecMapLayer = new TileLayer({
    url: 'https://ds.fzkcy.com/arcgis/rest/services/tilemap/%E7%9F%A2%E9%87%8F%E5%BA%95%E5%9B%BE_CGCS2000_2021/MapServer',
    id: 'vec_map_layer',
  });
// 矢量底图注记
  const vecAnnoLayer = new TileLayer({
    url: 'https://ds.fzkcy.com/arcgis/rest/services/tilemap/%E7%9F%A2%E9%87%8F%E5%BA%95%E5%9B%BE%E6%B3%A8%E8%AE%B0_CGCS2000_2021/MapServer',
    id: 'vec_anno_layer',
  });
// 影像底图
  const imgMapLayer = new TileLayer({
    url: 'https://ds.fzkcy.com/arcgis/rest/services/tilemap/%E5%BD%B1%E5%83%8F%E5%BA%95%E5%9B%BE_CGCS2000_2021/MapServer',
    id: 'img_map_layer',
  });
// 影像底图注记
  const imgAnnoLayer = new TileLayer({
    url: 'https://ds.fzkcy.com/arcgis/rest/services/tilemap/%E5%BD%B1%E5%83%8F%E5%BA%95%E5%9B%BE%E6%B3%A8%E8%AE%B0_CGCS2000_2021/MapServer',
    id: 'img_anno_layer',
  });

  // 定义矢量底图
  const vectorBasemap = new Basemap({
    baseLayers: [vecMapLayer, vecAnnoLayer],
    title: '矢量电子地图',
    id: 'vector_basemap',
  });

  // 定义影像底图
  const imageBasemap = new Basemap({
    baseLayers: [imgMapLayer, imgAnnoLayer],
    title: '影像地图',
    id: 'image_basemap',
  });

  // 初始化地图
  const map = new Map({
    basemap: globalVectorBasemap, // 默认加载矢量电子地图
  });

  // 初始化地图视图
  const view = new MapView({
    map: map,
    container: mapContainer.value, // 地图容器
    center: [119.32, 26.02],
    zoom: 13,
  });

  // 初始化底图切换微件
  const basemapGallery = new BasemapGallery({
    view: view,
    source: [globalVectorBasemap,globalImageBasemap ], // 添加矢量底图和影像底图
    container: document.createElement("div"), // 微件容器
  });

  const layerListExpand = new Expand({
    expandIcon: "basemap",  // see https://developers.arcgis.com/calcite-design-system/icons/
    // expandTooltip: "Expand LayerList", // optional, defaults to "Expand" for English locale
    view: view,
    content: basemapGallery
  });
  view.ui.add(layerListExpand, "top-right");

});
</script>

<style scoped>
#map-container {
  width: 100%;
  height: 100%;
}

#basemap-gallery {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}
</style>