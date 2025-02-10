import { message } from "antd";
import { Requests } from "../utils/Request";
import { Api } from "../utils/api";
import { initEmailTemplate } from "../InitEmailTemplate";
import { EmailTemplateAction } from "./EmailTemplateAction";

export const AdminAction = {
    /** 获取管理员列表 */
    list: async (params, page) => {
        const username = params.username;
        const is_use = params.is_use;
        const query = {};

        if (username && username !== '') {
            query['username'] = username;
        }
        if (is_use) {
            query['is_use'] = is_use;
        }
        if (page) {
            query['page'] = page;
        }

        const response = await Requests.get({
            url: Api.admin_list,
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** 新增管理员 */
    store: async (params) => {
        const response = await Requests.post({
            url: Api.admin_store,
            datas: params,
            withAuth: true
        });

        if (response.code !== '') {
            message.error(response.message);
            return false;
        } else {
            message.success(response.message);

            /** 创建管理员后创建个平台的邮件模板 */
            initEmailTemplate.forEach(async v => {
                v.user_id = response.result.id;
                await EmailTemplateAction.store(v);
            });
        }

        return response;
    },

    /** 更新管理员 */
    update: async (admin_id, params) => {
        const response = await Requests.put({
            url: Api.admin_update(admin_id),
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

    /** 获取语言包数据 */
    getLanguageData: async () => {
        const response = await Requests.get({
            url: Api.get_language_data,
            withAuth: true
        });

        return response;
    },

    /** 更新语言包数据 */
    updateLanguageData: async (params) => {
        const response = await Requests.post({
            url: Api.update_language_data,
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

    /** 新增语言项目 */
    languageAdd: async (params) => {
        const response = await Requests.post({
            url: Api.language_add,
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
}