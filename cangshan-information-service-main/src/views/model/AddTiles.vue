<template>
    <div style="height: 100%; width: 100%;">
        <div ref="mapView" class="map-container"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick,getCurrentInstance } from 'vue';
import TileLayer from '@geoscene/core/layers/TileLayer';
import Basemap from "@geoscene/core/Basemap.js";
import Map from "@geoscene/core/Map";
import SceneView from "@geoscene/core/views/SceneView.js";
import IntegratedMesh3DTilesLayer from "@geoscene/core/layers/IntegratedMesh3DTilesLayer.js";
import IntegratedMeshLayer from "@geoscene/core/layers/IntegratedMeshLayer.js";
import ElevationLayer from "@geoscene/core/layers/ElevationLayer.js";
import SceneLayer from "@geoscene/core/layers/SceneLayer.js";
import Ground from "@geoscene/core/Ground";
import config from '@geoscene/core/config';
import Layer from "@geoscene/core/layers/Layer.js";
import SpatialReference from "@geoscene/core/geometry/SpatialReference";
import geosceneId from "@geoscene/core/identity/IdentityManager.js";
import ServerInfo from "@geoscene/core/identity/ServerInfo.js";
import GeoJSONLayer from "@geoscene/core/layers/GeoJSONLayer.js";
const mapView = ref(null);
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
onMounted(() => {
    console.error(getCurrentInstance().appContext.config.globalProperties);
    
    // 矢量底图
    const vecMapLayer = new TileLayer({
        url: 'http://cim.efzcity.com:9653/tcloud/rest/services/BaseVector_CGCS2000/MapServer',
        id: 'vec_map_layer',
    });
    // 矢量底图注记
    const vecAnnoLayer = new TileLayer({
        url: 'http://cim.efzcity.com:9653/tcloud/rest/services/VectorAnnotation_CGCS2000/MapServer',
        id: 'vec_anno_layer',
    });

    // 矢量base 
    const vectorBasemap = new Basemap({
        baseLayers: [vecMapLayer, vecAnnoLayer],
        title: '矢量电子地图',
        id: 'vector_basemap',
    });


   //福州影像
    const imgMapLayer = new TileLayer({
        // url: 'http://cim.efzcity.com:9653/tcloud/rest/services/BaseImage_CGCS2000/MapServer',
        url: 'http://cim.efzcity.com:9653/tcloud/rest/services/BaseImage_CGCS2000/MapServer',
        id: 'img_map_layer',
    });
    //影像注记
    const imgAnnoLayer = new TileLayer({
        url: 'http://cim.efzcity.com:9653/tcloud/rest/services/ImageAnnotation_CGCS2000/MapServer',
        id: 'img_anno_layer',
    });

    // 影像base
    const imageBasemap = new Basemap({
        baseLayers: [imgMapLayer, imgAnnoLayer],
        title: '影像电子地图',
        id: 'image_basemap',
    });

    // 加载 ArcGIS API for JavaScript 模块
    const spatialReference = new SpatialReference({
        wkid: 3857
    });

    // 创建 IntegratedMesh3DTilesLayer 实例    mesh模型
    const mesh = new IntegratedMesh3DTilesLayer({
        url: 'https://izzmap.com/3dtiles/mesh/nldx/tileset.json',
        // url: 'https://ds.fzkcy.com/3dtiles/%E5%8F%B0%E6%B1%9FLOD3/YYH/JZY/tileset.json',
        title: '3dtiles 数据'
    });
    // 创建 IntegratedMesh3DTilesLayer 实例    精模 
    const jinmo = new IntegratedMesh3DTilesLayer({
        url: 'http://218.85.80.179:3690/3dtiles/台江局部LOD3/WYH/JZ/tileset.json',
        // url: 'https://ds.fzkcy.com/3dtiles/%E5%8F%B0%E6%B1%9FLOD3/YYH/JZY/tileset.json',
        title: '3dtiles321'
    });

    // 创建 IntegratedMesh3DTilesLayer 实例  白模
    const baimo = new IntegratedMesh3DTilesLayer({
        url: 'https://izzmap.com/gs/map/3dtiles/2024112267404b95b6b65feecba2333a_7047c5/tileset.json',
        title: '白模',
        elevationInfo :{
            // mode:'on-the-ground'
            // offset:10,
        }
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

         // 地形图
        const worldElevation = new ElevationLayer({
            url: "http://ds.fzkcy.com/arcgis/rest/services/ccskpt/terrain_fz_30m_cgcs2000/ImageServer",
        });


const Flayer = new GeoJSONLayer({
  // URL to the service
  url: "http://218.85.80.179:3690/3dtiles/%E4%BB%93%E5%B1%B1%E5%8C%BA.json",
  spatialReference: new SpatialReference({ wkid: 4490 }),
});

        // 创建 WebMap 实例并添加图层
        const map = new Map({
            // basemap: 'tianditu-vector', // 国家天地图
            // basemap: globalVectorBasemap, // 矢量底图
            basemap: globalImageBasemap, // 影像底图
            ground: new Ground({ layers: [ worldElevation ]}), // 地形数据
            layers: [baimo] // 添加三维模型
        });
        map.add(jinmo);
        // map.add(Flayer);
    //     baimo.on("layerview-create", function(event){
    //         console.log(event.layerView,'layerview-create');
    //         view.canvas.attributes[0].value = "width: 100%; height:100%; display:block;color:red"
    //         view.canvas.attributes[0].nodeValue = "width: 100%; height:100%; display:block;color:red"
    // });
        // map.add(mesh);
        // map.add(jinmo);
        // map.add(baimo);
        console.log(baimo,'111111111111');
        console.log(baimo.style,'111111111111');
        
        // 创建 SceneView 实例
        const view = new SceneView({
            container: mapView.value,
            map: map,
            // center: [118.8587, 26.2214],
            // center: [119.2598, 26.0398],
            // zoom: 15,
            // viewingMode: "local",
            //   spatialReference,
            camera: {
                position: {
                    x: 119.24710768082393,
                    y: 25.803507590235707,
                    z: 10425.959744638763,
                },
                heading: 17.177181065500992,
                tilt: 68.53908340770785
                }
        });
        
        // view.when(()=>{
        //         view.on("click", function(event){
        //     console.log(event,'click');
        //     console.log(view.camera,'click');
        //     });
        //     baimo.when().then(function () {
        //         baimo.destroy('portalItem')
        //         // view.goTo(mesh.fullExtent.center);
        //     })
        // })
    
        console.log(view)
    })
    .catch(function (error) {
        
    })
    
   
});
// import WebScene from "@geoscene/core/WebScene.js";
//   onMounted(() => {
//     const webscene = new Map({
//         basemap: 'tianditu-vector'
//         });

//         /*************************************
//          * Create IntegratedMesh3DTilesLayer layer
//          * and add it to the webscene
//          ***********************************/
//         const layer = new IntegratedMesh3DTilesLayer({
//           url: "https://tiles.arcgis.com/tiles/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Utrecht_3D_Tiles_Integrated_Mesh/3DTilesServer/tileset.json",
//           title: "Utrecht Integrated Mesh 3D Tiles"
//         });

//         webscene.add(layer);

//         /*************************************
//          * Create the View and add expandable
//          * LayerList and Legend widgets to the UI
//          ***********************************/
//         const view = new SceneView({
//           container: mapView.value,
//           map: webscene
//         });
//   })





</script>

<style>
.map-container {
    height: 100%;
    width: 100%;
}
</style>