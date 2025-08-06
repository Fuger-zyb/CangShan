import { createRouter, createWebHistory,createWebHashHistory } from 'vue-router';

// 动态导入页面组件
const pages = import.meta.glob('../views/**/*.vue');

// const routes = Object.keys(pages).map((path) => {
//   // 提取文件名（去掉路径和后缀）
//   const fileName = path.match(/\/views\/(.*)\.vue$/)[1];
//   // 将路径转换为路由路径格式（例如：basemaps/AddBasemap -> /basemaps/add-basemap）
//   const routePath = `/${fileName.replace(/\//g, '/').toLowerCase()}`;

//   return {
//     path: routePath,
//     component: pages[path], // 动态加载组件
//     meta: { title: fileName.split('/').pop() }, // 使用文件名作为标题
//   };
// });
const routes = [
  // 底图管理
  {
    path: '/basemaps/add-default-map',
    component: () => import('../views/basemaps/AddDefaultMap.vue'),
    meta: { title: '天地图底图加载' },
  },
  {
    path: '/basemaps/add-web-basemap',
    component: () => import('../views/basemaps/AddWebMap.vue'),
    meta: { title: '平台底图加载' },
  },
  // 图层管理
  {
    path: '/layers/add-layer',
    component: () => import('../views/layers/AddLayer.vue'),
    meta: { title: '添加矢量图层' },

  },
  {
    path: '/layers/custom-style',
    component: () => import('../views/layers/CustomStyle.vue'),
    meta: { title: '图层样式设置' },
  },
  {
    path: '/layers/geojson-layer',
    component: () => import('../views/layers/GeoJsonLayer.vue'),
    meta: { title: 'GeoJson加载' },
  },
  {
    path: '/layers/wkt',
    component: () => import('../views/layers/Wkt.vue'),
    meta: { title: 'wkt数据加载' },
  },
  // 地图标绘服务
  {
    path: '/mapplotting/batch-edit',
    component: () => import('../views/mapPlotting/BatchEdit.vue'),
    meta: { title: '批量要素绘制' },
  },
  {
    path: '/mapplotting/feature-edit',
    component: () => import('../views/mapPlotting/FeatureEdit.vue'),
    meta: { title: '交互式要素绘制' },
  },
  {
    path: '/mapplotting/measure',
    component: () => import('../views/mapPlotting/Measure.vue'),
    meta: { title: '测量工具' },
  },
  {
    path: '/mapplotting/popup',
    component: () => import('../views/mapPlotting/Popup.vue'),
    meta: { title: 'popup弹窗' },
  },
  {
    path: '/mapplotting/marker',
    component: () => import('../views/mapPlotting/Marker.vue'),
    meta: { title: '点标注' },
  },
  {
    path: '/mapplotting/class-marker',
    component: () => import('../views/mapPlotting/UniqueValueMarker.vue'),
    meta: { title: '分类标注' },
  },
  {
    path: '/mapplotting/label',
    component: () => import('../views/mapPlotting/Label.vue'),
    meta: { title: '标签' },
  },
  // 地图控件
  {
    path: '/controls/zoom-and-scale',
    component: () => import('../views/controls/ZoomAndScale.vue'),
    meta: { title: '缩放和比例尺控件' },
  },
  {
    path: '/controls/navigation',
    component: () => import('../views/controls/Navigation2.vue'),
    meta: { title: '平移控件' },
  },
  {
    path: '/controls/overview-map',
    component: () => import('../views/controls/OverviewMap.vue'),
    meta: { title: '鹰眼控件' },
  },
  {
    path: '/controls/community',
    component: () => import('../views/controls/Community.vue'),
    meta: { title: '网格控件' },
  },
  {
    path: '/controls/custom',
    component: () => import('../views/controls/Custom.vue'),
    meta: { title: '自定义平移控件' },
},
  // 地理检索服务
  {
    path: '/search/search-POI',
    component: () => import('../views/search/searchPOI.vue'),
    meta: { title: 'POI检索' },
  },
  {
    path: '/search/search-POI-geometry',
    component: () => import('../views/search/searchPOIGeometry.vue'),
    meta: { title: '空间检索' },
  },
  {
    path: '/search/search-road',
    component: () => import('../views/search/SearchRoad.vue'),
    meta: { title: '路网检索' },
  },
  {
    path: '/search/search-region',
    component: () => import('../views/search/SearchRegion.vue'),
    meta: { title: '行政区划边界检索' },
  },
  {
    path: '/search/search-region-center',
    component: () => import('../views/search/SearchRegionCenter.vue'),
    meta: { title: '行政区划中心点检索' },
  },
  // 计算分析
  {
    path: '/calculate/create-buffer',
    component: () => import('../views/calculate/CreateBuffer.vue'),
    meta: { title: '缓冲区' },
  },
  {
    path: '/calculate/coordinate-conversion',
    component: () => import('../views/calculate/CoordinateConversion.vue'),
    meta: { title: '坐标转换' },
  },
  {
    path: '/calculate/coordinate-conversion2',
    component: () => import('../views/calculate/CoorConv.vue'),
    meta: { title: '单点坐标转换' },
  },
  // 数字孪生
  {
    path: '/model/add-glb',
    component: () => import('../views/model/AddGlb.vue'),
    meta: { title: '添加GLB/GLTF' },
  },
  {
    path: '/model/add-3dtiles',
    component: () => import('../views/model/AddTiles.vue'),
    meta: { title: 'GIS数据接入' },
  },
//   {
//     path: '/model/add-3dtiles-dynamic',
//     component: () => import('../views/model/AddTilesDynamic.vue'),
//     meta: { title: '测试动态添加3dtiles' }
//   },
  {
    path: '/model/add-baimo',
    component: () => import('../views/model/AddBaimo.vue'),
    meta: { title: '添加白模' },
  },
  {
    path: '/model/create-scene',
    component: () => import('../views/model/CreateScene.vue'),
    meta: { title: '创建场景' },
  },
  {
    path: '/model/scene-view',
    component: () => import('../views/model/SceneView.vue'),
    meta: { title: '场景预览' },
  },
  // 事件监听
  {
    path: '/event/event-listerner',
    component: () => import('../views/event/EventListener.vue'),
    meta: { title: '地图事件监听' },
  },
  {
    path: '/event/graphic-event',
    component: () => import('../views/event/GraphicEvent.vue'),
    meta: { title: '要素事件监听' },
  },
];

// 默认路由（可选）
routes.push({
  path: '/',
  redirect: '/basemaps/add-default-map', // 默认跳转到某个页面
});

const router = createRouter({
  history: createWebHistory('/csfq'),
  routes,
});

export default router;