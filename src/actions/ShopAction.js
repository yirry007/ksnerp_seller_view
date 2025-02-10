import { message } from "antd";
import { Requests } from "../utils/Request";
import { Api } from "../utils/api";

export const ShopAction = {
    /** 获取店铺列表 */
    list: async (params) => {
        const market = params.market;
        const shop_name = params.shop_name;
        const shop_id = params.shop_id;
        const query = {};

        if (market) {
            query['market'] = market;
        }
        if (shop_name && shop_name !== '') {
            query['shop_name'] = shop_name;
        }
        if (shop_id && shop_id !== '') {
            query['shop_id'] = shop_id;
        }

        const response = await Requests.get({
            url: Api.shop_list,
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** 检测单个店铺联动状态 */
    checkConnection: async (shop_id) => {
        const response = await Requests.post({
            url: Api.check_connection(shop_id),
            withAuth: true
        });

        return response;
    },

    /** 检测所有店铺的联动状态 */
    checkAllConnection: async () => {
        const response = await Requests.post({
            url: Api.check_all_connection,
            withAuth: true
        });

        if (response.code !== '') {
            message.error(response.message);
            return false;
        }

        return response;
    },

    /** 新增店铺 */
    store: async (params) => {
        const response = await Requests.post({
            url: Api.shop_store,
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

    /** 更新店铺 */
    update: async (shop_id, params) => {
        const response = await Requests.put({
            url: Api.shop_update(shop_id),
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

    /** 删除店铺 */
    delete: async (shop_id) => {
        const response = await Requests.delete({
            url: Api.shop_delete(shop_id),
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

    /** 获取邮件模板列表 */
    emailTemplates: async (market) => {
        const response = await Requests.get({
            url: Api.email_templates(market),
            withAuth: true
        });

        return response;
    },

    /** 获取店铺绑定的邮件模板 */
    shopEmailTemplates: async (shop_id) => {
        const response = await Requests.get({
            url: Api.shop_email_templates(shop_id),
            withAuth: true
        });

        if (response.code !== '') {
            message.error(response.message);
            return false;
        }

        return response;
    },
};