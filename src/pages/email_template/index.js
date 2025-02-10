import { Input, Button, Select, Table, Space, Modal, Drawer, Tag } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { EmailTemplateAction } from '../../actions/EmailTemplateAction';
import { emailTypeMap, marketIcons, markets } from '../../Constants';
import Loading from '../../components/loading';
import Title from '../../components/Title';
import EmailTemplateCreate from './create';
import EmailTemplateEdit from './edit';
import { __ } from '../../utils/functions';

function EmailTemplate(props) {
    const [emailTemplates, setEmailTemplates] = useState([]);
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [searchParam, setSearchParam] = useState({});//列表搜索参数
    const [loading, setLoading] = useState('block');//加载转圈圈

    const { confirm } = Modal;

    useEffect(() => {
        getEmailTemplates();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取邮件模板列表 */
    const getEmailTemplates = async () => {
        setLoading('block');

        const res = await EmailTemplateAction.list(searchParam);
        res.result && setEmailTemplates(res.result.map((v, k) => (
            {
                key: k + 1,
                number: k + 1,
                market: marketIcons[v.market] ? <img src={require('../../assets/img/' + v.market.toLowerCase() + '.png')} alt={v.market} style={{ width: '40px' }} /> : v.market,
                type: emailTypeMap[v.type],
                title: v.title,
                create_time: v.create_time,
                id: v.id,
                data: { ...v, type: v.type.toString() }
            }
        )));

        setLoading('none');
    }

    /** 设置列表搜索参数 */
    const setSearch = (key, value) => {
        setSearchParam({
            ...searchParam,
            [key]: value
        });
    }

    /** 新增邮件模板表单弹出 */
    const templateCreate = () => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Create template.'),
            width: 800
        });
        setDrawElement(<EmailTemplateCreate created={requestFinish} />);
    }

    /** 更新模板表单弹出 */
    const templateEdit = (template) => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Edit template.'),
            width: 800
        });
        setDrawElement(<EmailTemplateEdit template={template.data} updated={requestFinish} />);
    }

    /** 新增，更新数据后关闭抽屉，重新获取列表数据 */
    const requestFinish = () => {
        closeDraw();
        getEmailTemplates();
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
                const res = await EmailTemplateAction.delete(template.id);
                res.code === '' && setEmailTemplates(emailTemplates.filter(v => v.id !== template.id));
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
            title: __('Shop type.'),
            width: 100,
            dataIndex: 'market',
            key: 'market',
        },
        {
            title: __('Template type.'),
            width: 100,
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: __('Template title.'),
            width: 200,
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: __('Create time.'),
            width: 100,
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
                            <em>{__('Shop type.')}:</em>
                            <Select
                                value={searchParam['market']}
                                onChange={(e) => { setSearch('market', e) }}
                                options={markets.map(v => ({ value: v.key, label: v.name + ' / ' + v.key }))}
                                className="select"
                            />
                        </div>
                        <div className="search-elem">
                            <em>{__('Template title.')}:</em>
                            <Input placeholder={__('Please input template title.')} className="input" value={searchParam['title']} onChange={(e) => { setSearch('title', e.target.value) }} />
                        </div>
                    </div>
                    <div className="content-btn-group">
                        <Space>
                            <Button type="primary" onClick={getEmailTemplates}>{__('Search.')}</Button>
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
                        dataSource={emailTemplates}
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

export default EmailTemplate;