import { message } from "antd";
import { Requests } from "../utils/Request";
import { Api } from "../utils/api";

export const OrderAction = {
    /** 获取订单列表 */
    list: async (params, page, page_size) => {
        const market = params.market;
        const shop_name = params.shop_name;
        const sh_shop_id = params.sh_shop_id;
        const keyword = params.keyword;
        const order_status = params.order_status;
        const shipment = params.shipment;
        const query = {};

        if (market) {
            query['market'] = market;
        }
        if (sh_shop_id && sh_shop_id !== '') {
            query['sh_shop_id'] = sh_shop_id;
        }
        if (shop_name && shop_name !== '') {
            query['shop_name'] = shop_name;
        }
        if (keyword && keyword !== '') {
            query['keyword'] = keyword;
        }
        if (order_status && order_status !== '') {
            query['order_status'] = order_status;
        }
        if (shipment && shipment !== '') {
            query['shipment'] = shipment;
        }
        if (page) {
            query['page'] = page;
        }
        if (page_size) {
            query['page_size'] = page_size;
        }

        const response = await Requests.get({
            url: Api.order_list,
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** 更新实时订单数据 */
    ordersUpdate: async () => {
        const response = await Requests.post({
            url: Api.orders_update,
            withAuth: true
        });

        return response;
    },

    /** 检测有没有正在执行的订单更新的后台进程 */
    checkOrderProcess: async () => {
        const response = await Requests.get({
            url: Api.check_order_process,
            withAuth: true
        });

        return response;
    },

    /** 获取某一订单信息 */
    show: async (order_id) => {
        const response = await Requests.get({
            url: Api.order_show(order_id),
            withAuth: true
        });

        return response;
    },

    /** 根据订单ID列表重新获取以店铺ID分组的 */
    orderConfirm: async (order_ids) => {
        const response = await Requests.get({
            url: Api.order_update_confirm,
            datas: {order_ids},
            withAuth: true
        });

        return response;
    },

    /** 更新订单状态 */
    update: async (params) => {
        const response = await Requests.put({
            url: Api.order_update,
            datas: params,
            withAuth: true
        });

        if (response.code !== '') {
            message.error(response.message);
            return false;
        } else {
            let successCount = 0;
            let failCount = 0;
            let msg = '';

            Object.keys(response.result).forEach(v => {
                if (response.result[v]['code'] === '') {
                    successCount++;
                } else {
                    failCount++;
                }
            });

            message.info(`SUCCESS：${successCount}，FAILED：${failCount}${msg}`);
        }

        return response;
    },

    /** 订单保留和还原 */
    orderReserve: async (order_id, params) => {
        const response = await Requests.post({
            url: Api.order_reserve(order_id),
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

    /** 订单取消 */
    orderCancel: async (order_id) => {
        const response = await Requests.post({
            url: Api.order_cancel(order_id),
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

    /** 获取某一订单信息和邮件模板信息 */
    emailSendLogsWithTemplates: async (order_id, type) => {
        const response = await Requests.get({
            url: Api.email_send_logs_with_templates(order_id, type),
            withAuth: true
        });

        return response;
    },

    /** 重新发送邮件 */
    resendEmail: async (order_id, template_id) => {
        const response = await Requests.post({
            url: Api.resend_email(order_id, template_id),
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

    /** 更新订单商品的采购，快递，物流等信息 */
    updateOrderItem: async (order_item_id, update_data) => {
        const response = await Requests.post({
            url: Api.update_order_item(order_item_id),
            datas: update_data,
            withAuth: true
        });

        return response;
    },

    /** 统一更新订单商品的采购，快递 */
    unityUpdateOrderItem: async (params) => {
        const response = await Requests.post({
            url: Api.unity_update_order_item,
            datas: params,
            withAuth: true
        });

        return response;
    },

    /** 更新国际物流的默认设置 */
    updateShippingData: async (order_item_id) => {
        const response = await Requests.post({
            url: Api.update_shipping_data(order_item_id),
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
    orderItemMore: async (id) => {
        const response = await Requests.get({
            url: Api.order_item_more(id),
            withAuth: true
        });

        return response;
    },

    /** 附加采购商品数据更新 */
    updateOrderItemMore: async (id, params) => {
        const response = await Requests.post({
            url: Api.update_order_item_more(id),
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

    /** 获取历史订单列表 */
    histories: async (params, page) => {
        const market = params.market;
        const sh_shop_id = params.sh_shop_id;
        const order_id = params.order_id;
        const order_status = params.order_status;
        const start_date = params.start_date;
        const end_date = params.end_date;
        const query = {};

        if (market) {
            query['market'] = market;
        }
        if (sh_shop_id && sh_shop_id !== '') {
            query['sh_shop_id'] = sh_shop_id;
        }
        if (order_id && order_id !== '') {
            query['order_id'] = order_id;
        }
        if (order_status && order_status !== '') {
            query['order_status'] = order_status;
        }
        if (start_date && start_date !== '') {
            query['start_date'] = start_date;
        }
        if (end_date && end_date !== '') {
            query['end_date'] = end_date;
        }
        if (page) {
            query['page'] = page;
        }

        const response = await Requests.get({
            url: Api.histories,
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** 获取某一订单信息 */
    historyView: async (order_id) => {
        const response = await Requests.get({
            url: Api.history_view(order_id),
            withAuth: true
        });

        return response;
    },

    shippingInfo: async (order_item_id) => {
        const response = await Requests.get({
            url: Api.shipping_info(order_item_id),
            withAuth: true
        });

        return response;
    }
};