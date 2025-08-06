<template>

</template>
  
  <script setup>
  import { inject, onMounted, onUnmounted } from 'vue';
  
  // 注入父组件的地图视图
  const view = inject('mapView');

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
    console.log("移动", a,direction, view)
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
  
  // 事件监听
  onMounted(() => window.addEventListener('keydown', handleKeyPress));
  onUnmounted(() => window.removeEventListener('keydown', handleKeyPress));
  </script>
  