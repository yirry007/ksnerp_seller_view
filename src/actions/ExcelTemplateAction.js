import { message } from "antd";
import { Requests } from "../utils/Request";
import { Api } from "../utils/api";

export const ExcelTemplateAction = {
    /** 获取Excel模板列表 */
    list: async (params) => {
        const type = params.type;
        const title = params.title;
        const query = {};

        if (type) {
            query['type'] = type;
        }
        if (title && title !== '') {
            query['title'] = title;
        }

        const response = await Requests.get({
            url: Api.excel_template_list,
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** 新增Excel模板 */
    store: async (params) => {
        const response = await Requests.post({
            url: Api.excel_template_store,
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

    /** 更新Excel模板 */
    update: async (template_id, params) => {
        const response = await Requests.put({
            url: Api.excel_template_update(template_id),
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

    /** 删除Excel模板 */
    delete: async (template_id) => {
        const response = await Requests.delete({
            url: Api.excel_template_delete(template_id),
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

    /** 获取Excel输出字段列表 */
    exportFields: async (type) => {
        const response = await Requests.get({
            url: Api.export_fields(type),
            withAuth: true
        });

        return response;
    },

    /** 获取Excel输出数据 */
    exportData: async (template_id, query={}) => {
        const response = await Requests.get({
            url: Api.export_data(template_id),
            datas: query,
            withAuth: true
        });

        return response;
    },

    /** Excel文件导入的数据上传到服务器 */
    importExcel: async (type, data=[], option={}) => {
        const response = await Requests.post({
            url: Api.import_excel,
            datas: {type, data, option},
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
};