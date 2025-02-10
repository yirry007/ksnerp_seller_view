import { message } from "antd";
import { Requests } from "../utils/Request";
import { Api } from "../utils/api";

export const UserAction = {
    /** 获取所有菜单（权限） */
    menu: async () => {
        const response = await Requests.get({
            url: Api.menu,
            withAuth: true
        });

        return response;
    },

    /** 获取店铺列表 */
    shops: async () => {
        const response = await Requests.get({
            url: Api.shops,
            withAuth: true
        });

        return response;
    },

    /** 获取用户列表 */
    list: async (params) => {
        const username = params.username;
        const is_use = params.is_use;
        const query = {};

        if (username && username !== '') {
            query['username'] = username;
        }
        if (is_use) {
            query['is_use'] = is_use;
        }

        const response = await Requests.get({
            url: Api.user_list,
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** 新增用户 */
    store: async (params) => {
        const response = await Requests.post({
            url: Api.user_store,
            datas: params,
            withAuth: true
        });

        if (response.code !== '') {
            message.error(response.message);
            return false;
        } else {
            message.success(response.message);
        }

        return response;
    },

    /** 获取用户可用的菜单（权限），用于表单中已勾选 */
    userMenu: async (user_id) => {
        const response = await Requests.get({
            url: Api.user_menu(user_id),
            withAuth: true
        });

        if (response.code !== '') {
            message.error(response.message);
            return false;
        }

        return response;
    },

    /** 获取用户可操作的店铺，用于表单中已勾选 */
    userShops: async (user_id) => {
        const response = await Requests.get({
            url: Api.user_shops(user_id),
            withAuth: true
        });

        if (response.code !== '') {
            message.error(response.message);
            return false;
        }

        return response;
    },

    /** 更新用户 */
    update: async (user_id, params) => {
        const response = await Requests.put({
            url: Api.user_update(user_id),
            datas: params,
            withAuth: true
        });

        if (response.code !== '') {
            message.error(response.message);
            return false;
        } else {
            message.success(response.message);
        }

        return response;
    },

    /** 删除用户 */
    delete: async (user_id) => {
        const response = await Requests.delete({
            url: Api.user_delete(user_id),
            withAuth: true
        });

        if (response.code !== '') {
            message.error(response.message);
            return false;
        } else {
            message.success(response.message);
        }

        return response;
    }
}