<template>
  <div style="height: 100%; width: 100%;">
    <!-- 地图容器 -->
    <div id="map-container" ref="mapContainer"></div>

    <!-- 查询卡片 -->
    <el-card class="query-card">
      <el-form :model="queryForm" label-width="80px">
        <el-form-item label="类型">
          <el-select v-model="queryForm.type" placeholder="请选择类型">
            <el-option v-for="item in poiTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="queryForm.keyword" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="executeQuery">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 查询结果列表 v-if="queryResults.length > 0"-->
      <el-table  :data="queryResults" height="300" @row-click="zoomToFeature">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="type" label="类型" />
      </el-table>

      <!-- 分页控件 v-if="total > 0"-->
      <el-pagination
        
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        :pager-count="5"
        :total="total"
        layout="total, prev, pager, next"
        class="pagination"
      />
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
import SimpleMarkerSymbol from "@geoscene/core/symbols/SimpleMarkerSymbol";
import Graphic from "@geoscene/core/Graphic";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

const mapContainer = ref(null);
const queryForm = ref({
  type: "房产小区:房产小区附属",
  keyword: "",
});
const poiTypes = ref([
  { value: "房产小区:房产小区附属", label: "房产小区" },
  { value: "公司企业:公司企业", label: "公司企业" },
  { value: "餐饮:餐饮", label: "餐饮" },
]);
const queryResults = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

let graphicsLayer = null;
let view;

// 初始化地图
onMounted(() => {
  const map = new Map({ 
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap });
  view = new MapView({
    container: mapContainer.value,
    map: map,
    center: [119.3229, 26.0754],
    zoom: 13,
  });
  graphicsLayer = new GraphicsLayer({ outFields: ["*"] });
  map.add(graphicsLayer);
});

// 生成查询条件
const generateWhereClause = () => {
  let clause = `type = '${queryForm.value.type}'`;
  if (queryForm.value.keyword) {
    clause += ` AND name LIKE '%${queryForm.value.keyword}%'`;
  }
  return clause;
};

// 获取总记录数
const fetchTotal = async () => {
  const queryUrl = "http://218.85.80.179:6080/arcgis/rest/services/csskpt/poi_cangshan/MapServer/0";
  console.log("查询条件", generateWhereClause())
  const queryObject = new Query({
    where: generateWhereClause(),
  });

  try {
    const countResult = await query.executeForCount(queryUrl, queryObject);
    total.value = countResult;
    console.log("获取总数", countResult)
  } catch (error) {
    console.error("获取总数失败:", error);
    total.value = 0;
  }
};

// 获取分页数据
const fetchData = async () => {
  const queryUrl = "http://218.85.80.179:6080/arcgis/rest/services/csskpt/poi_cangshan/MapServer/0";
  const queryObject = new Query({
    where: generateWhereClause(),
    returnGeometry: true,
    outFields: ["*"],
    // resultOffset: "20"
    // resultOffset: (currentPage.value - 1) * pageSize.value,
    // resultRecordCount: pageSize.value
  });

  try {
    const results = await query.executeQueryJSON(queryUrl, queryObject);
    console.log("获取分页数据", results)
    processResults(results);
  } catch (error) {
    console.error("查询错误:", error);
    queryResults.value = [];
    graphicsLayer.removeAll();
  }
};

// 处理查询结果
const processResults = (results) => {
  graphicsLayer.removeAll();
  queryResults.value = [];

  results.features.forEach((feature, index) => {
    const graphic = new Graphic({
      geometry: feature.geometry,
      symbol: new SimpleMarkerSymbol({
        color: [255, 0, 0],
        size: 12,
        outline: { color: [255, 255, 255], width: 2 }
      }),
      attributes: feature.attributes,
      popupTemplate: {
        title: "要素信息",
        content: [{
          type: "fields",
          fieldInfos: [
            { fieldName: "name", label: "名称" },
            { fieldName: "address", label: "地址" },
            { fieldName: "type", label: "类型" }
          ]
        }]
      }
    });
    graphicsLayer.add(graphic);

    queryResults.value.push({
      id: index,
      name: feature.attributes.name,
      address: feature.attributes.address,
      type: feature.attributes.type,
      geometry: feature.geometry.toJSON()
    });
  });
};

// 执行查询
const executeQuery = async () => {
  currentPage.value = 1;
  await fetchTotal();
  await fetchData();
};

// 分页变化处理
const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchData();
};

// 每页数量变化处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  fetchData();
};

// 定位要素
const zoomToFeature = (row) => {
  view.goTo({
    target: [row.geometry.x, row.geometry.y],
    zoom: 18
  });

  const graphic = graphicsLayer.graphics.items[row.id];
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
  z-index: 1000;
  width: 400px;
  background-color: white;

  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 10px;
  width: 100%;
}
</style>