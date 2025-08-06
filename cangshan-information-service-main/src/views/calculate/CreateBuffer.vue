<template>
    <div class="container" style="height: 100%; width: 100%;">
        <!-- 地图容器 -->
        <div id="map-container" ref="mapContainer"></div>

        <el-card class="cards">

                <el-row :gutter="5">
                    <el-col :span="8">
                        <div class="label">绘制：</div>
                    </el-col>
                    <el-col :span="4">
                        <el-button class="button" @click="startDrawing('point')">点</el-button>
                    </el-col>
                    <el-col :span="4">
                        <el-button class="button" @click="startDrawing('polyline')">线</el-button>
                    </el-col>
                    <el-col :span="4">
                        <el-button class="button" @click="startDrawing('polygon')">面</el-button>
                    </el-col>
                    <el-col :span="4">
                        <el-button class="button" @click="removeAll()">清除</el-button>
                    </el-col>
                </el-row>

                <el-row :gutter="5">
                    <el-col :span="8">
                        <div class="label">缓冲半径(m)：</div>
                    </el-col>
                    <el-col :span="16">
                        <el-input-number style="width: 100%;" v-model="bufferDistance" :min="0" :precision="2" />
                    </el-col>
                </el-row>

        </el-card>


    </div>
</template>

<script setup>
import { onMounted, reactive, ref,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from "@geoscene/core/views/MapView";
import GraphicsLayer from "@geoscene/core/layers/GraphicsLayer";
import Draw from "@geoscene/core/views/draw/Draw";
import Graphic from "@geoscene/core/Graphic";
import Point from "@geoscene/core/geometry/Point";
import Polyline from "@geoscene/core/geometry/Polyline";
import Polygon from "@geoscene/core/geometry/Polygon";
import SimpleMarkerSymbol from "@geoscene/core/symbols/SimpleMarkerSymbol";
import SimpleLineSymbol from "@geoscene/core/symbols/SimpleLineSymbol";
import SimpleFillSymbol from "@geoscene/core/symbols/SimpleFillSymbol";
import * as geometryEngine from "@geoscene/core/geometry/geometryEngine";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

const mapContainer = ref(null);
let view;
let graphicsLayer;
let draw;

let currentGraphic = null;
const bufferDistance = ref(100);

// 初始化地图
onMounted(() => {
    const map = new Map({ 
      basemap: "tianditu-vector", // 底图图层服务
    //   basemap:globalVectorBasemap
    });
    view = new MapView({
        container: mapContainer.value,
        map: map,
        center: [119.3229, 26.0754],
        zoom: 13,
    });

    // 创建图形图层
    graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    // 创建绘图工具
    draw = new Draw({
        view: view,
    });
});

// 开始绘制
let drawType = "";
const startDrawing = (type) => {

    view.graphics.removeAll();
    currentGraphic = null;

    drawType = type;
    const action = draw.create(type);

    console.log("开始绘制", type);
    // focus the view to activate keyboard shortcuts for sketching
    view.focus();

    // listen polylineDrawAction events to give immediate visual feedback
    // to users as the line is being drawn on the view.
    action.on(
        [
            "vertex-add",
            "vertex-remove",
            "cursor-update",
            "redo",
            "undo",
        ],
        updateVertices
    );
    action.on("draw-complete", function (evt) {
        graphicsLayer.add(currentGraphic)
        view.graphics.removeAll();
        createBuffer()
    });

};

// 更新绘制的顶点并保存当前绘制的图形
const updateVertices = (event) => {
    if (event.vertices.length >= 1) {
        const graphic = createGraphic(event);
        currentGraphic = graphic;

    }
};

function createGraphic(event) {
    const vertices = event.vertices;
    view.graphics.removeAll();

    let geometry;
    let symbol;
    switch (drawType) {
        case "point":
            geometry = new Point({
                x: vertices[0][0],
                y: vertices[0][1],
                spatialReference: view.spatialReference,
            });
            symbol = new SimpleMarkerSymbol({
                color: [226, 119, 40],
                size: 10,
                outline: { color: [255, 255, 255], width: 1 },
            });
            break;
        case "polyline":
            geometry = new Polyline({
                paths: vertices,
                spatialReference: view.spatialReference,
            });
            symbol = new SimpleLineSymbol({
                color: "#045a8d",
                width: 3,
            });
            break;
        case "polygon":
            geometry = new Polygon({
                rings: vertices,
                spatialReference: view.spatialReference,
            });
            symbol = new SimpleFillSymbol({
                color: [108, 136, 65, 0.5],
                outline: { color: "#6c8841", width: 2 },
            });
            break;
    }

    const graphic = new Graphic({
        geometry: geometry,
        symbol: symbol,
    });

    view.graphics.add(graphic);
    return graphic;
}

// 创建缓冲区
const createBuffer = () => {
    if (currentGraphic === null) {
        alert("请先绘制几何图形！");
        return;
    }

    const distance = bufferDistance.value;
    if (distance <= 0) {
        alert("请输入有效的缓冲区距离！");
        return;
    }

    const geometry = currentGraphic.geometry;
    const bufferGeometry = geometryEngine.buffer(geometry, distance, "meters");

    // 创建缓冲区图形
    const bufferGraphic = new Graphic({
        geometry: bufferGeometry,
        symbol: {
            type: "simple-fill",
            color: [255, 255, 0, 0.5],
            outline: { color: [255, 0, 0], width: 2 },
        }
    });

    // 添加新的缓冲区
    graphicsLayer.add(bufferGraphic);
    currentGraphic = null
};

// 清除
const removeAll = () => {
    graphicsLayer.removeAll()
}
</script>

<style scoped>
.container {
    position: relative;
    height: 100%;
    width: 100%;
}

#map-container {
    width: 100%;
    height: 100%;
}

.cards {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 20px;
    right: 20px;
    width: 300px;
}
.el-row {
  margin-bottom: 10px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.label {
    color: #606266;
    font-size: 12px;
    line-height: 30px;
    text-align: right;
}
.button {
    width: 40px;
}

</style>