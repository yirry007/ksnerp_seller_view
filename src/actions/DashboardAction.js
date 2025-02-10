import { Requests } from "../utils/Request";
import { Api } from "../utils/api";

export const DashboardAction = {
    /** 当前系统版本以及最新系统版本（确认是否要更新） */
    versionInfo: async () => {
        const response = await Requests.get({
            url: Api.version_info,
            withAuth: true
        });

        return response;
    },

    /** 更新ERP系统版本 */
    versionUpdate: async () => {
        const response = await Requests.post({
            url: Api.version_update,
            withAuth: true
        });

        return response;
    },

    /** 获取ERP版本更新日志 */
    versionUpdateLogs: async () => {
        const response = await Requests.get({
            url: Api.version_update_logs,
            withAuth: true
        });

        return response;
    },

    /** 获取实时日元价格 */
    exchangeRate: async () => {
        const data = {};

        const response = await Requests.get({
            url: Api.exchange_rate,
            withoutLocale: true
        });

        data['cny'] = response.country ? response.country[0].value.replace(',', '') : null;
        data['jpy'] = response.country ? response.country[1].value.replace(',', '') : null;

        return data;
    },

    /** 近一月订单数量统计 */
    orderNumLastMonth: async () => {
        const response = await Requests.get({
            url: Api.order_num_last_month,
            withAuth: true
        });

        return response;
    },

    /** 近一月订单数量统计 */
    orderPriceLastMonth: async () => {
        const response = await Requests.get({
            url: Api.order_price_last_month,
            withAuth: true
        });

        return response;
    },

    /** 近一月各店铺订单数量统计 */
    orderNumPercent: async () => {
        const response = await Requests.get({
            url: Api.order_num_percent,
            withAuth: true
        });

        return response;
    },

    /** 近一月各店铺订单金额统计 */
    orderPricePercent: async () => {
        const response = await Requests.get({
            url: Api.order_price_percent,
            withAuth: true
        });

        return response;
    }
};