<template>
    <div class="container">
        <div id="map-container" ref="mapContainer"></div>
        <el-card class="conv-container">

            <el-row>
                <el-col :span="4">
                    <div class="label">上传文件：</div>
                </el-col>
                <el-col :span="20">
                    <input type="file" @change="handleFileUpload" />
                </el-col>


            </el-row>
            <el-row :gutter="6">
                <el-col :span="4">
                    <div class="label">x：</div>
                </el-col>
                <el-col :span="8">
                    <el-select v-model="xField" placeholder="选择X字段">
                        <el-option v-for="field in fields" :key="field" :label="field" :value="field" />
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <div class="label">y：</div>
                </el-col>
                <el-col :span="8">
                    <el-select v-model="yField" placeholder="选择Y字段">
                        <el-option v-for="field in fields" :key="field" :label="field" :value="field" />
                    </el-select>
                </el-col>

            </el-row>

            <el-row>
                <el-col :span="4">
                    <div class="label">当前坐标：</div>
                </el-col>
                <el-col :span="8">
                    <el-select v-model="inputSR" placeholder="选择输入坐标系">
                        <el-option label="墨卡托投影坐标系" value="3857" />
                        <el-option label="WGS84坐标系" value="4326" />
                        <el-option label="国家大地2000坐标系" value="4490" />
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <div class="label">转换坐标：</div>
                </el-col>
                <el-col :span="8">
                    <el-select v-model="outputSR" placeholder="选择输出坐标系">
                        <el-option label="墨卡托投影坐标系" value="3857" />
                        <el-option label="WGS84坐标系" value="4326" />
                        <el-option label="国家大地2000坐标系" value="4490" />
                    </el-select>
                </el-col>
            </el-row>

            <el-row justify="end">
                <el-button type="primary" @click="handleBatchProject">坐标转换</el-button>
                <el-button type="primary" v-if="batchResult" @click="downloadBatchResult">下载表格</el-button>
            </el-row>


            <div v-if="loading" class="status">转换中...</div>
            <div v-if="error" class="error">
                错误信息：{{ error }}
            </div>

            <el-table v-if="batchResult" border :data="batchResult" style="width: 100%; height: 300px;">
                <el-table-column v-for="field in fields" :key="field" :label="field" :prop="field" />
            </el-table>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted,getCurrentInstance } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Map from "@geoscene/core/Map";
import MapView from "@geoscene/core/views/MapView";
import GraphicsLayer from "@geoscene/core/layers/GraphicsLayer.js";
import Graphic from "@geoscene/core/Graphic";
import Point from "@geoscene/core/geometry/Point";
const globalProperties = getCurrentInstance().appContext.config.globalProperties;
const globalVectorBasemap = globalProperties.$vectorBasemap;
const globalImageBasemap = globalProperties.$imageBasemap;

const error = ref(null);
const loading = ref(false);
const batchResult = ref(null);
const xField = ref('');
const yField = ref('');
const fields = ref([]);
const originalFileName = ref('');
const inputSR = ref('4326'); // 默认输入坐标系为 WGS84
const outputSR = ref('4490'); // 默认输出坐标系为 国家大地2000
let view;
let graphicsLayer;

onMounted(() => {
    const map = new Map({ 
    //   basemap: "tianditu-image", // 底图图层服务
      basemap:globalVectorBasemap });
    view = new MapView({
        container: "map-container",
        map: map,
        center: [119.3229, 26.0754],
        zoom: 13,
    });

    graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);
});

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        originalFileName.value = file.name.split('.')[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                fields.value = Object.keys(json[0]);
                batchResult.value = json;
                console.log("excel结果", batchResult.value);
            } catch (err) {
                error.value = `解析Excel文件失败：${err.message}`;
            }
        };
        reader.readAsArrayBuffer(file);
    }
};

const handleBatchProject = async () => {
    error.value = null;
    loading.value = true;

    try {
        if (!batchResult.value || !xField.value || !yField.value) {
            throw new Error('请上传Excel文件并选择X和Y字段');
        }

        const points = batchResult.value.map(row => ({
            x: row[xField.value],
            y: row[yField.value],
        }));

        const url = '/arcgis/rest/services/Utilities/Geometry/GeometryServer/project';
        const params = new URLSearchParams();
        params.append('f', 'json');
        params.append('inSR', inputSR.value);
        params.append('outSR', outputSR.value);
        params.append('geometries', JSON.stringify({
            geometryType: 'esriGeometryPoint',
            geometries: points,
        }));
        params.append('transformForward', 'true');

        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log('服务响应:', response.data);

        if (!response.data.geometries || response.data.geometries.length === 0) {
            throw new Error('返回数据格式异常');
        }

        // 将原始数据和转换后的坐标合并
        batchResult.value = batchResult.value.map((row, index) => ({
            ...row,
            x: response.data.geometries[index].x,
            y: response.data.geometries[index].y,
        }));
        console.log("处理结果", batchResult.value);

        // 在地图上添加点
        addPointsToMap(response.data.geometries);
    } catch (err) {
        error.value = `转换失败：${err.message}`;
    } finally {
        loading.value = false;
    }
};

const addPointsToMap = (points) => {
    graphicsLayer.removeAll();

    points.forEach(point => {
        const graphic = new Graphic({
            geometry: new Point({
                x: point.x,
                y: point.y,
                spatialReference: { wkid: Number(outputSR.value) }
            }),
            symbol: {
                type: "simple-marker",
                color: [255, 0, 0],
                size: 10,
                outline: { color: [255, 255, 255], width: 1 },
            },
        });

        graphicsLayer.add(graphic);
    });

};

const downloadBatchResult = () => {
    if (!batchResult.value) {
        console.error('没有转换结果可下载');
        return;
    }

    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(batchResult.value);

    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '转换结果');

    // 导出文件
    const fileName = `${originalFileName.value}_coordinateConv.xlsx`;
    XLSX.writeFile(workbook, fileName);
};
</script>

<style scoped>
.container {
    position: relative;
    height: 100%;
    width: 100%;
}

#map-container {
    width: 100%;
    height: 100%;
}

.conv-container {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 20px;
    right: 20px;
    width: 500px;
}

.input-section {
    display: grid;
    gap: 10px;
    margin-bottom: 20px;
}

input {
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
}

.el-row {
    margin-bottom: 10px;
}

.label {
    color: #606266;
    font-size: 14px;
    line-height: 30px;
    text-align: right;
}


.error,
.status {
    padding: 15px;
    margin-top: 20px;
    border-radius: 4px;
}


.error {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
}

.status {
    background: #fff3cd;
    border: 1px solid #ffeeba;
    color: #856404;
}
</style>