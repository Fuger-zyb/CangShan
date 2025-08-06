<template>
  <div style="height: 100%; width: 100%;">
    <!-- 地图容器 -->
    <div id="map-container" ref="mapContainer"></div>

    <!-- 查询 -->
    <el-card class="query-card">
      <el-form :model="queryForm" label-width="80px">
        <el-form-item label="查询范围">
          <div id="sketch"></div>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="queryForm.keyword" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="executeQuery">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 查询结果列表 -->
      <el-table v-if="queryResults.length > 0" :data="queryResults" height="200" @row-click="zoomToFeature">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="type" label="类型" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from "@geoscene/core/views/MapView";
import GraphicsLayer from "@geoscene/core/layers/GraphicsLayer";
import * as query from "@geoscene/core/rest/query";
import Query from "@geoscene/core/rest/support/Query";
import SimpleMarkerSymbol from "@geoscene/core/symbols/SimpleMarkerSymbol";
import Graphic from "@geoscene/core/Graphic";
import Sketch from "@geoscene/core/widgets/Sketch";
import SketchViewModel from "@geoscene/core/widgets/Sketch/SketchViewModel";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

const mapContainer = ref(null);
const queryForm = ref({
  keyword: "", // 关键字
});

const queryResults = ref([]); // 查询结果

let graphicsLayer = null; // 用于显示查询结果的图层
let view = null;
let currentGraphic = null;
let sketch
// 初始化地图
onMounted(() => {
  // 创建地图实例
  const map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
  });

  // 创建视图
  view = new MapView({
    container: mapContainer.value, // 引用 HTML 中的视图 div
    map: map,
    center: [119.3229, 26.0754], // 设置地图中心坐标
    zoom: 13, // 设置地图缩放级别
  });

  // 创建 GraphicsLayer 用于显示查询结果
  graphicsLayer = new GraphicsLayer({
    outFields: ["*"],
  });
  map.add(graphicsLayer);

  // 创建 SketchViewModel 实例
  const sketchViewModel = new SketchViewModel({
    layer: graphicsLayer,
    view: view,
    updateOnGraphicClick: false,
    // 配置默认的绘制工具和样式
    defaultUpdateOptions: {
      tool: "reshape"
    },
    defaultCreateOptions: {
      mode: "click",
      tool: "freehand"
    }
  });

  sketch = new Sketch({
    view: view,
    viewModel: sketchViewModel,
    availableCreateTools: ["polygon", "rectangle", "circle"],
    container: 'sketch'
  });

  // view.ui.add(sketch, "bottom-right");

  // 监听图形绘制完成事件
  sketch.on("create", (event) => {
    if (event.state === "complete") {
      currentGraphic = event.graphic;
    }
  });

  // 监听图形更新事件
  sketch.on("update", (event) => {
    console.log("更新事件", event.aborted)
    if (!event.aborted && event.state === "complete") {
      currentGraphic = event.graphic;
    }
  });
});

// 执行查询
const executeQuery = () => {
  const queryUrl = "http://218.85.80.179:6080/arcgis/rest/services/csskpt/poi_cangshan/MapServer/0";

  const queryObject = new Query({
    where: `name LIKE '%${queryForm.value.keyword}%'`, // 查询条件
    returnGeometry: true, // 返回几何信息
    outFields: ["*"], // 返回所有字段
    outSR: "4490"
  });

  if(currentGraphic !== null) {
    queryObject.geometry = currentGraphic.geometry
  } 
  query
    .executeQueryJSON(queryUrl, queryObject)
    .then((results) => {
      // 清空之前的查询结果
      graphicsLayer.removeAll();
      queryResults.value = [];
      currentGraphic = null
      // 显示查询结果
      results.features.forEach((feature) => {
        // 在地图上显示红点
        const graphic = new Graphic({
          layer: graphicsLayer,
          geometry: feature.geometry,
          symbol: new SimpleMarkerSymbol({
            color: [255, 0, 0], // 红色
            size: 12,
            outline: {
              color: [255, 255, 255],
              width: 2,
            },
          }),
          attributes: feature.attributes,
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
                    visible: true,
                  },
                  {
                    fieldName: "address",
                    label: "地址",
                    visible: true,
                  },
                  {
                    fieldName: "type",
                    label: "类型",
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
          name: feature.attributes.name,
          address: feature.attributes.address,
          type: feature.attributes.type,
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

  view.goTo({
    target: graphic, // 定位到几何中心
    zoom: 18, // 设置缩放级别
  });

  view.popup.open({
    features: [graphic],
    location: graphic.geometry
  });
};
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
  width: 450px;
}
</style>