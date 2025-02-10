import axios from 'axios';
import { Api } from './api';
import { jsonToUrlParam } from './functions';

export const Requests = {
    authFailedResult: { code: 'E409014', message: 'auth failed' },
    /**
     * 组合 header 数据
     * @param {*} params {extraHeader, withAuth}
     * @returns Json Object
     */
    headers: (params) => {
        const extraHeader = params.extraHeader ? params.extraHeader : {};

        const headerData = {
            ...extraHeader,
            'Content-Type': 'application/json; charset=utf8'
        }

        if (params.withAuth) {
            let token;
            try {
                token = JSON.parse(localStorage.getItem('token'));
            } catch (e) {
                console.log(e);
                token = null;
            }
            const access_token = token ? token.access_token : '';
            const authorization = 'Bearer ' + access_token;

            headerData['Authorization'] = authorization;
        }

        /** redux中获取语言包设置信息（cn,jp,en） */
        if (!params.withoutLocale) {
            let locale = localStorage.getItem('locale');
            if (!locale) {
                locale = 'cn';
            }
            headerData['Locale'] = locale;
        }

        return headerData;
    },

    /**
     * refresh token 认证失败，删除 token 等数据后跳转到登录页面
     */
    authFailed: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('menu');
        window.location.href = window.location.origin + '/#/login';
    },

    /**
     * 用 refresh_token 重新请求 access_token，并保存在 localStorage
     */
    refreshToken: async () => {
        let token;
        try {
            token = JSON.parse(localStorage.getItem('token'));
        } catch (e) {
            console.log(e);
            token = null;
        }

        if (!token || !token.refresh_token) {
            Requests.authFailed();
            return false;
        }

        const refreshRes = await axios.post(
            Api.refresh_token,
            { refresh_token: token.refresh_token },
            { headers: Requests.headers({ extraHeader: {}, withAuth: false }) }
        );

        const refreshData = refreshRes.data;

        if (refreshData.code !== '') {
            Requests.authFailed();
            return false;
        }

        localStorage.setItem('token', JSON.stringify(refreshData.result.token));

        return true;
    },

    /**
     * GET 模式请求 api
     * @param {*} params {url, headers, withAuth}
     * @returns Json Object
     */
    get: async (params, depth = 0) => {
        //递归深度保护，递归2次后就中断请求
        if (depth++ > 1) return Requests.authFailedResult;

        //url参数组合
        let url = params.url;
        if (params.datas) {
            url += '?' + jsonToUrlParam(params.datas)
        }

        const result = await axios.get(
            url,
            {
                headers: Requests.headers({
                    extraHeader: params.headers,
                    withAuth: params.withAuth,
                    withoutLocale: params.withoutLocale,
                })
            }
        );

        const datas = result.data;

        if (datas.code === 'E409014') {//code 为 E409014 表示 access_token 无效，需要用 refresh_token 重新请求 access_token
            const refreshRes = await Requests.refreshToken();
            return refreshRes ? await Requests.get(params, depth) : Requests.authFailedResult;
        }

        return datas;
    },

    /**
     * POST 模式请求 api
     * @param {*} params {url, datas, headers, withAuth}
     * @returns Json Object
     */
    post: async (params, depth = 0) => {
        //递归深度保护，递归2次后就中断请求
        if (depth++ > 1) return Requests.authFailedResult;

        const result = await axios.post(
            params.url,
            params.datas,
            { headers: Requests.headers({ extraHeader: params.headers, withAuth: params.withAuth }) }
        );

        const datas = result.data;

        if (datas.code === 'E400101') {//code 为 E409014 表示 access_token 无效，需要用 refresh_token 重新请求 access_token
            const refreshRes = await Requests.refreshToken();
            return refreshRes ? await Requests.post(params, depth) : Requests.authFailedResult;
        }

        return datas;
    },

    /**
     * PUT 模式请求 api
     * @param {*} params {url, datas, headers, withAuth}
     * @returns Json Object
     */
    put: async (params, depth = 0) => {
        //递归深度保护，递归2次后就中断请求
        if (depth++ > 1) return Requests.authFailedResult;

        const result = await axios.put(
            params.url,
            params.datas,
            { headers: Requests.headers({ extraHeader: params.headers, withAuth: params.withAuth }) }
        );

        const datas = result.data;

        if (datas.code === 'E409014') {//code 为 E409014 表示 access_token 无效，需要用 refresh_token 重新请求 access_token
            const refreshRes = await Requests.refreshToken();
            return refreshRes ? await Requests.put(params, depth) : Requests.authFailedResult;
        }

        return datas;
    },

    /**
     * DELETE 模式请求 api
     * @param {*} params {url, datas, headers, withAuth}
     * @returns Json Object
     */
    delete: async (params, depth = 0) => {
        //递归深度保护，递归2次后就中断请求
        if (depth++ > 1) return Requests.authFailedResult;

        const param = params.datas ? params.datas : {}
        const result = await axios.delete(
            params.url,
            {
                data: param,
                headers: Requests.headers({ extraHeader: params.headers, withAuth: params.withAuth })
            }
        );

        const datas = result.data;

        if (datas.code === 'E409014') {//code 为 E409014 表示 access_token 无效，需要用 refresh_token 重新请求 access_token
            const refreshRes = await Requests.refreshToken();
            return refreshRes ? await Requests.delete(params, depth) : Requests.authFailedResult;
        }

        return datas;
    }
}