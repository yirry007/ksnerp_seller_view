import { Button, Select, Spin, Tag, message } from 'antd';
import { orderStatusMap } from '../../Constants';
import { useEffect, useState } from 'react';
import { ExcelTemplateAction } from '../../actions/ExcelTemplateAction';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { __, timeFormat } from '../../utils/functions';


function ExcelExport(props) {
    const [excelTemplates, setExcelTemplates] = useState([]);//Excel模板列表
    const [orderFieldMap, setOrderFieldMap] = useState({});//订单字段与名称的映射表
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);//已选的Excel导出模板ID
    const [exportFields, setExportFields] = useState([]);//打印列
    const [exportOption, setExportOption] = useState({ skip_supplied: 1 });//打印其他选项
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getExcelTemplates();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取Excel模板列表 */
    const getExcelTemplates = async () => {
        setLoading('block');

        const res = await ExcelTemplateAction.list({ type: 1 });

        if (res.code === '') {
            setExcelTemplates(res.result.templates.map((v, k) => (
                {
                    key: k + 1,
                    value: v.id,
                    label: v.title,
                    data: v
                }
            )));

            setOrderFieldMap(res.result.order_field_map);
        }

        setLoading(false);
    }

    /** 选择Excel导出模板 */
    const selectTemplate = (v, opt) => {
        setSelectedTemplateId(v);

        let fields = [];

        try {
            fields = JSON.parse(opt.data.fields);
        } catch (e) {
            console.log(e);
        }

        setExportFields(fields.map(v => orderFieldMap[v]));
    }

    /** 导出Excel */
    const exportExcel = async () => {
        const res = await ExcelTemplateAction.exportData(selectedTemplateId, { order_status: props.status, ...props.search_param, ...exportOption });

        if (res.code !== '') {
            message.error(res.message);
            return false;
        }

        _downloadExcel(res.result.export_field, res.result.export_data);
    }

    /** 构建Excel数据，并下载 */
    const _downloadExcel = (field, data) => {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet(orderStatusMap[props.status]);
        worksheet.properties.defaultRowHeight = 100;
        const imageDataWithCoordinate = [];

        /** 设置表头 */
        worksheet.columns = field.map(v => (
            {
                header: v.name,
                key: v.column,
                style: {
                    // 字体样式
                    font: { size: 12 },
                    // 设置水平，垂直对齐方式以及是否换行
                    alignment: {
                        wrapText: true,
                        vertical: 'middle',
                        horizontal: 'left',
                    },
                },
                width: 25
            }
        ));

        /** 设置内容 */
        worksheet.addRows(data.map((v, k) => {
            let options;
            let returnData = v;
            let infos;

            try {
                options = JSON.parse(v.options);
            } catch (e) {
                console.log(e);
            }

            try {
                infos = JSON.parse(v.infos);
            } catch (e) {
                console.log(e);
            }

            /** 处理商品图片，组合商品图片的对象数组 */
            if (returnData['item_image_path'] && returnData['item_image_path'] !== '') {
                const _imageInfo = { image_base64: returnData['item_image_path'] };

                for (let i = 0; i < field.length; i++) {
                    if (field[i]['column'] === 'item_image_path') {
                        _imageInfo['coordinate'] = { col: i + 0.9, row: k + 1.3 };
                        break;
                    }
                }

                imageDataWithCoordinate.push(_imageInfo);

                returnData['item_image_path'] = '';
            }

            /** 重置商品选项 */
            if (options) {
                const optionData = options.data;
                let optionStr = '';

                Object.keys(optionData).forEach((v1, k1) => {
                    if (k1 !== 0) optionStr += ';';

                    optionStr += v1 + ':' + optionData[v1];
                });

                returnData['options'] = optionStr;
            }

            /** 重置订单商品其他信息 */
            if (infos) {
                let infoStr = '';
                infos.forEach((v1, k1) => {
                    if (k1 !== 0) infoStr += ';';

                    infoStr += v1.name + ':' + v1.value;
                });

                returnData['infos'] = infoStr;
            }

            return returnData;
        }));

        /** Excel 表格中插入图片 */
        imageDataWithCoordinate.forEach(v => {
            const image_base64 = v['image_base64'];
            const _extension = image_base64.split(';')[0].split('/')[1];
            const image_id = workbook.addImage({
                base64: image_base64,
                extension: _extension,
            });

            worksheet.addImage(image_id, {
                tl: v['coordinate'],
                ext: { width: 120, height: 120 }
            });
        });

        // 定义表头样式
        let headerStyle = {
            font: {
                name: 'Arial',
                size: 13,
                bold: true,
                color: { argb: '00ffffff' },
            },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '0052c41a' },
            },
            alignment: {
                wrapText: true,
                vertical: 'middle',
                horizontal: 'center',
            },
            border: {
                top: { style: 'double' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            },
        };

        // 填充表头的样式
        for (let i = 1; i <= worksheet.columnCount; i++) {
            let cell = worksheet.getCell(1, i);
            cell.font = headerStyle.font;
            cell.fill = headerStyle.fill;
            cell.alignment = headerStyle.alignment;
            cell.border = headerStyle.border;
        }

        workbook.xlsx.writeBuffer().then((buffer) => {
            let blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const fileName = `ksnerp_orders_${timeFormat(Date.now(), 3)}.xlsx`;
            saveAs(blob, fileName);
        });
    }

    return (
        <Spin spinning={loading}>
            <div className="excel">
                <h2>{__('Excel Export.')}</h2>
                <section>
                    <em>{__('Order status.')}</em>
                    <strong>{orderStatusMap[props.status]}</strong>
                </section>
                <section>
                    <em>{__('Select a template.')}</em>
                    <Select
                        style={{ width: 200 }}
                        options={excelTemplates}
                        onChange={selectTemplate}
                    />
                </section>
                <section className="align-top">
                    <em>{__('Export fields.')}</em>
                    <div className="export-fields">
                        {exportFields.map((v, k) => <Tag style={{ marginBottom: 8 }} key={k}>{v}</Tag>)}
                    </div>
                </section>
                {props.status === '2' &&
                    <section>
                        <em>{__('Export option.')}</em>
                        <Select
                            style={{ width: 200 }}
                            defaultValue={1}
                            options={[
                                { label: __('Except sourced item.'), value: 1 },
                                { label: __('Export all.'), value: 0 },
                            ]}
                            onChange={(e) => { setExportOption({ ...exportOption, skip_supplied: e }) }}
                        />
                    </section>
                }
                <div className="excel-opt">
                    <Button type="primary" style={{ background: '#52c41a' }} onClick={exportExcel}>{__('Export.')}</Button>
                </div>
            </div>
        </Spin>
    );
}

export default ExcelExport;