<template>
    <div class="container">
        <!-- 左侧面板 -->
        <div class="left-panel">
            <el-tabs v-model="activeTab">
                <!-- 图层标签页 -->
                <el-tab-pane label="图层" name="layers">
                    <el-button @click="showLayerDialog = true">添加图层</el-button>
                    <div class="layer-list">
                        <!-- 已添加的图层列表 -->
                        <div v-for="layer in currentLayers" :key="layer.id">
                            {{ layer.title }}
                            <el-button @click="removeLayer(layer.id)">删除</el-button>
                        </div>
                    </div>

                    <el-button @click="showBasemapDialog = true">修改底图</el-button>
                    <div class="layer-list">
                        <!-- 已添加的底图 -->
                        <div>
                            {{ currentBasemap }}
                        </div>
                    </div>
                    <el-form :model="sceneForm" label-width="80px">
                        <el-form-item label="名字">
                            <el-input v-model="sceneForm.title" placeholder="请输入场景名"></el-input>
                        </el-form-item>
                        <el-form-item label="描述">
                            <el-input v-model="sceneForm.description" placeholder="请输入场景描述" :rows="4" type="textarea"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button @click="saveScene">保存</el-button>
                        </el-form-item>
                    </el-form>

                </el-tab-pane>

                <!-- 场景标签页 -->
                <el-tab-pane label="场景" name="scenes">
                    <div class="scene-list">
                        <div v-for="scene in scenes" :key="scene.id" class="scene-item" @click="loadScene(scene)">
                            {{ scene.name }}
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>

        <!-- 右侧地图容器 -->
        <div ref="mapContainer" class="map-container"></div>

        <!-- 添加图层对话框 -->
        <el-dialog v-model="showLayerDialog" title="添加图层">
            <div class="data-list">
                <div v-for="data in availableData" :key="data.id" class="data-item" @click="addToMap(data)">
                    {{ data.title }}
                </div>
            </div>
            <template #footer>
                <el-button @click="saveScene">保存场景</el-button>
            </template>
        </el-dialog>
        <el-dialog v-model="showBasemapDialog" title="添加图层">
            <div class="data-list">
                <div v-for="data in basemapData" :key="data.id" class="data-item" @click="changeBasemap(data)">
                    {{ data.title }}
                </div>
            </div>
            <template #footer>
                <el-button @click="saveScene">保存场景</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, shallowRef,getCurrentInstance } from 'vue'
import Map from '@geoscene/core/Map'
import TileLayer from '@geoscene/core/layers/TileLayer';
import Basemap from "@geoscene/core/Basemap.js";
import SceneView from "@geoscene/core/views/SceneView.js";
import FeatureLayer from '@geoscene/core/layers/FeatureLayer'
import SpatialReference from "@geoscene/core/geometry/SpatialReference";
import MapImageLayer from '@geoscene/core/layers/MapImageLayer';
import IntegratedMesh3DTilesLayer from "@geoscene/core/layers/IntegratedMesh3DTilesLayer.js";
import Ground from "@geoscene/core/Ground.js";
import ElevationLayer from "@geoscene/core/layers/ElevationLayer.js";

// 地图相关
const mapContainer = ref(null)
let map = null
let view = null
const currentLayers = ref([])
const currentBasemap = ref('')
// 场景管理
const scenes = ref([])
const activeTab = ref('layers')
const showLayerDialog = ref(false)
const showBasemapDialog = ref(false)

// 场景名和描述
const sceneForm = ref({
    title: "",
    description: "",
});

// 模拟可用数据源
const availableData = ref([
    {
        id: '1',
        title: '网格数据',
        type: 'image',
        url: 'http://218.85.80.179:6080/arcgis/rest/services/csskpt/grid_cangshan/MapServer'
    },
    {
        id: '2',
        title: 'POI数据',
        type: 'feature',
        url: 'http://218.85.80.179:6080/arcgis/rest/services/csskpt/poi_cangshan/MapServer'
    },
    {
        id: '3',
        title: '路网数据',
        type: 'feature',
        url: 'http://218.85.80.179:6080/arcgis/rest/services/csskpt/Road_cangshan/MapServer'
    },
    {
        id: '4',
        title: '连江Mesh',
        type: 'mesh',
        url: 'http://218.85.80.179:3690/3dtiles/连江县定海湾/tileset.json'
    },
])

const basemapData = ref([
    {
        id: '1',
        mapUrl: 'https://ds.fzkcy.com/arcgis/rest/services/tilemap/%E5%BD%B1%E5%83%8F%E5%BA%95%E5%9B%BE_CGCS2000_2021/MapServer',
        annoUrl: 'https://ds.fzkcy.com/arcgis/rest/services/tilemap/%E5%BD%B1%E5%83%8F%E5%BA%95%E5%9B%BE%E6%B3%A8%E8%AE%B0_CGCS2000_2021/MapServer',
        title: '影像底图'
    },
    {
        id: '2',
        mapUrl: 'https://ds.fzkcy.com/arcgis/rest/services/tilemap/%E7%9F%A2%E9%87%8F%E5%BA%95%E5%9B%BE_CGCS2000_2021/MapServer',
        annoUrl: 'https://ds.fzkcy.com/arcgis/rest/services/tilemap/%E7%9F%A2%E9%87%8F%E5%BA%95%E5%9B%BE%E6%B3%A8%E8%AE%B0_CGCS2000_2021/MapServer',
        title: '矢量底图'
    }
])
// 初始化地图
onMounted(() => {

    const mapLayer = new TileLayer({
        url: basemapData.value[0].mapUrl,
    });
    const referLayer = new TileLayer({
        url: basemapData.value[0].annoUrl,
    });
    const basemap = new Basemap({
        baseLayers: mapLayer,
        referenceLayers: referLayer,
        title: basemapData.value[0].title,
    });

    const worldElevation = new ElevationLayer({
        url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
        spatialReference: { wkid: 3857 },
    });

    map = new Map({
        basemap: basemap,
        // ground: new Ground({ layers: [ worldElevation ]})
    })
    currentBasemap.value = basemapData.value[0].title
    view = new SceneView({
        container: mapContainer.value,
        map: map,
        center: [119.32, 26.02],
        zoom: 10
    })
})

// 添加图层到地图
const addToMap = (data) => {
    let layer
    switch (data.type) {
        case 'feature':
            layer = new FeatureLayer()
            break
        case 'image':
            layer = new MapImageLayer();
            break
        case 'mesh':
            layer = new IntegratedMesh3DTilesLayer()
        default:
            console.log("无效的输入");
    }
    layer.url = data.url
    layer.id = data.id
    layer.title = data.title
    map.add(layer)

    console.log(map.layers, map.allLayers)

    layer.when(() => {

        const extent = layer.fullExtent;
        view.goTo({
            target: extent,
            zoom: 13
        });
    });


    currentLayers.value.push({
        id: data.id,
        title: data.title,
    })

    showLayerDialog.value = false
}


const changeBasemap = (data) => {

    const mapLayer = new TileLayer({
        url: data.mapUrl,
    });
    const referLayer = new TileLayer({
        url: data.annoUrl,
    });
    const basemap = new Basemap({
        baseLayers: mapLayer,
        referenceLayers: referLayer,
        // title: data.title,
    });
    mapLayer.load().then(() => {
        const spatialReference = new SpatialReference({
            wkid: mapLayer.spatialReference.wkid
        });

        view.spatialReference = spatialReference
    });

    map.basemap = basemap
    currentBasemap.value = data.title
    showBasemapDialog.value = false
    // 
}
// 
const removeLayer = (id) => {

    const layer = map.findLayerById(id)

    map.remove(layer)
    currentLayers.value = currentLayers.value.filter(layer => layer.id !== id);

}

// 保存场景
const saveScene = async () => {
    
    if (sceneForm.value.name !== '') {
        console.log('当前视角信息:', view.camera);

        // scenes.value.push({
        //     id: Date.now(),
        //     name: sceneName,
        //     layers: currentLayers.value.map(l => ({
        //         title: l.title,
        //         url: l.layer.url,
        //         visible: l.layer.visible
        //     }))
        // })
        // currentLayers.value = []
        // showDialog.value = false
    }
}

// 加载场景
const loadScene = (scene) => {
    // 清空当前图层
    map.removeAll()

    // 添加场景中的图层
    scene.layers.forEach(layerConfig => {
        const layer = new FeatureLayer({
            url: layerConfig.url,
            title: layerConfig.title,
            visible: layerConfig.visible
        })
        map.add(layer)
    })
}
</script>

<style scoped>
.container {
    display: flex;
    height: 100vh;
}

.left-panel {
    width: 300px;
    padding: 20px;
    border-right: 1px solid #eee;
}

.map-container {
    flex: 1;
}

.data-list {
    display: grid;
    gap: 10px;
}

.data-item {
    padding: 10px;
    border: 1px solid #eee;
    cursor: pointer;
}

.data-item:hover {
    background-color: #f5f7fa;
}

.scene-list {
    margin-top: 10px;
}

.scene-item {
    padding: 10px;
    margin: 5px 0;
    border: 1px solid #eee;
    cursor: pointer;
}

.scene-item:hover {
    background-color: #f5f7fa;
}
</style>