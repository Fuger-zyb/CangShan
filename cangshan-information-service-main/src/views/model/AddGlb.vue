<template>

    <div class="container">
        <div class="left-container">
            <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
                <el-tab-pane label="模型" name="models">选择模型放置在地图中

                    <el-tree :data="assets" node-key="id" default-expand-all :expand-on-click-node="false"
                        @node-click="handleNodeClick">
                        <!-- 自定义文件节点模板 -->
                        <template #default="{ node, data }">
                            <span class="custom-node">
                                <el-icon v-if="data.type === 'folder'">
                                    <Folder />
                                </el-icon>
                                <el-icon v-else>
                                    <Document />
                                </el-icon>

                                <span style="margin-left: 5px;" @click="addModel(node.parent.data.name, data)">{{
                                    node.label }}</span>
                                <span id="load" v-if="data.isLoading" style="color: red"> 模型加载中...</span>
                            </span>
                        </template>
                    </el-tree>
                </el-tab-pane>


                <el-tab-pane label="场景" name="scene">预设场景
                    <el-tree :data="scenes" @node-click="loadGltfScene">                 
                    </el-tree>

                </el-tab-pane>
            </el-tabs>

        </div>
        <div id="map-container"></div>

    </div>
</template>

<script setup>
import Map from "@geoscene/core/Map";
import SceneView from "@geoscene/core/views/SceneView.js";
import Point from "@geoscene/core/geometry/Point";
import SketchViewModel from "@geoscene/core/widgets/Sketch/SketchViewModel";
import GraphicsLayer from "@geoscene/core/layers/GraphicsLayer";
import Graphic from "@geoscene/core/Graphic";
import Mesh from "@geoscene/core/geometry/Mesh.js";
import { onMounted, ref,getCurrentInstance } from "vue";
import MeshTransform from "@geoscene/core/geometry/support/MeshTransform.js";
import { Folder, Document } from '@element-plus/icons-vue'
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;


let view
const graphics = new GraphicsLayer();
const activeName = ref('models')
const path = 'http://218.85.80.179:3690/data/cangshan/glb/'
const assets = ref([

    {
        id: 2,
        label: '食物',
        name: 'food',
        type: 'folder',
        children: [
            { id: 3, name: 'fotiaoq.glb', label: '佛跳墙', type: 'file', isLoading: false },
            { id: 4, name: 'huashengt.glb', label: '花生汤', type: 'file', isLoading: false },
            { id: 5, name: 'lizhir.glb', label: '荔枝肉', type: 'file', isLoading: false },
            { id: 6, name: 'rouy.glb', label: '肉眼', type: 'file', isLoading: false },
            { id: 7, name: 'yuw.glb', label: '鱼丸', type: 'file', isLoading: false }
        ]
    },
    {
        id: 8,
        label: '建筑物',
        name: 'building',
        type: 'folder',
        children: [
            { id: 9, name: 'zhenhail.glb', label: '镇海楼', type: 'file', isLoading: false },
            { id: 10, name: 'house.glb', label: '房子', type: 'file', isLoading: false },

        ]
    }


])

let placeModelAbortController = null;
let sketchViewModel
onMounted(() => {
    const map = new Map({
        // basemap: "tianditu-vector" // 底图图层服务
      basemap:globalVectorBasemap
    });
    view = new SceneView({
        container: "map-container",
        map: map,
        center: [119.3229, 26.0754],
        zoom: 18,
    });

    // view.map.add(graphics);
    map.add(graphics)



    sketchViewModel = new SketchViewModel({
        view: view,
        layer: graphics,
        tooltipOptions: { enabled: true }
    });

    sketchViewModel.on("create", (event) => {
        if (event.state === "complete") {
            // sketchViewModel.update(event.graphic);
        }
    });
})
const addModel = async (folder, data) => {
    placeModelAbortController?.abort();

    data.isLoading = true
    const { signal } = (placeModelAbortController = new AbortController());

    // Create mesh from the 3D building model.
    const mesh = await Mesh.createFromGLTF(
        new Point(),
        path + folder + '/' + data.name,
        { vertexSpace: "local" }
    );
    mesh.allPlaceholder	 = data.id
    await mesh.load();
    data.isLoading = false

    if (signal.aborted) {
        return;
    }

    sketchViewModel.place(mesh);

}

const scenes = ref([
    {
        id: 0,
        label: "场景1",
        models: [
            {
                id: 0,
                model: path + 'building/' + 'house.glb',
                position: {
                    x: 119.3229,
                    y: 26.0754
                }
            },
        ]
    },
    {
        id: 0,
        label: "场景2",
        models: [
            {
                id: 0,
                model: path + 'building/' + 'zhenhail.glb',
                position: {
                    x: 119.3229,
                    y: 26.0754
                }
            },
            {
                id: 1,
                model: path + 'building/' + 'house.glb',
                position: {
                    x: 119.322,
                    y: 26.0754
                }
            },
        ]
    }
])

function saveScene() {

 
}
const loadGltfScene = (data) => {
    view.graphics.removeAll()
    console.log(data)
    data.models.forEach(async item => {
        const mesh = await Mesh.createFromGLTF(
            new Point(
                item.position
            ),
            item.model,
            { vertexSpace: "local" } 
        );
        // mesh.transform= new MeshTransform({
        //     rotationAngle:0,
        //     rotationAxis: [0, 0, 1],
        //     scale:[3,3,3],
        //     translation:[0, 0, 0]
        // })
        const graphic = {
            geometry: mesh,
        };
        console.error(graphic);
        console.error(graphic.transform,'111');
        
        view.graphics.add(graphic);
    });
}



</script>


<style scoped>
.container {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
}

#map-container {
    flex: 1;
}

.left-container {
    width: 300px;
    height: 100%;
}

</style>