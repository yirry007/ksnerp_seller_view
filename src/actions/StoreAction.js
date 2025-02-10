import { message } from "antd";
import { Requests } from "../utils/Request";
import { Api } from "../utils/api";

export const StoreAction = {
    /** 获取库存商品信息 */
    storeInfo: async (params, page) => {
        const keyword = params.keyword;
        const query = {};

        if (keyword && keyword !== '') {
            query['keyword'] = keyword;
        }
        if (page) {
            query['page'] = page;
        }

        const response = await Requests.get({
            url: Api.store_info,
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** 取商品SKU key */
    getSkuKeys: async (params) => {
        const response = await Requests.get({
            url: Api.get_sku_keys,
            datas: params,
            withAuth: true
        });

        return response;
    },

    /** 获取物流商信息 */
    getLogistics: async () => {
        const response = await Requests.get({
            url: Api.get_logistics,
            withAuth: true
        });

        return response;
    },

    /** 获取申请入库中的商品 */
    storeRequesting: async () => {
        const response = await Requests.get({
            url: Api.store_requesting,
            withAuth: true
        });

        return response;
    },

    /** 商品申请入库 */
    storeRequest: async (params) => {
        const response = await Requests.post({
            url: Api.store_request,
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

    /** 重新设置申请入库中的SKU数量 */
    updateRequesting: async (params) => {
        const response = await Requests.post({
            url: Api.update_requesting,
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

    /** 取消申请入库 */
    cancelRequesting: async (params) => {
        const response = await Requests.post({
            url: Api.cancel_requesting,
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

    /** 获取库存商品SKU列表 */
    getGoodsItems: async (itemId) => {
        const response = await Requests.get({
            url: Api.get_goods_items(itemId),
            withAuth: true
        });

        return response;
    },

    /** 删除库存商品 */
    storeGoodsDelete: async (id) => {
        const response = await Requests.post({
            url: Api.store_goods_delete(id),
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

    /** 库存商品添加到待出库清单 */
    addStoreOutList: async (storeGoodsItem) => {
        const response = await Requests.post({
            url: Api.add_store_out_list,
            datas: storeGoodsItem,
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

    /** 获取申请出库中的商品 */
    storeOutRequesting: async () => {
        const response = await Requests.get({
            url: Api.store_out_requesting,
            withAuth: true
        });

        return response;
    },

    /** 待出库清单 */
    storeOutList: async () => {
        const response = await Requests.get({
            url: Api.store_out_list,
            withAuth: true
        });

        return response;
    },

    /** 取消申请出库 */
    cancelOutRequesting: async (id) => {
        const response = await Requests.post({
            url: Api.cancel_out_requesting(id),
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

    /** 删除待出库清单 */
    deleteOutList: async (id) => {
        const response = await Requests.post({
            url: Api.delete_out_list(id),
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

    /** 商品申请出库 */
    storeOutRequest: async (params) => {
        const response = await Requests.post({
            url: Api.store_out_request,
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

    /** 根据sku获取商品信息 */
    getGoodsItemBySku: async (sku) => {
        const response = await Requests.get({
            url: Api.get_goods_item_by_sku(sku),
            withAuth: true
        });

        return response;
    },

    /** 商品申请出库 */
    storeTransfer: async (params) => {
        const response = await Requests.post({
            url: Api.store_transfer,
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

    /** 获取申请入库日志列表 */
    getStoreInLogs: async (params, page, page_size) => {
        const keyword = params.keyword;
        const query = {};

        if (keyword && keyword !== '') {
            query['keyword'] = keyword;
        }
        if (page) {
            query['page'] = page;
        }
        if (page_size) {
            query['page_size'] = page_size;
        }

        const response = await Requests.get({
            url: Api.store_in_logs,
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** 获取申请出库日志列表 */
    getStoreOutLogs: async (params, page, page_size) => {
        const keyword = params.keyword;
        const query = {};

        if (keyword && keyword !== '') {
            query['keyword'] = keyword;
        }
        if (page) {
            query['page'] = page;
        }
        if (page_size) {
            query['page_size'] = page_size;
        }

        const response = await Requests.get({
            url: Api.store_out_logs,
            datas: query,
            withAuth: true
        });

        return response;
    },
};