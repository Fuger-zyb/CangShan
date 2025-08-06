<template>
  <div class="aside-container">

    <el-aside class="el-aside">
      <el-scrollbar>
        <el-menu :default-openeds="openedMenus" :default-active="activeIndex" @select="handleSelect">
          <!-- 动态生成一级目录 -->
          <el-sub-menu v-for="(subMenu, index) in menuData" :key="index" :index="subMenu.name">
            <template #title>
              <el-icon><icon-menu /></el-icon>
              <span>{{ subMenu.name }}</span>
            </template>
            <!-- 动态生成二级目录 -->
             <template v-for="item in subMenu.children">
            <el-menu-item  :key="item.path" :index="item.path" v-if="item.meta.title!=='场景预览'">
              <span >{{ item.meta.title }}</span>
            </el-menu-item>
            </template>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>


  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Menu as IconMenu } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

// 获取路由配置
const routes = router.getRoutes();

// 一级目录名称映射
const firstLevelNameMap = {
  basemaps: '底图管理',
  layers: '图层管理',
  mapplotting: '地图标绘服务',
  controls: '地图控件',
  search: '地理检索服务',
  calculate: '计算分析服务',
  event: '事件监听',
  model: '数字孪生服务',
};

// 自动生成菜单数据
const menuData = computed(() => {
  const menuMap = {};

  routes.forEach((route) => {
    if (route.meta.title) {
      const pathParts = route.path.split('/').filter(Boolean); // 拆分路径
      if (pathParts.length >= 2) {
        const [firstLevel, secondLevel] = pathParts;

        // 初始化一级目录
        if (!menuMap[firstLevel]) {
          menuMap[firstLevel] = {
            name: firstLevelNameMap[firstLevel] || firstLevel, // 使用映射后的名称
            children: [],
          };
        }

        // 添加二级目录
        menuMap[firstLevel].children.push({
          path: route.path,
          meta: route.meta, // 包含自定义标题
        });
      }
    }
  });

  return Object.values(menuMap);
});

// 默认展开的一级目录
const openedMenus = computed(() => {
  return menuData.value.map((subMenu) => subMenu.name);
});

// 当前激活的菜单项
const activeIndex = computed(() => route.path);

// 处理菜单点击
const handleSelect = (path) => {
  router.push(path);
};
</script>

<style scoped>
.aside-container {
  height: 100%;
}

.el-aside {
  height: 100%;

}

.el-menu {
  border-right: none;
}
</style>