<template>
    <div style="height: 100%; width: 100%;">
        <div ref="mapContainer" class="map-container"></div>
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
import { Plus,More,Delete,Edit } from '@element-plus/icons-vue'
import { getBaseMap,getAvailableData,getSceneData,saveSceneData,delScene,getScene,getGlbData } from '../../api/map'
import SimpleLineSymbol from "@geoscene/core/symbols/SimpleLineSymbol.js";
import SimpleMarkerSymbol from "@geoscene/core/symbols/SimpleMarkerSymbol.js";
import { useRoute } from 'vue-router';
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

let sceneData = {}

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
    
    // 获取当前路由的查询参数
    const route = useRoute();
    const sceneUrl = route.query.sceneUrl;
    if(sceneUrl){
        await getScene({sceneUrl:sceneUrl}).then(res => {sceneData=res.data})
    }
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
        if(sceneData.id){
            loadScene(sceneData)
        }
    

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
            let symbol = {
                type: "mesh-3d",  // autocasts as new MeshSymbol3D()
                symbolLayers: [{
                    type: "fill",  // autocasts as new FillSymbol3DLayer()
                    material: {  }
                }]
            }
            mesh.transform= transform
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

<style>
.map-container {
    height: 100%;
    width: 100%;
}
</style>