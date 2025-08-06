<template>
    <div style="height: 100%; width: 100%;">
        <!-- 地图容器 -->
        <div id="map-container" ref="mapContainer"></div>

        <!-- 查询卡片 -->
        <el-card class="query-card">
            <el-form :model="queryForm" label-width="80px">

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
                <el-table-column prop="type" label="类型" />
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
import SimpleLineSymbol from "@geoscene/core/symbols/SimpleLineSymbol";
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
let view
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


});

// 执行查询
const executeQuery = () => {
    const queryUrl = "http://218.85.80.179:6080/arcgis/rest/services/csskpt/Road_cangshan/MapServer/0";

    const queryObject = new Query({
        where: `name LIKE '%${queryForm.value.keyword}%'`, // 查询条件
        returnGeometry: true, // 返回几何信息
        outFields: ["*"], // 返回所有字段
    });

    query
        .executeQueryJSON(queryUrl, queryObject)
        .then((results) => {
            console.log("查询结果", queryForm.value.keyword, results.features)
            // 清空之前的查询结果
            graphicsLayer.removeAll();
            queryResults.value = [];

            // 显示查询结果
            results.features.forEach((feature) => {
                // 在地图上显示红点
                const graphic = new Graphic({
                    layer: graphicsLayer,
                    geometry: feature.geometry,
                    symbol: new SimpleLineSymbol({
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
                                        visible: true
                                    },
                                    {
                                        fieldName: "type",
                                        label: "类型",
                                        visible: true
                                    },
                                ]
                            }
                        ]
                    }
                });
                graphicsLayer.add(graphic);

                // 在表格中显示查询结果
                queryResults.value.push({
                    id: graphicsLayer.graphics.length - 1,
                    name: feature.attributes.name,
                    address: feature.attributes.address,
                    type: feature.attributes.type,
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
                updateLocationEnabled: true
            });
        })
        .catch((error) => {
            if (error.name != "AbortError") {
                console.error(error);
            }
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
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>