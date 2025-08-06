<template>
  <div style="height: 100%; width: 100%;">
    <div id="map-container"></div>
    <el-card class="grid">

      <div v-if="namesLoaded">
        <div class="dist">
            当前所在区域：{{ nowIn }}
            <!-- {{ grids[0].name }} -->
          </div>

        <!-- 第一部分：显示区和所有街道 -->

        <div v-for="(dist, index) in grids">
          <div class="street street-grid">
            <div class="belong-item" @click="goTo(dist.geometry, dist.name)">{{ dist.name }}：</div>
            <div class="items">
              <div class="item" @click="goTo(item.geometry, item.name)" v-for="(item, index) in dist.children" :key="'street-' + index">
                {{ item.name }}
              </div>
            </div>
          </div>


          <el-scrollbar height="400px">
            <div v-for="(street, index) in dist.children">
              <div class="street-grid">
                <div class="belong-item" @click="goTo(street.geometry, street.name)">{{ street.name }}：</div>
                <div class="items">
                  <div class="item" @click="goTo(community.geometry, community.name)" v-for="(community, index) in street.children" :key="'street-' + index">
                    {{ community.name }}
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>


      </div>
      <div v-else>加载中...</div>


    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, toRaw,getCurrentInstance } from 'vue';
import GeoMap from "@geoscene/core/Map";
import MapView from '@geoscene/core/views/MapView'
import FeatureLayer from '@geoscene/core/layers/FeatureLayer';
import MapImageLayer from '@geoscene/core/layers/MapImageLayer';
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
const namesLoaded = ref(false);

const loadError = ref(null)
const layerConfigs = [
  {
    id: 1,
    nameField: 'DISTNAME',        // 区名称字段
    type: 'district'
  },
  {
    id: 2,
    nameField: 'STREETNAME',       // 街道名称字段 
    belongField: 'BELONGTO', // 所属区字段
    type: 'street'
  },
  {
    id: 3,
    nameField: 'GRIDNAME',       // 社区名称字段
    belongField: 'BELONGTO', // 所属街道字段
    type: 'community'
  }
]

const grids = ref()


let view
onMounted(async () => {
  const map = new GeoMap({
    //   basemap: "tianditu-image", // 底图图层服务
      basemap:globalVectorBasemap
  });

  view = new MapView({
    map: map,
    center: [119.32, 26.02],
    zoom: 13,
    container: "map-container",
    constraints: {
    snapToZoom: false
  }
  });

  const featureLayer = new MapImageLayer({
    url: 'https://ds.fzkcy.com/arcgis/rest/services/ccskpt/grid_cangshan/MapServer',
    title: '网格',
  });

  // 将图层添加到地图
  map.add(featureLayer);
  // grids.value = fetchData()
  try {
    grids.value = await fetchData();
  } catch (error) {
    console.error('数据加载失败:', error);
  }
  console.log('grid', grids.value)

})


const fetchData = async () => {
  try {
    let districtTree = [];
    const districtsMap = new Map();  // {区名称: 区对象}
    const streetsMap = new Map();    // {街道名称: 街道对象}
    const communityMap = new Map();
    // 初始化加载完成标志
    namesLoaded.value = false;

    // 创建一个数组来存放中间数据
    const layersToProcess = layerConfigs.map(config => config.belongField);

    // 逐一处理每个图层
    for (const config of layerConfigs) {
      const layer = new FeatureLayer({
        url: `https://ds.fzkcy.com/arcgis/rest/services/ccskpt/grid_cangshan/MapServer/${config.id}`
      });

      const features = await layer.queryFeatures({
        where: "1=1",
        outFields: config.belongField ?
          [config.nameField, config.belongField] :
          [config.nameField],
        returnGeometry: true
      });

      // 按图层类型处理数据
      switch (config.id) {
        case 1: // 处理区
          
          features.features.forEach(f => {
            const districtName = f.attributes[config.nameField];
            console.log(f.geometry)
            districtsMap.set(districtName, {
              name: districtName,
              children: [],
              geometry: f.geometry
            });
          });
          break;

        case 2: // 处理街道
          features.features.forEach(f => {
            const streetName = f.attributes[config.nameField];
            const districtName = f.attributes[config.belongField];

            if (districtsMap.has(districtName)) {
              const streetObj = {
                name: streetName,
                children: [],
                geometry: f.geometry
              };
              districtsMap.get(districtName).children.push(streetObj);
              streetsMap.set(streetName, streetObj);
            } else {
              console.warn(`街道 ${streetName} 的所属区 ${districtName} 不存在`);
            }
          });
          break;

        case 3: // 处理社区
          features.features.forEach(f => {
            const communityName = f.attributes[config.nameField];
            const streetName = f.attributes[config.belongField];

            if (streetsMap.has(streetName)) {
              const communityObj = {
                name: communityName,
                geometry: f.geometry
              };
              
              streetsMap.get(streetName).children.push(communityObj);
              communityMap.set(communityName, communityObj)
            } else {
              console.warn(`社区 ${communityName} 的所属街道 ${streetName} 不存在`);
            }
          });
          break;
      }
    }

    // 转换树形结构
    districtTree = Array.from(districtsMap.values());
    namesLoaded.value = true;

    return districtTree; 
  } catch (error) {
    loadError.value = error;
    console.error('数据加载失败:', {
      error,
      details: error.details || {}
    });
    throw error;
  }
};

const nowIn = ref('仓山区')
const goTo = (geometry, name) => {

  view.goTo({
    target: toRaw(geometry),
  })
  nowIn.value = name
}
</script>


<style scoped>
#map-container {
  width: 100%;
  height: 100%;
}

.dist {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dacece;

  font-size: 12px;
  text-align: left;
}

.grid {
  position: absolute;
  top: 100px;
  right: 30px;
  width: 400px;
  /* height: 400px; */
}

.street {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dacece;
}

.street-grid {
  display: flex;
  flex-direction: row;
  text-align: left;
}

.belong-item {
  margin-top: 5px;
  color: #3d6dcc;
  font-size: 12px;
  cursor: pointer;
  font-weight: 700;
  display: inline-block;
  width: 75px;
}

.items {
  flex: 1;

}

.item {
  margin: 3px;
  display: inline-block;
  color: #3d6dcc;
  font-size: 12px;
  cursor: pointer;

}
</style>