<template>
    <div style="height: 100%; width: 100%;">
      <!-- 地图容器 -->
      <div id="map-container" ref="mapContainer"></div>
  
      <!-- 查询 -->
      <el-card class="query-card">
        <el-form :model="queryForm" label-width="80px">
          <el-form-item label="关键字">
            <el-input v-model="queryForm.keyword" placeholder="请输入关键字" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="executeQuery">查询</el-button>
            <el-button type="primary" @click="removeResults">清空</el-button>
          </el-form-item>
        </el-form>
  
        <!-- 查询结果列表 -->
        <el-table v-if="queryResults.length > 0" :data="queryResults" height="200" @row-click="zoomToFeature">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="BELONGTO" label="上一级行政区划" />
        </el-table>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref,getCurrentInstance } from "vue";
  import Map from "@geoscene/core/Map";
  import MapView from "@geoscene/core/views/MapView";
  import FeatureLayer from "@geoscene/core/layers/FeatureLayer";
  import GraphicsLayer from "@geoscene/core/layers/GraphicsLayer";
  import * as query from "@geoscene/core/rest/query";
  import Query from "@geoscene/core/rest/support/Query";
  import SimpleFillSymbol from "@geoscene/core/symbols/SimpleFillSymbol";
  import Graphic from "@geoscene/core/Graphic";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
  
  const mapContainer = ref(null);
  const queryForm = ref({
    keyword: "", // 关键字
  });
  
  const queryResults = ref([]); // 查询结果
  let graphicsLayer = null; // 用于显示查询结果的图层
  let view;
  
  // 初始化地图
  onMounted(() => {
    // 创建地图实例
    const map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
    });
  
    // 创建视图
    view = new MapView({
      container: mapContainer.value, 
      map: map,
      center: [119.3229, 26.0754], 
      zoom: 13, 
    });
  
    // 创建 GraphicsLayer 用于显示查询结果
    graphicsLayer = new GraphicsLayer({
      outFields: ["*"],
    });
    map.add(graphicsLayer);
  });
  
  // 执行查询
  const executeQuery = () => {
    const queryUrl2 = "http://218.85.80.179:6080/arcgis/rest/services/csskpt/grid_cangshan/MapServer/2";
    const queryUrl3 = "http://218.85.80.179:6080/arcgis/rest/services/csskpt/grid_cangshan/MapServer/3";
  
    const queryObject2 = new Query({
      where: `STREETNAME LIKE '%${queryForm.value.keyword}%'`, // 查询条件
      returnGeometry: true, // 返回几何信息
      outFields: ["*"], // 返回所有字段
    });
  
    const queryObject3 = new Query({
      where: `GRIDNAME LIKE '%${queryForm.value.keyword}%'`, // 查询条件
      returnGeometry: true, // 返回几何信息
      outFields: ["*"], // 返回所有字段
    });
  
    // 并行执行查询
    Promise.all([
      query.executeQueryJSON(queryUrl2, queryObject2),
      query.executeQueryJSON(queryUrl3, queryObject3),
    ])
      .then(([results2, results3]) => {
        console.log("查询结果", queryForm.value.keyword, results2, results3);
        // 清空之前的查询结果
        graphicsLayer.removeAll();
        queryResults.value = [];
  
        // 合并结果显示查询结果
        [...results2.features, ...results3.features].forEach((feature) => {
          // 在地图上显示填充的区域
          const graphic = new Graphic({
            layer: graphicsLayer,
            geometry: feature.geometry,
            symbol: new SimpleFillSymbol({
              color: [255, 0, 0, 0.5], // 半透明红色
              outline: {
                color: [255, 255, 255],
                width: 1,
              },
            }),
            attributes: feature.attributes,
            popupEnabled: true, // 启用弹出窗口
            popupTemplate: {
              title: "行政区划信息", // 弹出窗口标题
              content: [
                {
                  type: "fields",
                  fieldInfos: [
                  {
                    fieldName: "STREETNAME", // 字段名称
                    label: "名称", // 显示的标签
                    visible: true,
                  },
                  {
                    fieldName: "GRIDNAME", // 字段名称
                    label: "名称", // 显示的标签
                    visible: true,
                  },
                  {
                    fieldName: "BELONGTO",
                    label: "上一级行政区划",
                    visible: true,
                  },
                ],
                },
              ],
            },
          });
          graphicsLayer.add(graphic);
  
          // 在表格中显示查询结果
          queryResults.value.push({
            id: graphicsLayer.graphics.length - 1,
            name: feature.attributes.name || feature.attributes.STREETNAME || feature.attributes.GRIDNAME,
            BELONGTO: feature.attributes.BELONGTO || "未知",
            geometry: feature.geometry.toJSON(), // 保存几何信息，用于定位
          });
        });
      })
      .catch((error) => {
        console.log("查询错误", error);
      });
  };
  
  // 定位到选中的要素
  const zoomToFeature = (row) => {
    const graphic = graphicsLayer.graphics.items[row.id];
  
    view.goTo(graphic)
      .then(() => {
        view.openPopup({
          features: [graphic],
          featureMenuOpen: true,
          updateLocationEnabled: true,
        });
      })
      .catch((error) => {
        if (error.name != "AbortError") {
          console.error(error);
        }
      });
  };

  const removeResults = () => {
    graphicsLayer.removeAll()
    queryResults.value = []
    queryForm.value.keywor = ''
  }
  </script>
  
  <style scoped>
  #map-container {
    width: 100%;
    height: 100%;
  }
  
  .query-card {
    position: absolute;
    top: 80px;
    right: 20px;
    width: 400px;

  }
  </style>