import { message } from "antd";
import { Requests } from "../utils/Request";
import { Api } from "../utils/api";

export const ItemAction = {
    /** 获取商品资料列表 */
    list: async (params, page, page_size) => {
        const market = params.market;
        const keyword = params.keyword;
        const is_depot = params.is_depot;
        const status = params.status;
        const query = {};

        if (market) {
            query['market'] = market;
        }
        if (keyword && keyword !== '') {
            query['keyword'] = keyword;
        }
        if (is_depot && is_depot !== '') {
            query['is_depot'] = is_depot;
        }
        if (status && status !== '') {
            query['status'] = status;
        }
        if (page) {
            query['page'] = page;
        }
        if (page_size) {
            query['page_size'] = page_size;
        }

        const response = await Requests.get({
            url: Api.item_list,
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** 发现新商品 */
    discover: async () => {
        const response = await Requests.post({
            url: Api.discover,
            withAuth: true
        });

        message.info(`Discover new items：${response.result} 个`);

        return response;
    },

    /** 获取商品资料，已被映射的商品，物流商等信息 */
    show: async (item_id) => {
        const response = await Requests.get({
            url: Api.item_show(item_id),
            withAuth: true
        });

        return response;
    },

    /** 更新商品资料数据 */
    update: async (item_id, params) => {
        const response = await Requests.put({
            url: Api.item_update(item_id),
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

    /** 更新商品资料图片 */
    updateItemImage: async (item_id, params) => {
        const response = await Requests.post({
            url: Api.update_item_image(item_id),
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

    /** 更新商品资料的待采购商品id */
    updateItemSupplyId: async (params) => {
        const response = await Requests.post({
            url: Api.update_item_supply_id,
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

    /** 修改商品状态 */
    changeStatus: async (item_id, params) => {
        const response = await Requests.post({
            url: Api.change_status(item_id),
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

    /** 合并商品资料 */
    merge: async (params) => {
        const response = await Requests.post({
            url: Api.item_merge,
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

    /** 获取附加采购商品 */
    supplyMore: async (supply_id) => {
        const response = await Requests.get({
            url: Api.supply_more(supply_id),
            withAuth: true
        });

        return response;
    },

    /** 附加采购商品数据更新 */
    updateSupplyMore: async (item_id, params, mode='') => {
        const response = await Requests.post({
            url: Api.update_supply_more(item_id, mode),
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

    /** 删除附加采购商品 */
    deleteSupplyMore: async (item_id, params={}, mode='') => {
        const response = await Requests.post({
            url: Api.delete_supply_more(item_id, mode),
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

    /** 获取待采购列表 */
    sourcing: async (params) => {
        const supply_type = params.supply_type;
        const source_status = params.source_status;
        const keyword = params.keyword;
        const query = {};

        if (supply_type) {
            query['supply_type'] = supply_type;
        }
        if (source_status) {
            query['source_status'] = source_status;
        }
        if (keyword && keyword !== '') {
            query['keyword'] = keyword;
        }

        const response = await Requests.get({
            url: Api.item_sourcing,
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** 采购商品自动映射 */
    mapItem: async () => {
        const response = await Requests.post({
            url: Api.map_item,
            withAuth: true
        });

        return response;
    },

    /** 根据item_id，获取可用的采购商品url */
    getSupplyUrl: async (item_id) => {
        const response = await Requests.get({
            url: Api.supply_url(item_id),
            withAuth: true
        });

        return response;
    },

    /** 重新映射商品 */
    remapItem: async (params) => {
        const response = await Requests.post({
            url: Api.remap_item,
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

    /** 采购助手添加附加采购商品 */
    addSupplyMore: async (params) => {
        const response = await Requests.post({
            url: Api.add_supply_more,
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

    /** 更新采购备注 */
    updateSupplyMemo: async (params) => {
        const response = await Requests.post({
            url: Api.update_supply_memo,
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

    /** 修改物流商/库存信息 */
    updateLogistic: async (params) => {
        const response = await Requests.post({
            url: Api.update_logistic,
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

    /** 修改物流选项信息 */
    updateShippingOption: async (params) => {
        const response = await Requests.post({
            url: Api.update_shipping_option,
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

    /** 获取待采购商品详细 */
    sourcingView: async (params) => {
        const response = await Requests.get({
            url: Api.item_sourcing_view,
            datas: params,
            withAuth: true
        });

        return response;
    },
};