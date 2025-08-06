import { defineConfig } from 'vite'
import path from 'path';
import vue from '@vitejs/plugin-vue'
// https://vite.dev/config/
export default defineConfig({
  base: '/csfq',
  server: {
    host:'0.0.0.0',
    proxy: {
      '/afjd-service': {
        // target: 'http://127.0.0.1:9999', // 目标服务器地址
        target: 'http://192.168.8.228:10010', // 目标服务器地址
        changeOrigin: true, // 是否改变源地址
        rewrite: (path) => path.replace(/^\/afjd-service/, ''), // 重写路径
        // 可以配置更多选项，如 logLevel, timeout 等
      },
      '/group1': {
        target: 'http://192.168.8.228:8989', // 目标服务器地址
        changeOrigin: true, // 是否改变源地址
        // 可以配置更多选项，如 logLevel, timeout 等
      },
      '/arcgis': {
        target: 'http://218.85.80.179:6080/arcgis',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/arcgis/, ''),
      },
    },
  },
  plugins: [
    vue(),
  ],
  build: {
    // 输出路径
    outDir: path.join("./dist/csfq", '/'),
    // 小于此阈值的导入或引用资源将内联为 base64 编码， 以避免额外的http请求， 设置为 0, 可以完全禁用此项，
    assetsInlineLimit: 4096,
    // 启动 / 禁用 CSS 代码拆分
    cssCodeSplit: true,
    // 构建后是否生成 soutrce map 文件
    sourcemap: false,
    // 自定义rollup-commonjs插件选项
    commonjsOptions: {
      include: /node_modules|packages/
    },
    // 自定义底层的 Rollup 打包配置
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
      }
    },

    // 设置为false 来禁用将构建好的文件写入磁盘
    write: true,
    // 默认情况下 若 outDir 在 root 目录下， 则 Vite 会在构建时清空该目录。
    emptyOutDir: true
  },
})
