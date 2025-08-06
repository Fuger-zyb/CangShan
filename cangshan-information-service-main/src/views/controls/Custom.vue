<template>
    <div class="parent-container">
        <!-- 地图容器 -->
        <div ref="mapEl" class="map-view"></div>

        <el-card class="card">
          1：左移；
          2：下移；
          3：右移；
          5：上移
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted,getCurrentInstance } from 'vue';
import Map from '@geoscene/core/Map';
import MapView from '@geoscene/core/views/MapView';
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;
const mapEl = ref(null);
let view = null;

// 创建地图实例
onMounted(() => {
    const map = new Map({
    //   basemap: "tianditu-image", // 底图图层服务
      basemap:globalVectorBasemap });
    view = new MapView({
        map,
        center: [119.32, 26.02],
        zoom: 13,
        container: mapEl.value
    });

    
    window.addEventListener('keydown', handleKeyPress);
});

 // 平移参数配置
 const MOVE_STEP = 0.01;
  const DIRECTIONS = {
    '1': [-1, 0], 
    '2': [0, -1],
    '3': [1, 0],
    '5': [0, 1]
  };
  
  const handleKeyPress = (event) => {
    const direction = DIRECTIONS[event.key];
    // console.log("移动", a,direction, view)
    if (direction && view) {
      event.preventDefault();
      const [dx, dy] = direction.map(v => v * MOVE_STEP);
      view.goTo({
        center: [
          view.center.longitude + dx,
          view.center.latitude + dy
        ],
        duration: 300
      });
    }
  };

  onUnmounted(() => window.removeEventListener('keydown', handleKeyPress));
</script>

<style scoped>
.parent-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.map-view {
    width: 100%;
    height: 100%;
}

.card {
  position: absolute;
  top: 20px;
  right: 20px;
}
</style>