import { message } from "antd";
import { Requests } from "../utils/Request";
import { Api } from "../utils/api";

export const EmailTemplateAction = {
    /** 获取邮件模板列表 */
    list: async (params) => {
        const market = params.market;
        const title = params.title;
        const query = {};

        if (market) {
            query['market'] = market;
        }
        if (title && title !== '') {
            query['title'] = title;
        }

        const response = await Requests.get({
            url: Api.email_template_list,
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** 新增邮件模板 */
    store: async (params) => {
        const response = await Requests.post({
            url: Api.email_template_store,
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

    /** 更新邮件模板 */
    update: async (template_id, params) => {
        const response = await Requests.put({
            url: Api.email_template_update(template_id),
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

    /** 删除邮件模板 */
    delete: async (template_id) => {
        const response = await Requests.delete({
            url: Api.email_template_delete(template_id),
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
};