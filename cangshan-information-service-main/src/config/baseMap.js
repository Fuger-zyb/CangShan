
import TileLayer from '@geoscene/core/layers/TileLayer';
import Basemap from "@geoscene/core/Basemap.js"; 
import config from '@geoscene/core/config';
 
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
  export  const vectorBasemap = new Basemap({
        baseLayers: [vecMapLayer, vecAnnoLayer],
        title: '矢量电子地图',
        id: 'vector_basemap',
    });
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
 export   const imageBasemap = new Basemap({
        baseLayers: [imgMapLayer, imgAnnoLayer],
        title: '影像电子地图',
        id: 'image_basemap',
    });

    //  config.request.interceptors.push({
    //         urls: 'http://cim.efzcity.com:9653',
    //         before: function (params) {
    //             params.requestOptions.query = { 
    //                 ...params.requestOptions.query,
    //                 token: '12321',
    //             };
    //         }
    //     })