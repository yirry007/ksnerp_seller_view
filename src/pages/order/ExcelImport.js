import { UploadOutlined } from '@ant-design/icons';
import { Button, Table, Upload, message } from 'antd';
import { orderStatusMap } from '../../Constants';
import { Workbook } from 'exceljs';
import { useState } from 'react';
import { ExcelTemplateAction } from '../../actions/ExcelTemplateAction';
import { __ } from '../../utils/functions';


function ExcelImport(props) {
    const [tableColumns, setTableColumns] = useState([]);//表格项目
    const [dataSource, setDataSource] = useState([]);//表格数据
    const [columnTitleMap, setColumnTitleMap] = useState({});
    const [importBtnSetting, setImportBtnSetting] = useState({ text: __('Import.'), loading: false });

    const importRequiredColumn = [__('Order ID.'), __('Order item ID.')];

    /** 选择文件，并读取其内容 */
    const getFile = (file) => {
        const workbook = new Workbook();
        const reader = new FileReader();

        reader.readAsArrayBuffer(file);
        reader.onload = async () => {
            const buffer = reader.result;
            const fileData = await workbook.xlsx.load(buffer);
            const sheet = fileData.getWorksheet(1);//Excel文件中只获取第一个sheet

            const _dataSource = [];

            sheet.eachRow((row, rowIndex) => {
                const rowValue = row.values;

                if (rowIndex === 1) {//构建 Table 的首行（标题行）
                    const _columns = [];
                    const _columnTitleMap = {};

                    rowValue.forEach((v, k) => {
                        const index = 'index_' + k;
                        _columns.push({
                            title: v,
                            dataIndex: index,
                            key: index,
                        });

                        _columnTitleMap[index] = v;
                    });

                    setTableColumns(_columns);
                    setColumnTitleMap(_columnTitleMap);
                } else {//构建 Table 数据
                    const _data = {};

                    rowValue.forEach((v, k) => {
                        const _val = v.hasOwnProperty('richText') ? v['richText'][0]['text'] : v;

                        const index = 'index_' + k;
                        _data['key'] = rowIndex.toString() + '_' + k.toString();
                        _data[index] = _val;
                    });

                    _dataSource.push(_data);
                }
            });

            setDataSource(_dataSource);
        }

        /** 禁止文件默认提交 */
        return false;
    }

    /** 删除已选文件 */
    const removeFile = () => {
        setTableColumns([]);
        setDataSource([]);
    }

    /** 导入的文件数据上传到服务器，并更新订单与订单商品 */
    const importExcel = async () => {
        setImportBtnSetting({ text: __('Importing.'), loading: true });

        let shortageRequiredColumn = false;
        const columnTitles = Object.values(columnTitleMap);

        /** 判断是否有缺少的字段 */
        importRequiredColumn.forEach(v => shortageRequiredColumn = !columnTitles.includes(v));
        if (shortageRequiredColumn) {
            message.error(__('Invalid fields.') + importRequiredColumn.join(','));
            return false;
        }

        const uploadData = [];//重构的 Excel 数据
        dataSource.forEach(v => {
            const _row = {};

            Object.keys(v).forEach(key => {
                if (key === 'key') return;

                _row[columnTitleMap[key]] = v[key];
            });

            uploadData.push(_row);
        });

        const type = 1;//1 表示正在导入订单 Excel
        const res = await ExcelTemplateAction.importExcel(type, uploadData, {order_status: props.status});
        console.log(res);

        setImportBtnSetting({ text: __('Import.'), loading: false });

        props.imported();
    }

    return (
        <div className="excel">
            <h2>{__('Import Excel.')}</h2>
            <section>
                <em>{__('Order status.')}</em>
                <strong>{orderStatusMap[props.status]}</strong>
            </section>
            <section>
                <em>{__('Choose a file.')}</em>
                <Upload
                    beforeUpload={getFile}
                    onRemove={removeFile}
                    maxCount={1}
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                >
                    <Button icon={<UploadOutlined />}>{__('Please choose a Excel file.')}</Button>
                </Upload>
            </section>
            {tableColumns.length > 0 &&
                <section>
                    <Table
                        bordered
                        size="small"
                        columns={tableColumns}
                        dataSource={dataSource}
                        pagination={false}
                        scroll={{ x: (tableColumns.length * 200), y: 450 }}
                    />
                </section>
            }
            <div className="excel-opt">
                <Button type="primary" style={{ background: '#52c41a' }} onClick={importExcel} loading={importBtnSetting.loading}>{importBtnSetting.text}</Button>
            </div>
        </div>
    );
}

export default ExcelImport;