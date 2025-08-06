<template>
  <div style="height: 100%; width: 100%;">
    <div id="map-container" ></div>
</div>
</template>

<script setup>
import { onMounted } from "vue";
import Map from "@geoscene/core/Map";
import MapView from '@geoscene/core/views/MapView'

onMounted(() => {
  const map = new Map({
  basemap: "tianditu-vector" // 底图图层服务
});

  const view = new MapView({
    map: map,
    center: [119.32, 26.02],
    zoom: 13,
    container: "map-container"
  });

})
</script>


<style scoped>
#map-container {
  width: 100%;
  height: 100%;
}
</style>
