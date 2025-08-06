<template>
    <div style="height: 100%; width: 100%;">
        <div ref="mapViewNode" class="map-container"></div>
        <!-- 属性编辑弹窗 -->
        <el-dialog v-model="showAttributeEditor" title="编辑属性" width="30%">
            <el-form :model="currentAttributes" label-width="80px">
                <el-form-item label="名称">
                    <el-input v-model="currentAttributes.name" placeholder="请输入名称" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="currentAttributes.description" type="textarea" placeholder="请输入描述" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="cancelAttributes">取消</el-button>
                <el-button type="primary" @click="saveAttributes">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref,getCurrentInstance } from "vue";
import Map from "@geoscene/core/Map";
import MapView from "@geoscene/core/views/MapView";
import Sketch from "@geoscene/core/widgets/Sketch";
import SketchViewModel from "@geoscene/core/widgets/Sketch/SketchViewModel";
import GraphicsLayer from "@geoscene/core/layers/GraphicsLayer";
import TextSymbol from "@geoscene/core/symbols/TextSymbol";
import Graphic from "@geoscene/core/Graphic";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

let map, view, sketch, graphicsLayer;
const mapViewNode = ref(null);

// 属性编辑相关状态
const showAttributeEditor = ref(false); // 是否显示属性编辑弹窗
const currentAttributes = ref({ name: '', description: '' }); // 当前编辑的属性
let currentGraphic = null; // 当前编辑的图形

onMounted(() => {
    // 创建地图
    map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
    });

    // 创建视图
    view = new MapView({
        container: mapViewNode.value,
        map: map,
        center: [119.32, 26.02],
        zoom: 13,

    });

    // 创建一个 GraphicsLayer 用于存储绘制的图形
    graphicsLayer = new GraphicsLayer();

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

    // 创建 Sketch 组件
    sketch = new Sketch({
        view: view,
        viewModel: sketchViewModel // 将 SketchViewModel 绑定到 Sketch 组件
    });

    view.ui.add(sketch, "top-right");

    // 监听图形绘制完成事件
    sketch.on("create", (event) => {
        if (event.state === "complete") {
            currentGraphic = event.graphic;
            console.log("打印坐标", currentGraphic)
            showAttributeEditor.value = true; // 显示属性编辑弹窗
        }
    });

    // 监听图形更新事件
    sketch.on("update", (event) => {
        console.log("更新事件")
        if (!event.aborted && event.state === "complete") {
            currentGraphic = event.graphic;

            showAttributeEditor.value = true; // 显示属性编辑弹窗
        }
    });
});

// 保存属性
const saveAttributes = () => {
    if (currentGraphic) {
        // 将属性保存到图形的 attributes 中
        currentGraphic.attributes = {
            ...currentGraphic.attributes,
            ...currentAttributes.value,
        };
        console.log('属性已保存', currentGraphic.attributes);

        // 在图斑中显示名称
        addNameToGraphic(currentGraphic);
    }
    closeAttributeEditor();
};

// 在图斑中显示名称
const addNameToGraphic = (graphic) => {
    let centerPoint = null;

    // 根据几何类型计算中心点
    if (graphic.geometry.type === 'polyline') {
        // 计算线的中点
        const line = graphic.geometry;
        const midSegmentIndex = Math.floor(line.paths[0].length / 2);
        centerPoint = line.getPoint(0, midSegmentIndex);
    } else if (graphic.geometry.type === 'polygon') {
        // 计算面的质心
        centerPoint = graphic.geometry.centroid;
    } else if (graphic.geometry.type === 'point') {
        // 直接使用点
        centerPoint = graphic.geometry;
    }

    if (centerPoint) {
        const textSymbol = new TextSymbol({
            text: graphic.attributes.name || '未命名', // 显示名称
            color: 'white',
            font: { size: 12, weight: 'bold' },
            haloColor: 'black',
            haloSize: 1,
            xoffset: 0,
            yoffset: -20, // 将名称显示在图斑上方
        });

        const textGraphic = new Graphic({
            geometry: centerPoint, // 使用计算出的中心点
            symbol: textSymbol,
        });

        // 将名称添加到图形图层
        graphicsLayer.add(textGraphic);
    }
};

// 取消属性编辑
const cancelAttributes = () => {
    closeAttributeEditor();
};

// 关闭属性编辑弹窗
const closeAttributeEditor = () => {
    showAttributeEditor.value = false;
    currentAttributes.value = { name: '', description: '' }; // 清空表单
    currentGraphic = null; // 清空当前图形
};
</script>

<style scoped>
.map-container {
    width: 100%;
    height: 100%;
}
</style>