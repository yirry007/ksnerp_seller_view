import { message } from "antd";
import { Requests } from "../utils/Request";
import { Api } from "../utils/api";

export const SupplierAction = {
    /** 获取商品资料，已被映射的商品，物流商等信息 */
    supplierInfo: async () => {
        const response = await Requests.get({
            url: Api.supplier_infos,
            withAuth: true
        });

        return response;
    },

    /** 获取采购信息的加密信息 */
    supplierEncrypted: async (market) => {
        const response = await Requests.get({
            url: Api.supplier_encrypted,
            datas: {market},
            withAuth: true
        });

        SupplierAction.supplierAuth(response);

        return response;
    },

    /** 账号密码授权供应商 */
    supplierAccountAuth: async (params) => {
        const response = await Requests.post({
            url: Api.supplier_account_auth,
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

    /** 取消平台授权 */
    supplierCancelAuth: async (params) => {
        const response = await Requests.post({
            url: Api.supplier_cancel_auth,
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

    /** 通过商品id获取采购商品详细 */
    supplierItem: async (itemId, market) => {
        const response = await Requests.get({
            url: Api.supplier_item(itemId),
            datas: {market},
            withAuth: true
        });

        SupplierAction.supplierAuth(response);

        if (response.code !== '') {
            message.error(response.message);
            return false;
        }

        return response;
    },

    /** 采购平台自动生成订单 */
    getAddress: async (market) => {
        const response = await Requests.get({
            url: Api.get_address,
            datas: {market},
            withAuth: true
        });

        SupplierAction.supplierAuth(response);

        if (response.code !== '') {
            message.error(response.message);
            return false;
        }

        return response;
    },

    /** 获取自动生成订单的商品列表以及他的库存 */
    orderItems: async (market) => {
        const response = await Requests.get({
            url: Api.order_items,
            datas: {market},
            withAuth: true
        });

        return response;
    },

    /** 采购平台自动生成订单 */
    createOrders: async (params) => {
        const response = await Requests.post({
            url: Api.create_orders,
            datas: params,
            withAuth: true
        });

        SupplierAction.supplierAuth(response);

        if (response.code !== '') {
            message.error(response.message);
            return false;
        } else {
            message.success(response.message);
        }

        return response;
    },

    /** 采购平台授权重定向 */
    supplierAuth: (res) => {
        res.code === 'E301' && window.open(res.result);
    },
};