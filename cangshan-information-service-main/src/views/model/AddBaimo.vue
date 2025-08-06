<template>
    <div style="height: 100%; width: 100%;">
        <div ref="mapView" class="map-container"></div>
    </div>
</template>

<script setup>
import { ref, onMounted,getCurrentInstance } from 'vue';
import TileLayer from '@geoscene/core/layers/TileLayer';
import Basemap from "@geoscene/core/Basemap.js";
import Map from "@geoscene/core/Map";
import SceneView from "@geoscene/core/views/SceneView.js";
import IntegratedMesh3DTilesLayer from "@geoscene/core/layers/IntegratedMesh3DTilesLayer.js";
import IntegratedMeshLayer from "@geoscene/core/layers/IntegratedMeshLayer.js";
import ElevationLayer from "@geoscene/core/layers/ElevationLayer.js";
import SpatialReference from "@geoscene/core/geometry/SpatialReference";
import Ground from "@geoscene/core/Ground.js";
const mapView = ref(null);
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

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

  const vectorBasemap = new Basemap({
    baseLayers: [vecMapLayer, vecAnnoLayer],
    title: '矢量电子地图',
    id: 'vector_basemap',
  });

    // 加载 ArcGIS API for JavaScript 模块
    const spatialReference = new SpatialReference({
        wkid: 4490
    });


    const worldElevation = new ElevationLayer({
        url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
        // spatialReference: { wkid: 3857 },
      });


    // 创建 WebMap 实例并添加图层
    const map = new Map({
        // basemap: 'tianditu-vector',
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
        
        // ground: new Ground({ layers: [ worldElevation ]}) // 天地图地形数据
    });


    const baimo = new IntegratedMesh3DTilesLayer({
        url: 'https://izzmap.com/gs/map/3dtiles/2025021267ac6c6efeb8688fd7506a6b_d12134/tileset.json',
        title: '白模',
        spatialReference: new SpatialReference({ wkid: 4326 })
    });
    const renderer = {
    type: "simple", // 简单渲染器类型
    symbol: {
      type: "mesh-3d", // 3D 网格符号
      symbolLayers: [{
        type: "fill", // 填充符号层
        material: { 
          color: [255, 0, 0, 0.8] // RGBA 颜色值（红色，80%不透明度）
        }
      }]
    }
  };

  // 应用渲染器到图层
  baimo.renderer = renderer;

   map.add(baimo);

    // 创建 SceneView 实例
    const view = new SceneView({
        container: mapView.value,
        map: map,
        center: [119.2582, 26.0410],
        // center: [118.8587, 26.2214],
        zoom: 15,
        // spatialReference: spatialReference,
        // viewingMode: "global",
        //   spatialReference,
        //   camera: {
        //       position: {
        //         x: 521066.30151,
        //         y: 3372094.63476,
        //         z: 5243.280,
        //         spatialReference: 4547
        //       },
        //       heading: 0.00,
        //       tilt: 54.74
        //     }
    });
    console.log(view)
});

</script>

<style>
.map-container {
    height: 100%;
    width: 100%;
}
</style>