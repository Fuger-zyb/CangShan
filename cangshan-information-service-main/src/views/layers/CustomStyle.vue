<template>
    <div class="container" style="height: 100%; width: 100%;">
        <!-- 地图容器 -->
        <div id="map-container" ref="mapContainer"></div>

        <!-- 图层列表 -->
        <el-card class="layer-list">
            <div class="layer-buttons">
                <el-button class="layer-button" v-for="layer in layers" :key="layer.id" :title="layer.title"
                    :name="layer.id" @click="openStyleEditor(layer)">{{ layer.title }}</el-button>
            </div>

        </el-card>

        <!-- 样式修改窗口 -->
        <el-card :hidden="!styleEditorVisible" class="style-container">
            <el-form v-if="currentLayer && currentLayer.type === 'point'" :model="styleForm" label-width="80px">
                {{ currentLayer.title }}
                <el-form-item label="上传SVG">
                    <input type="file" @change="handleSvgUpload" accept="image/svg+xml" />
                </el-form-item>

                <div v-if="styleForm.svgUrl === ''">
                    <el-form-item label="填充颜色">
                        <el-color-picker show-alpha v-model="styleForm.color" />
                    </el-form-item>
                    <el-form-item label="线颜色">
                        <el-color-picker show-alpha v-model="styleForm.outlineColor" />
                    </el-form-item>
                    <el-form-item label="线宽">
                        <el-input-number v-model="styleForm.outlineWidth" :min="0" :max="100" />
                    </el-form-item>
                    <el-form-item label="大小">
                        <el-input-number v-model="styleForm.size" :min="1" :max="50" />
                    </el-form-item>
                    <el-form-item label="x轴偏移">
                        <el-input-number v-model="styleForm.xoffset" :min="-50000" :max="50000" />
                    </el-form-item>
                    <el-form-item label="y轴偏移">
                        <el-input-number v-model="styleForm.yoffset" :min="-50000" :max="50000" />
                    </el-form-item>
                </div>
                <div v-else>
                    <el-form-item label="高度">
                        <el-input-number v-model="styleForm.width" :min="1" :max="50" />
                    </el-form-item>
                    <el-form-item label="宽度">
                        <el-input-number v-model="styleForm.height" :min="1" :max="50" />
                    </el-form-item>

                </div>
            </el-form>
            <el-form v-if="currentLayer && currentLayer.type === 'line'" :model="styleForm" label-width="80px">
                {{ currentLayer.title }}
                <el-form-item label="填充颜色">
                    <el-color-picker show-alpha v-model="styleForm.color" />

                </el-form-item>
                <el-form-item label="线宽">
                    <el-input-number v-model="styleForm.width" :min="0" :max="100" />
                </el-form-item>
            </el-form>
            <el-form v-if="currentLayer && currentLayer.type === 'polygon'" :model="styleForm" label-width="80px">
                {{ currentLayer.title }}
                <el-form-item label="填充颜色">
                    <el-color-picker show-alpha v-model="styleForm.color" />
                </el-form-item>
                <el-form-item label="线颜色">
                    <el-color-picker show-alpha v-model="styleForm.outlineColor" />
                </el-form-item>
                <el-form-item label="线宽">
                    <el-input-number v-model="styleForm.outlineWidth" :min="0" :max="100" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="styleEditorVisible = false">关闭</el-button>
                <el-button type="primary" @click="applyStyle">应用</el-button>
            </template>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from "@geoscene/core/views/MapView";
import FeatureLayer from "@geoscene/core/layers/FeatureLayer";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

const mapContainer = ref(null);
const activeLayer = ref([]); // 当前展开的图层
const styleEditorVisible = ref(false); // 样式修改窗口是否可见
const styleForm = ref({
    color: [255, 255, 255],
    outlineColor: "#0000ff",
    opacity: 1,
    size: 12,
    outlineWidth: 2,
    xoffset: 0,
    yoffset: 0,
    width: 12,
    svgUrl: "",
    height: 12
});
// 定义图层
const layers = reactive([
    {
        id: "point-layer",
        title: "点图层",
        type: "point",
    },
    {
        id: "line-layer",
        title: "线图层",
        type: "line",
    },
    {
        id: "polygon-layer",
        title: "面图层",
        type: "polygon",
    },
]);
let currentLayer = ref(null); // 当前选中的图层
let map
// 初始化地图
onMounted(() => {
    // 创建地图实例
    map = new Map({
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

    // 创建点图层
    const pointLayer = new FeatureLayer({
        id: "point-layer",
        title: "点图层",
        url: 'http://218.85.80.179:6080/arcgis/rest/services/csskpt/poi_cangshan/MapServer/0',
    });
    pointLayer.renderer = {
        type: "simple",  // autocasts as new SimpleRenderer()
        symbol: {
            type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
            size: 2,
            color: 'rgba(193, 222, 168, 0.83)',
            outline: {  // autocasts as new SimpleLineSymbol()
                width: 0
            }
        }
    }
    // 创建线图层
    const lineLayer = new FeatureLayer({
        id: "line-layer",
        title: "线图层",
        url: 'http://218.85.80.179:6080/arcgis/rest/services/csskpt/Road_cangshan/MapServer/0'
    });

    // 创建面图层
    const polygonLayer = new FeatureLayer({
        id: "polygon-layer",
        title: "面图层",
        url: 'http://218.85.80.179:6080/arcgis/rest/services/csskpt/grid_cangshan/MapServer/3'
    });

    // 将图层添加到地图
    map.add(pointLayer);
    map.add(lineLayer);
    map.add(polygonLayer);

});

// 打开样式修改窗口
const openStyleEditor = (layer) => {
    currentLayer.value = layer;

    const id = layer.id;
    styleEditorVisible.value = true;
    const symbol = map.findLayerById(id).renderer.symbol
    console.log('当前图层', layer, id, symbol)

    if (layer.type === 'point') {
        styleForm.value.color = rgbToHex(symbol.color)
        styleForm.value.outlineColor = rgbToHex(symbol.outline.color)
        styleForm.value.outlineWidth = symbol.outline.width
        styleForm.value.size = symbol.size
        styleForm.value.xoffset = symbol.xoffset
        styleForm.value.yoffset = symbol.yoffset
    } else if (layer.type === 'line') {
        styleForm.value.color = rgbToHex(symbol.color)
        styleForm.value.width = symbol.width
    } else if (layer.type === 'polygon') {
        console.log('-----', symbol.color, styleForm.value.color)
        styleForm.value.color = rgbToHex(symbol.color)
        styleForm.value.outlineColor = rgbToHex(symbol.outline.color)
        styleForm.value.outlineWidth = symbol.outline.width
    }
};


// 上传 SVG 文件
const handleSvgUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
        styleForm.value.svgUrl = ''
        return
    };

    const reader = new FileReader();
    reader.onload = (e) => {
        styleForm.value.svgUrl = e.target.result; // 将 SVG 文件的内容存储为 URL
    };
    reader.readAsDataURL(file);
};

// 应用样式
const applyStyle = () => {
    console.log('=====', styleForm.value)
    if (currentLayer) {
        const id = currentLayer.value.id;
        const layer = map.findLayerById(id)
        const type = currentLayer.value.type;
        console.log("应用样式", currentLayer, type)
        if (type === "point") {
            if (styleForm.value.svgUrl === '') {
                layer.renderer = {
                    type: "simple",
                    symbol: {
                        type: 'simple-marker',
                        color: styleForm.value.color,
                        size: styleForm.value.size,
                        outline: {
                            color: styleForm.value.outlineColor,
                            width: styleForm.value.outlineWidth,
                        },
                        xoffset: styleForm.value.xoffset,
                        yoffset: styleForm.value.yoffset,
                    },
                };
            } else {
                layer.renderer = {
                    type: "simple",
                    symbol: {
                        type: "picture-marker",
                        url: styleForm.value.svgUrl,
                        width: styleForm.value.width,
                        height: styleForm.value.height,
                    },
                };
            }
        } else if (type === "line") {
            console.log('线样式', styleForm.value)
            layer.renderer = {
                type: "simple",
                symbol: {
                    type: 'simple-line',
                    color: styleForm.value.color,
                    width: styleForm.value.width,
                },
            };
        } else if (type === "polygon") {
            layer.renderer = {
                type: "simple",
                symbol: {
                    type: 'simple-fill',
                    color: styleForm.value.color,
                    outline: {
                        color: styleForm.value.outlineColor,
                        width: styleForm.value.outlineWidth,
                    },
                },
            };
        }


    }
};

const rgbToHex = (rgb) => {
    // 确保 r、g、b 的值在 0 到 255 之间
    const r = rgb.r
    const g = rgb.g
    const b = rgb.b
    const a = rgb.a

    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}
</script>

<style scoped>
.container {
    position: relative;
}

#map-container {
    width: 100%;
    height: 100%;
}

.layer-list {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    width: 300px;
}

.layer-buttons {
    display: flex;
    flex-direction: column;
}

.layer-button {
    margin: 0 0 10px 0;

}

.style-container {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 1000;
    width: 300px;
}
</style>