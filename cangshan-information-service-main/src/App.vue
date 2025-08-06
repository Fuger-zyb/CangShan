<template>
  <div :class="{'full-page': isFullPage}" class="common-layout">
    <el-container>
      <!-- 判断是否为全屏页面 -->
      <el-header v-if="!isFullPage" class="header">仓山区时空信息服务综合展示</el-header>

      <el-container class="content-container">
        <!-- 判断是否为全屏页面，不显示 Sidebar -->
        <el-aside v-if="!isFullPage" class="aside">
          <Sidebar />
        </el-aside>
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router'; // 导入 useRoute 来获取当前路由
import Sidebar from './components/Aside.vue';

const route = useRoute();

// 计算属性：判断是否为全屏页面
const isFullPage = computed(() => {
  return route.path === '/model/scene-view'; // 如果当前路由是 '/model/scene-view'，则为全屏页面
});
</script>

<style scoped>
.common-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.header {
  background-color: rgb(32, 127, 204);
  color: white;
  font-size: 30px;
  line-height: 60px;
}

.content-container {
  flex: 1;
}

.aside {
  height: calc(100vh - 60px);
}

.main {
  padding: 0 !important;
}

/* 全屏页面样式 */
.full-page {
  padding: 0;
  margin: 0;
  height: 100vh;
  width: 100vw;
}

.full-page .header {
  display: none; /* 隐藏头部 */
}

.full-page .aside {
  display: none; /* 隐藏侧边栏 */
}
</style>
