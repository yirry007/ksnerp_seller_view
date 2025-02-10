import { message } from "antd";
import { Requests } from "../utils/Request";
import { Api } from "../utils/api";
import { store } from '../redux/store';

export const LoginAction = {
    /**
     * 管理员登录
     * @param {*} params {username, password}
     * @returns 
     */
    auth: async (params) => {
        const username = params.username;
        const password = params.password;

        if (username === '') {
            message.error('请输入用户名');
            return false;
        }

        if (password === '') {
            message.error('请输入密码');
            return false;
        }

        const response = await Requests.post({
            url: Api.auth,
            datas: {username, password}
        });

        if (response.code !== '') {
            message.error(response.message);
            return false;
        }

        //保存 token 和 menu
        localStorage.setItem('token', JSON.stringify(response.result.token));
        localStorage.setItem('menu', JSON.stringify(response.result.menu));

        return response;
    },

    /**
     * 退出登录
     */
    logout: async () => {
        await Requests.post({
            url: Api.logout,
            withAuth: true
        });

        /** 删除 token 和用户权限（菜单） */
        localStorage.removeItem('token');
        localStorage.removeItem('menu');
        localStorage.removeItem('locale');
        localStorage.removeItem('lang');
        localStorage.removeItem('lang_update_timestamp');

        /** 删除店铺联动状态 */
        store.dispatch({
            type: 'set_shop_connection',
            payload: null
        });
    },

    /** 获取语言包，并保存redux */
    getLanguagePackage: async () => {
        const response = await Requests.get({
            url: Api.get_language_package
        });
        
        if (response.result) {
            localStorage.setItem('lang', JSON.stringify(response.result));
            localStorage.setItem('lang_update_timestamp', Date.now());
        }
    }
};