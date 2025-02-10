import { Input, Button, Select, Table, Drawer, Space, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { AdminAction } from '../../actions/AdminAction';
import Title from '../../components/Title';
import Loading from '../../components/loading';
import AdminCreate from './create';
import AdminEdit from './edit';
import { __ } from '../../utils/functions';

function Admin(props) {
    const [admins, setAdmins] = useState([]);//管理员列表数据
    const [adminCount, setAdminCount] = useState(0);//管理员总数
    const [currentPage, setCurrentPage] = useState(1);//标记当前页
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [searchParam, setSearchParam] = useState({});//列表搜索参数
    const [loading, setLoading] = useState('block');//加载转圈圈

    useEffect(() => {
        getAdmins();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取管理员列表 */
    const getAdmins = async (page = 1) => {
        setLoading('block');

        const res = await AdminAction.list(searchParam, page);

        if (res.code === '') {
            setAdmins(res.result.admins.map((v, k) => (
                {
                    key: k + 1,
                    number: k + 1,
                    username: v.username,
                    server_ip: v.server_ip,
                    private_ip: v.private_ip,
                    domain: v.domain,
                    tag: v.tag,
                    is_use: v.is_use ? __('Enable.') : __('Disable.'),
                    create_time: v.create_time,
                    user_id: v.id,
                    is_use_org: v.is_use
                }
            )));

            setAdminCount(res.result.count);
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

    /** 新增管理员表单弹出 */
    const adminCreate = () => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Create admin.'),
            width: 360
        });
        setDrawElement(<AdminCreate created={requestFinish} />);
    }

    /** 更新管理员表单弹出 */
    const adminEdit = (admin) => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Edit admin.'),
            width: 360
        });
        setDrawElement(<AdminEdit admin={admin} updated={requestFinish} />);
    }

    /** 新增，更新数据后关闭抽屉，重新获取列表数据 */
    const requestFinish = () => {
        closeDraw();
        getAdmins(currentPage);
    }

    /** 关闭抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
    }

    /** 表格项目 */
    const columns = [
        {
            title: 'No.',
            width: 40,
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: __('username.'),
            width: 80,
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: __('public IP address.'),
            width: 100,
            dataIndex: 'server_ip',
            key: 'server_ip',
        },
        {
            title: __('private IP address.'),
            width: 100,
            dataIndex: 'private_ip',
            key: 'private_ip',
        },
        {
            title: __('domain.'),
            width: 150,
            dataIndex: 'domain',
            key: 'domain',
        },
        {
            title: __('lightsail tag.'),
            width: 60,
            dataIndex: 'tag',
            key: 'tag',
        },
        {
            title: __('Enable/Disable.'),
            width: 50,
            dataIndex: 'is_use',
            key: 'is_use',
        },
        {
            title: __('Create time.'),
            width: 100,
            dataIndex: 'create_time',
            key: 'create_time',
        },
        {
            title: __('Operation.'),
            width: 60,
            key: 'operation',
            fixed: 'right',
            render: (text, record, index) => (
                <Space size={2} className="list-opt">
                    <Tag color="processing" className="pointer" onClick={() => { adminEdit(record) }}>{__('Edit.')}</Tag>
                </Space>
            ),
        },
    ];

    return (
        <div className="P-Content">
            <Title />
            <div className="content">
                <div className="search">
                    <div className="search-group">
                        <div className="search-elem">
                            <em>{__('username.')}:</em>
                            <Input placeholder={__('Please input username.')} className="input" value={searchParam['username']} onChange={(e) => { setSearch('username', e.target.value) }} />
                        </div>
                        <div className="search-elem">
                            <em>{__('Enable/Disable.')}:</em>
                            <Select
                                value={searchParam['is_use']}
                                onChange={(e) => { setSearch('is_use', e) }}
                                options={[
                                    { value: '1', label: __('Enable.') },
                                    { value: '0', label: __('Disable.') },
                                ]}
                                className="select"
                            />
                        </div>
                    </div>
                    <div className="content-btn-group">
                        <Space>
                            <Button type="primary" onClick={() => { setCurrentPage(1); getAdmins(1); }}>{__('Search.')}</Button>
                            <Button type="primary" onClick={() => { setSearchParam({}) }}>{__('Reset.')}</Button>
                        </Space>
                        <Space>
                            <Button type="primary" onClick={adminCreate}>{__('Create admin.')}</Button>
                        </Space>
                    </div>
                </div>
                <div className="table">
                    <Table
                        bordered
                        size="small"
                        columns={columns}
                        dataSource={admins}
                        pagination={{
                            total: adminCount,
                            defaultPageSize: 10,
                            showSizeChanger: false,
                            current: currentPage,
                            onChange: (page) => {
                                setCurrentPage(page);
                                getAdmins(page);
                            }
                        }}
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

export default Admin;