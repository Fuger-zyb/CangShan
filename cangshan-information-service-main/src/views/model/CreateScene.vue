<template>
    <div class="container">
        <!-- 左侧面板 -->
        <div class="left-panel">
            <el-tabs v-model="activeTab">
                <!-- 图层标签页 -->
                <el-tab-pane label="场景信息" name="layers">
                    <div class="scene-list">
                    <el-form :model="sceneForm" label-width="80px" :rules="rules" ref="sceneFormRef">
                        <el-form-item label="名字"  prop="sceneName">
                            <el-input v-model="sceneForm.sceneName" placeholder="请输入场景名"></el-input>
                        </el-form-item>
                        <el-form-item label="访问地址"  prop="sceneUrl">
                            <el-input v-model="sceneForm.sceneUrl" placeholder="请输入访问地址(任意字符)"></el-input>
                        </el-form-item>
                            <!-- 缩略图上传 -->
                        <el-form-item label="缩略图" prop="thumbnail">
                            <el-upload
                                class="avatar-uploader"
                                action="/group1/upload" 
                                accept="image/*"
                                :file-list="fileList"
                                :show-file-list="false"
                                :on-success="handleUploadSuccess"
                                :limit="1" 
                            >
                                <img v-if="imageUrl" :src="imageUrl" class="avatar" />
                                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                            </el-upload>
                        </el-form-item>
                        <el-form-item label="描述"  prop="sceneDesc">
                            <el-input v-model="sceneForm.sceneDesc" placeholder="请输入场景描述" :rows="4" type="textarea"></el-input>
                        </el-form-item>
                         <el-form-item label="底图" >
                            <div class="layer-list">
                            <!-- 已添加的底图 -->
                                <div>
                                    <img v-if="currentBasemap.thumbnail" :src="currentBasemap.thumbnail" style="width: 200px; height: 200px;" />
                                </div>
                                <div>
                                    当前底图：{{ currentBasemap.title }}<el-button @click="showBasemapDialog = true" size="small">修改</el-button>
                                </div>
                            </div>
                         </el-form-item>
                         
                        <div style="display: flex; justify-content: space-between; align-items: center;padding: 10px 0px;" >
                            <el-button style="text-align: left;" @click="showLayerDialog = true" >添加其他图层</el-button>
                        </div>
                    <div style="padding: 5px 0px;">
                        <!-- 已添加的图层列表 -->
                         <el-card style="max-width: 480px;height: auto;" body-style="padding: 3px;" v-if="currentLayers.length > 0">
                        <div v-for="layer in currentLayers" :key="layer.id" style="display: flex; 
                        justify-content: space-between; align-items: center;padding: 5px 0px;">
                            <span style="text-align: left;font-size: 14px;">{{ layer.title }}</span>
                              <el-popover :visible="visible" placement="bottom" width="80px" popper-style="min-width: 30px !important;">
                                <div style="text-align: left;margin-left: -10px;" @click="removeLayer(layer.id)" class="hover-div">
                                 <el-icon style="vertical-align: middle;"><Delete /></el-icon>
                                 <span>删除</span>
                                </div>
                                <div style="text-align: left;margin-left: -10px;margin-top: 10px;"  class="hover-div" 
                                @click="editLayer(layer)"
                                v-if="layer.type === 'feature'">
                                 <el-icon style="vertical-align: middle;"><Edit /></el-icon>
                                 <span>修改样式</span>
                                </div>
                                <template #reference>
                                <el-icon><More /></el-icon>
                                </template>
                            </el-popover>
                            <!-- <el-button >删除</el-button> -->
                        </div>
                        </el-card>
                    </div>
                    
                            <el-button @click="saveScene" style="margin-top: 50px;" type="primary">保存</el-button>
                    </el-form>
                    </div>
                    
                </el-tab-pane>
                <!-- 模型标签页 -->
                <el-tab-pane label="模型" name="models">
                    <el-tree :data="assets" node-key="id" default-expand-all :expand-on-click-node="false"
                        @node-click="handleNodeClick">
                        <!-- 自定义文件节点模板 -->
                        <template #default="{ node, data }" >
                            <span class="custom-node" >
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
                <!-- 场景标签页 -->
                <el-tab-pane label="场景管理" name="scenes">
                    <div class="scene-list">
                        <div v-for="scene in scenes" :key="scene.id" class="scene-item" @click="loadScene(scene)">
                            <el-descriptions :title="scene.sceneName" border 
                                    direction="vertical">
                                       <template #title>
                                        <div style="display: flex; justify-content: space-between; align-items: center; ">
                                        <span>{{ scene.sceneName }}</span>
                                        <el-icon @click="handleDelete($event,scene.id)" style="margin-left: 10px;">
                                            <Delete />
                                        </el-icon>
                                        </div>
                                    </template>
                                 <el-descriptions-item
                                    :width="20"
                                    label="缩略图"
                                    align="center"
                                    >
                                    <el-image
                                        style="width: 50px; height: 50px"
                                        :src="scene.thumbnail"
                                    />
                                    </el-descriptions-item>
                                <el-descriptions-item label="场景描述" >
                                    <div style="width: 90px;">
                                    <p style="word-wrap: break-word; white-space: normal;">{{ scene.sceneDesc}}</p>
                                    </div>
                                </el-descriptions-item>
                                <el-descriptions-item label="访问地址" >
                                    <div style="width: 60px;" @click="openNewWinodws($event,scene.sceneUrl)">
                                    <p style="word-wrap: break-word; white-space: normal;">{{ scene.sceneUrl}}</p>
                                    </div>
                                </el-descriptions-item>
                            </el-descriptions>
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
                
                        <el-row>
                <el-col v-for="data in availableData" :key="data.id" class="data-item" @click="addToMap(data)" :span="6">
                     <img v-if="data.thumbnail" :src="data.thumbnail" style="width: 100px; height: 100px;" />
                       <div>{{ data.title }}</div>

                </el-col>
                </el-row>
            </div>
            <template #footer>
                <!-- <el-button @click="saveScene">保存场景</el-button> -->
            </template>
        </el-dialog>
        <el-dialog v-model="showBasemapDialog" title="修改图层">
            <div class="data-list">
                        <el-row>

                <el-col v-for="data in basemapData" :key="data.id" class="data-item" @click="changeBasemap(data)" :span="12">
                     <img v-if="data.thumbnail" :src="data.thumbnail" style="width: 200px; height: 200px;" />
                            <!-- <el-col :span="12"> -->
                    <div>{{ data.title }}</div>
                    <!-- </el-col> -->
                </el-col>
                </el-row>
            </div>
            <template #footer>
                <!-- <el-button @click="saveScene">保存场景</el-button> -->
            </template>
        </el-dialog>

                <el-dialog v-model="editStyleDialog" title="修改样式">
            <div class="data-list">
                       <!-- 如果editLayerData的otherType是line ,那么有一个颜色选择器和 一个线宽输入框-->
                       <div v-if="editLayerData.otherType=='line'">
                        <el-row>
                        <el-col :span="12">
                        <el-form-item label="颜色">
                           <el-color-picker v-model="editLayerStyleData.color" show-alpha></el-color-picker>
                        </el-form-item>
                        </el-col>
                        <el-col :span="12">
                        <el-form-item label="线宽">
                           <el-input-number v-model="editLayerStyleData.width" :min="1" :max="10" :step="0.1" ></el-input-number>
                        </el-form-item>
                        </el-col>
                           </el-row>
                       </div>
                        <div v-if="editLayerData.otherType=='point'">
                        <el-row>
                        <el-col :span="12">
                        <el-form-item label="颜色">
                           <el-color-picker v-model="editLayerStyleData.color" show-alpha></el-color-picker>
                        </el-form-item>
                        </el-col>
                        <el-col :span="12">
                        <el-form-item label="点大小">
                           <el-input-number v-model="editLayerStyleData.size" :min="1" :max="10" :step="0.1" ></el-input-number>
                        </el-form-item>
                        </el-col>
                         <el-col :span="12">
                        <el-form-item label="边框颜色">
                           <el-color-picker v-model="editLayerStyleData.outlineColor" show-alpha></el-color-picker>
                        </el-form-item>
                        </el-col>
                        <el-col :span="12">
                        <el-form-item label="边框大小">
                           <el-input-number v-model="editLayerStyleData.outlineWidth" :min="1" :max="10" :step="0.1" ></el-input-number>
                        </el-form-item>
                        </el-col>
                        </el-row>
                       </div>
            </div>
            <template #footer>
                <el-button @click="saveStyle">保存样式</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, shallowRef,reactive,getCurrentInstance } from 'vue'
import Map from '@geoscene/core/Map'
import TileLayer from '@geoscene/core/layers/TileLayer';
import Basemap from "@geoscene/core/Basemap.js";
import SceneView from "@geoscene/core/views/SceneView.js";
import FeatureLayer from '@geoscene/core/layers/FeatureLayer'
import SpatialReference from "@geoscene/core/geometry/SpatialReference";
import MapImageLayer from '@geoscene/core/layers/MapImageLayer';
import IntegratedMesh3DTilesLayer from "@geoscene/core/layers/IntegratedMesh3DTilesLayer.js";
import Point from "@geoscene/core/geometry/Point";
import GraphicsLayer from "@geoscene/core/layers/GraphicsLayer";
import Mesh from "@geoscene/core/geometry/Mesh.js";
import SketchViewModel from "@geoscene/core/widgets/Sketch/SketchViewModel";
import Ground from "@geoscene/core/Ground.js";
import ElevationLayer from "@geoscene/core/layers/ElevationLayer.js";
import geosceneId from "@geoscene/core/identity/IdentityManager.js";
import ServerInfo from "@geoscene/core/identity/ServerInfo.js";
import config from '@geoscene/core/config';
import { ElMessage,ElMessageBox } from 'element-plus'
import { Plus,More,Delete,Edit,Folder, Document } from '@element-plus/icons-vue'
import { getBaseMap,getAvailableData,getSceneData,saveSceneData,delScene,getGlbData } from '../../api/map'
import SimpleLineSymbol from "@geoscene/core/symbols/SimpleLineSymbol.js";
import SimpleMarkerSymbol from "@geoscene/core/symbols/SimpleMarkerSymbol.js";
import { da } from 'element-plus/es/locales.mjs'
// 地图相关
const mapContainer = ref(null)
let map = null
let view = null
let placeModelAbortController = null;
let sketchViewModel
const currentLayers = ref([])
const currentBasemap = ref({})
const imageUrl = ref('')
const fileList = ref([])
// 场景管理
const scenes = ref([])
const activeTab = ref('layers')
const showLayerDialog = ref(false)
const showBasemapDialog = ref(false)
const editLayerData = ref({})
const editLayerStyleData = ref({})
const editStyleDialog = ref(false)
const assets = ref([])
const graphics = new GraphicsLayer();
    // 引用表单实例
const sceneFormRef = ref(null);
  // 表单验证规则
const rules = reactive({
    sceneName: [
        { required: true, message: '请输入场景名', trigger: 'blur' }
    ],
    sceneDesc: [
        { required: false, message: '请输入场景描述', trigger: 'blur' }
      ],
      thumbnail: [
        { required: true, message: '请上传缩略图', trigger: 'blur' }
      ],
      sceneUrl: [
        { required: true, message: '请上传缩略图', trigger: 'blur' }
      ]
});

// 场景名和描述
const sceneForm = ref({
    sceneName: '',
    sceneDesc: '',
    thumbnail:'',
    sceneUrl:''
});

// 模拟可用数据源
const availableData = ref()

const basemapData = ref()

function openNewWinodws(event, url){
    // 阻止事件冒泡，父元素的点击事件不会被触发
      event.stopPropagation();
    window.open("/csfq/model/scene-view?sceneUrl="+url, '_blank')
}
function editLayer(data){
    editLayerData.value = data
    editStyleDialog.value = true
    editLayerStyleData.value.layerId = data.id
    editLayerStyleData.value.otherType = data.otherType
    const layer = map.findLayerById(editLayerStyleData.value.layerId)
    // 根据layer类型获取样式
    if(editLayerStyleData.value.otherType == 'line'){
        // 如果layer.renderer.symbol.color的类型是colorrgba的对象，转为字符串
        
        //     debugger
        if(layer.renderer.symbol.color && layer.renderer.symbol.color.r ){
            editLayerStyleData.value.color = 
            'rgba(' + layer.renderer.symbol.color.r + ',' +
             layer.renderer.symbol.color.g + ',' + 
             layer.renderer.symbol.color.b + ',' + 
             layer.renderer.symbol.color.a + ')'
        }else{
            editLayerStyleData.value.color = layer.renderer.symbol.color
        }
        editLayerStyleData.value.width = layer.renderer.symbol.width
    }
    if(editLayerStyleData.value.otherType == 'point'){
         if(layer.renderer.symbol.color && layer.renderer.symbol.color.r!= undefined ){
            editLayerStyleData.value.color = 
            'rgba(' + layer.renderer.symbol.color.r + ',' +
             layer.renderer.symbol.color.g + ',' + 
             layer.renderer.symbol.color.b + ',' + 
             layer.renderer.symbol.color.a + ')'
        }else{
            editLayerStyleData.value.color = layer.renderer.symbol.color
        }
        
        editLayerStyleData.value.size = layer.renderer.symbol.size
        
        if(layer.renderer.symbol.outline.color && layer.renderer.symbol.outline.color.r!= undefined){
            editLayerStyleData.value.outlineColor = 
            'rgba(' + layer.renderer.symbol.outline.color.r + ',' +
             layer.renderer.symbol.outline.color.g + ',' + 
             layer.renderer.symbol.outline.color.b + ',' + 
             layer.renderer.symbol.outline.color.a + ')'
        }else{
            editLayerStyleData.value.outlineColor = layer.renderer.symbol.outline.color
        }
        editLayerStyleData.value.outlineWidth = layer.renderer.symbol.outline.width
    }
}

const addModel = async (folder, data) => {
    if(data.type == 'folder'){
        return
    }    
    placeModelAbortController?.abort();

    data.isLoading = true
    const { signal } = (placeModelAbortController = new AbortController());

    // Create mesh from the 3D building model.
    const mesh = await Mesh.createFromGLTF(
        new Point(),
        data.path,
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

function saveStyle(){
     const layer = map.findLayerById(editLayerStyleData.value.layerId)
     if(editLayerStyleData.value.otherType == 'line'){
        let renderer = 
            {
                type: "simple",
                symbol:{
                    type: "simple-line",  // autocasts as new SimpleLineSymbol()
                    color:  editLayerStyleData.value.color,
                    width: editLayerStyleData.value.width
            }
        }
        layer.renderer = renderer
     }
     if(editLayerStyleData.value.otherType == 'point'){
        let renderer = 
            {
                type: "simple",
                symbol:{
                    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                    color:  editLayerStyleData.value.color,
                    size: editLayerStyleData.value.size,
                    outline: {
                        color: editLayerStyleData.value.outlineColor,
                        width: editLayerStyleData.value.outlineWidth
                    }
            }
        }
        layer.renderer = renderer
     }
     editStyleDialog.value = false
}

function handleTabClick(tab, event) {
    editStyleDialog.value = false
}
function handleDelete(event,id) { 
    // 阻止事件冒泡，父元素的点击事件不会被触发
      event.stopPropagation();
       ElMessageBox.confirm('是否确定删除数据?')
    .then(() => {
      delScene({id:id}).then(res => {
        getSceneData().then(res => {scenes.value=res.data})
      })
    })
    
}
function handleUploadSuccess (response, file) {
    const fileUrl = response.split("?")[0]
    imageUrl.value = fileUrl
    sceneForm.value.thumbnail = fileUrl
    fileList.value = []
}
// 初始化地图
onMounted(async() => {
    await getBaseMap().then(res => {basemapData.value=res.data})
    await getAvailableData().then(res => {availableData.value=res.data})
    await getSceneData().then(res => {scenes.value=res.data})
    await getGlbData().then(res => {assets.value=res.data})
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

    let serverInfo = new ServerInfo({
          hasServer: true,
          server: "https://ds.fzkcy.com/arcgis/sharing/rest/services",
          tokenServiceUrl: "https://ds.fzkcy.com/arcgis/sharing/rest/generateToken",
        });
    
    let userInfo = {
          username: "cssk_dev",
          password: "cssk@123456",
        };

    geosceneId.generateToken(serverInfo,userInfo)
    .then((result)=>{
        // 获取token
        const { token, expires } = result;
        // 配置拦截器
        config.request.interceptors.push({
            urls: 'http://ds.fzkcy.com',
            before: function (params) {
                params.requestOptions.query = { 
                    ...params.requestOptions.query,
                    token: token,
                };
            }
        })

        const worldElevation = new ElevationLayer({
            url: "http://ds.fzkcy.com/arcgis/rest/services/ccskpt/terrain_fz_30m_cgcs2000/ImageServer",
        });

        map = new Map({
            basemap: basemap,
            ground: new Ground({ layers: [ worldElevation ]})
        })
        currentBasemap.value = basemapData.value[0]
        view = new SceneView({
            container: mapContainer.value,
            map: map,
            center: [119.32, 26.02],
            zoom: 10
        })
        map.add(graphics)
        sketchViewModel = new SketchViewModel({
                view: view,
                layer: graphics,
                tooltipOptions: { enabled: true }
            });

    })
    
})

// 添加图层到地图
const addToMap = (data) => {
    const oleLayer = currentLayers.value.find(layer => layer.id === data.id) 
    if(oleLayer){
        ElMessage({
            message: '该图层已存在',
            type: 'warning',
        })
        return
    }
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
    if(data.renderer){
        if(data.otherType == 'line'){
            let renderer = 
                {
                    type: "simple",
                    symbol:{
                        type: "simple-line",  // autocasts as new SimpleLineSymbol()
                        color:  data.renderer.symbol.color,
                        width: data.renderer.symbol.width
                }
            }
            layer.renderer = renderer
        }
        if(data.otherType == 'point'){
            let renderer = 
                {
                    type: "simple",
                    symbol:{
                        type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                        color:  data.renderer.symbol.color,
                        size: data.renderer.symbol.size,
                        outline: {
                            color: data.renderer.symbol.outline.color,
                            width: data.renderer.symbol.outline.width
                        }
                }
            }
            layer.renderer = renderer
        }
    }
    console.log(map.layers, map.allLayers)

    layer.when(() => {

        const extent = layer.fullExtent;
        view.goTo({
            target: extent,
            zoom: 13
        });
    });


    currentLayers.value.push(data)

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
    currentBasemap.value = data
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
    sceneFormRef.value.validate((valid) => {
        if (valid) {
            // 访问地址不可以重复
            const sceneData = scenes.value.find(scene => scene.sceneUrl === sceneForm.value.sceneUrl)
            if (sceneData) {
                ElMessage({
                    message: '场景访问地址已存在,请更换访问地址',
                    type: 'warning'
                })
                return
            }
          // 执行保存操作
          sceneForm.value.camera = JSON.stringify(view.camera)
          sceneForm.value.basemapId = currentBasemap.value.id
          // 遍历currentLayers，获取每个id
          const currentLayerIds = currentLayers.value.map(layer => layer.id)
          const renderers = []
          currentLayerIds.forEach((id) => {
              const layerData = map.findLayerById(id)
              const label = currentLayers.value.find(layer => layer.id === id)
              if(label.otherType === 'line' || label.otherType === 'point'){
                const renderer = layerData.renderer
                renderers.push(JSON.stringify(renderer))
              }else{
                renderers.push('null')
              }
          })
          sceneForm.value.availableRenderers = renderers.join('|||')
          sceneForm.value.availableIds = currentLayerIds.join(',')
          const modelList = sketchViewModel.layer.graphics.items
          let glbIds = []
          let glbTransform = []
          let glbOrigin = []
          if(modelList.length > 0){
            modelList.forEach((item) => {
                glbIds.push(item.geometry.allPlaceholder)
                glbTransform.push(JSON.stringify(item.geometry.transform))
                glbOrigin.push(JSON.stringify(item.geometry.vertexSpace.origin))
            })
          }
          if(glbIds.length > 0){
            sceneForm.value.glbIds = glbIds.join(',')
            sceneForm.value.glbTransform = glbTransform.join('|||')
            sceneForm.value.glbOrigin = glbOrigin.join('|||')
          }
          console.log('保存场景:', sceneForm.value);
          saveSceneData(sceneForm.value).then(res => {
            ElMessage({
                message: '添加成功',
                type: 'success',
            })
            sceneFormRef.value.resetFields()
            imageUrl.value = ''
            getSceneData().then(res => {scenes.value=res.data})
          })
          
        } else {
          console.log('表单验证失败！');
          return false;
        }
      });
    if (sceneForm.value.sceneName !== '') {
        console.log('当前视角信息:', view.camera);
        console.log('当前视角信息:', JSON.stringify(view.camera));

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
    currentLayers.value = []
    console.log('加载场景:', scene);
    const availableIds = scene.availableIds.split(',')
    const renderers = scene.availableRenderers.split('|||')
    const basemapId = scene.basemapId
    const glbIds = scene.glbIds.split(',')
    const glbTransform = scene.glbTransform.split('|||')
    const glbOrigin = scene.glbOrigin.split('|||')
    const camera = JSON.parse(scene.camera)
    const layers = []
    // availableData遍历availableIds，获取每个layer,并给layers附上renderer
    for(let i=0;i<availableIds.length;i++){
        const layer = availableData.value.find(layer => layer.id === availableIds[i])
        if(layer && renderers[i] !== 'null'){
            layer.renderer = JSON.parse(renderers[i])
            layers.push(layer)
        }
    }
   loadGltfScene(glbIds,glbTransform,glbOrigin)
    
    // 遍历currentLayers.value 执行 addToMap
    layers.forEach(layer => {
        addToMap(layer)
    })
    // 加载底图
    const basemap = basemapData.value.find(basemap => basemap.id === basemapId)
    changeBasemap(basemap)
    view.camera = camera

}
const loadGltfScene =  (glbIds,glbTransform,glbOrigin) => {
    view.graphics.removeAll()
    map.add(graphics)
    if(glbIds.length > 0){
        glbIds.forEach(async (id,index) => {
            const data = findAssetById(id, assets.value)
            const transform = JSON.parse(glbTransform[index])
            const origin = JSON.parse(glbOrigin[index])
            const mesh = await Mesh.createFromGLTF(
                new Point(
                    origin
                ),
                data.path,
            { vertexSpace: "local" } 
            );
            mesh.transform= transform
            let symbol = {
                type: "mesh-3d",  // autocasts as new MeshSymbol3D()
                symbolLayers: [{
                    type: "fill",  // autocasts as new FillSymbol3DLayer()
                    material: {  }
                }]
            }
              
            const graphic = {
                geometry: mesh,
                symbol: symbol
            };
            view.graphics.add(graphic);
        })
    }
}

 const findAssetById = (id, arr) => {
    // 遍历 assets 数组
    for (let asset of arr) {
        // 如果找到匹配的 id，则返回该对象
        if (asset.id === id) {
            return asset;
        }

        // 如果该资产是文件夹类型，则继续递归搜索子项
        if (asset.children) {
            const result = findAssetById(id, asset.children);
            if (result) {
                return result;
            }
        }
    }
    // 如果没有找到，则返回 null
    return null;
}
</script>

<style scoped>
 .hover-div {
    width: 80px;
 }

.hover-div:hover {
    cursor: pointer; /* 当鼠标移入时，光标变为小手 */
}
.avatar-uploader .avatar {
  width: 50px;
  height: 50px;
  display: block;
}
.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 50px;
  height: 50px;
  text-align: center;
}
.container {
    display: flex;
    height: 90vh;
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
    height: 80vh;
    overflow-y: auto;
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