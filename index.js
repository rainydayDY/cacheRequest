/* !
 * networkRequest
 *
 * request网络请求
 *
 * @author dongyu
 * @version 1.0.0 2017/12/25
 * @version 1.0.1 2018/4/17
 */

import axios from 'axios';
import { MessageBox } from 'element-ui';
import router from '@/router';
import Cookies from 'js-cookie';
import store from '@/store';

// 创建axios实例
const request = axios.create({
    baseURL: process.env.BASE_API, // api的base_url
    timeout: 5000 // 请求超时时间
});

// request拦截器
request.interceptors.request.use(config => {
    // Do something before request is sent
    if (store.state.user.token) {
        config.headers.token = localStorage.getItem('TokenKey'); // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
    }
    return config;
}, error => {
    // Do something with request error
    Promise.reject(error);
});

// respone拦截器
request.interceptors.response.use(
    response => response,
    error => {
        console.log('err' + error);// for debug
        Message({
            message: error.message,
            type: 'error',
            duration: 5 * 1000
        });
        return Promise.reject(error);
 });


/**
 * 带缓存的request请求
 *
 * @param cacheName 缓存名称(必传)
 * @param cacheTime 缓存时间(单位: 毫秒)(必传)
 * @param settings 请求参数(必传){method: "get" | "post" | "put" | "delete" | "patch", url: string, params?: Object, data?: Object}
 * @param isNow 是否立即请求(true: 立即请求)(必传)
 * @param successCallback 成功回调函数(非必传)
 * @param failedCallback 失败回调函数(非必传)
 */
const handleRequest = (settings, successCallback, cacheName, cacheTime, flag) => {
    request(settings).then(response => {
        if (response.data.result === '100') {
            if (flag) {
                if (cacheTime < 0) cacheTime = 3600000;
                var result = { data: response.data, expiration: new Date().getTime() + cacheTime };
                localStorage.setItem(cacheName, JSON.stringify(result));
            }
            if (successCallback) {
                if (response.data.data || response.data.data === null) {
                    return successCallback(response.data.data);
                } else {
                    return successCallback(response.data);
                }
            }
        }
    });
};

const requestAndCache = function requestAndCache(cacheName, cacheTime, settings, isNow, successCallback, failedCallback) {
    if (typeof (cacheName) !== 'string' || typeof (cacheTime) !== 'number' || typeof (isNow) !== 'boolean') throw new Error('传入缓存参数类型错误');
    let data = localStorage.getItem(cacheName);
    if (data && !isNow) {
        data = JSON.parse(data);
        if (parseInt(data.expiration) - new Date().getTime() > 3000) {
            if (successCallback) successCallback(data.data.data);
            return;
        }
    }
    // 当前请求为请求缓存，但是缓存中没有，需要去请求服务器
    handleRequest(settings, successCallback, cacheName, cacheTime, true);
};

/**
 * 网络请求
 *
 * @param settings 请求参数(必传){method: "get" | "post" | "put" | "delete" | "patch", url: string, params?: Object, data?: Object}
 * @param successCallback 成功回调函数(必传)
 * @param cacheParams 缓存对象(非必传){cacheName: 缓存名称, cacheTime: 缓存时间, isNow: 是否立即重新请求}
 * @param failedCallback 失败回调函数(非必传)
 */
const networkRequest = function networkRequest(settings, successCallback, cacheParams, failedCallback) {
    if (typeof (settings) !== 'object' || typeof (successCallback) !== 'function' || (cacheParams && typeof (cacheParams) !== 'object')) throw new Error('参数错误');
    if (!settings.url) throw new Error('缺少url参数');
    if (settings.method === 'get') {
        // 解决IE不刷新则不请求的BUG;
        settings.params = {
            ...settings.params,
            time: new Date().getTime()
        };
        if (cacheParams) {
            requestAndCache(cacheParams.cacheName, cacheParams.cacheTime, settings, cacheParams.isNow, successCallback, failedCallback);
            return;
        }
    } else if (!settings.method) {
        throw new Error('缺少method参数');
    }

    handleRequest(settings, successCallback, null, null, false);
};
export default networkRequest;
