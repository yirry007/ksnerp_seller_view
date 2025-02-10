import { Input, Button, Select, Table, Space, Modal, Drawer, Tag } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { ExcelTemplateAction } from '../../actions/ExcelTemplateAction';
import Loading from '../../components/loading';
import Title from '../../components/Title';
import ExcelTemplateCreate from './create';
import ExcelTemplateEdit from './edit';
import { excelTypeMap } from '../../Constants';
import { __ } from '../../utils/functions';

function ExcelTemplate(props) {
    const [excelTemplates, setExcelTemplates] = useState([]);//Excel模板列表
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [searchParam, setSearchParam] = useState({});//列表搜索参数
    const [loading, setLoading] = useState('block');//加载转圈圈

    const { confirm } = Modal;

    useEffect(() => {
        getExcelTemplates();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取Excel模板列表 */
    const getExcelTemplates = async () => {
        setLoading('block');

        const res = await ExcelTemplateAction.list(searchParam);

        if (res.code === '') {
            const _orderFieldMap = res.result.order_field_map;

            setExcelTemplates(res.result.templates.map((v, k) => {
                let fields = [];

                try {
                    const fieldList = JSON.parse(v.fields);

                    if (v.type === 1) {
                        fields = fieldList.map(v => _orderFieldMap[v]);
                    }
                } catch (e) {
                    console.log(e);
                }

                return {
                    key: k + 1,
                    number: k + 1,
                    title: v.title,
                    type: excelTypeMap[v.type],
                    fields: fields.join(' , '),
                    create_time: v.create_time,
                    id: v.id,
                    data: { ...v, type: v.type.toString() }
                }
            }));
        }

        setLoading('none');
    }

    /** 设置列表搜索参数 */
    const setSearch = (key, value) => {
        setSearchParam({
            ...searchParam,
            [key]: value
        });
    }

    /** 新增Excel模板表单弹出 */
    const templateCreate = () => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Create template.'),
            width: 800
        });
        setDrawElement(<ExcelTemplateCreate created={requestFinish} />);
    }

    /** 更新模板表单弹出 */
    const templateEdit = (template) => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Edit template.'),
            width: 800
        });
        setDrawElement(<ExcelTemplateEdit template={template.data} updated={requestFinish} />);
    }

    /** 新增，更新数据后关闭抽屉，重新获取列表数据 */
    const requestFinish = () => {
        closeDraw();
        getExcelTemplates();
    }

    /** 关闭抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
    }

    /** 删除模板 */
    const templateDestory = (template) => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: `${__('Template title.')}: ${template.title}`,
            content: __('Confirm to delete.'),
            okText: __('Confirm.'),
            cancelText: __('Cancel.'),
            onOk: async () => {
                const res = await ExcelTemplateAction.delete(template.id);
                res.code === '' && setExcelTemplates(excelTemplates.filter(v => v.id !== template.id));
            }
        });
    }

    /** 表格项目 */
    const columns = [
        {
            title: 'No.',
            width: 50,
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: __('Template title.'),
            width: 120,
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: __('Template type.'),
            width: 60,
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: __('Export fields.'),
            width: 300,
            dataIndex: 'fields',
            key: 'fields',
        },
        {
            title: __('Create time.'),
            width: 120,
            dataIndex: 'create_time',
            key: 'create_time',
        },
        {
            title: __('Operation.'),
            width: 150,
            key: 'operation',
            fixed: 'right',
            render: (text, record, index) => {
                return (
                    <Space size={2} className="list-opt">
                        <Tag color="processing" className="pointer" onClick={() => { templateEdit(record) }}>{__('Edit.')}</Tag>
                        <Tag color="error" className="pointer" onClick={() => { templateDestory(record) }}>{__('Delete.')}</Tag>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="P-Content">
            <Title />
            <div className="content">
                <div className="search">
                    <div className="search-group">
                        <div className="search-elem">
                            <em>{__('Template type.')}:</em>
                            <Select
                                value={searchParam['type']}
                                onChange={(e) => { setSearch('type', e) }}
                                options={Object.keys(excelTypeMap).map(v => ({ value: v, label: excelTypeMap[v] }))}
                                className="select"
                            />
                        </div>
                        <div className="search-elem">
                            <em>{__('Template title.')}:</em>
                            <Input placeholder="请输入模板标题" className="input" value={searchParam['title']} onChange={(e) => { setSearch('title', e.target.value) }} />
                        </div>
                    </div>
                    <div className="content-btn-group">
                        <Space>
                            <Button type="primary" onClick={getExcelTemplates}>{__('Search.')}</Button>
                            <Button type="primary" onClick={() => { setSearchParam({}) }}>{__('Reset.')}</Button>
                        </Space>
                        <Space>
                            <Button type="primary" onClick={templateCreate}>{__('Create template.')}</Button>
                        </Space>
                    </div>
                </div>
                <div className="table">
                    <Table
                        bordered
                        size="small"
                        columns={columns}
                        dataSource={excelTemplates}
                        pagination={false}
                        scroll={{ x: 1500, y: 416 }}
                    />
                </div>
            </div>

            <Drawer
                title={drawOption.title}
                width={drawOption.width}
                maskClosable={false}
                onClose={closeDraw}
                open={drawStatus}
            >{drawElement}</Drawer>

            <Loading loading={loading} />
        </div>
    );
}

export default ExcelTemplate;