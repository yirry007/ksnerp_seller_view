import { Input, Button, Select, Table, Drawer, Space, Modal, Tag } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { UserAction } from '../../actions/UserAction';
import Title from '../../components/Title';
import Loading from '../../components/loading';
import UserCreate from './create';
import UserEdit from './edit';
import { __ } from '../../utils/functions';

function User(props) {
    const [users, setUsers] = useState([]);//用户列表数据
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [searchParam, setSearchParam] = useState({});//列表搜索参数
    const [loading, setLoading] = useState('block');//加载转圈圈
    const { confirm } = Modal;

    useEffect(() => {
        getUsers();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取用户列表 */
    const getUsers = async () => {
        setLoading('block');

        const res = await UserAction.list(searchParam);
        res.result && setUsers(res.result.map((v, k) => (
            {
                key: k + 1,
                number: k + 1,
                username: v.username,
                is_use: v.is_use ? __('Enable.') : __('Disable.'),
                create_time: v.create_time,
                parent_id: v.parent_id,
                user_id: v.id,
                is_use_org: v.is_use
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

    /** 新增用户表单弹出 */
    const userCreate = () => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Create new user.'),
            width: 360
        });
        setDrawElement(<UserCreate created={requestFinish} />);
    }

    /** 更新用户表单弹出 */
    const userEdit = (user) => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Edit user.'),
            width: 360
        });
        setDrawElement(<UserEdit user={user} updated={requestFinish} />);
    }

    /** 新增，更新数据后关闭抽屉，重新获取列表数据 */
    const requestFinish = () => {
        closeDraw();
        getUsers();
    }

    /** 关闭抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
    }

    /** 删除用户 */
    const userDestory = (user) => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: `${__('username.')}: ${user.username}`,
            content: __('Confirm to delete.'),
            okText: __('Confirm.'),
            cancelText: __('Cancel.'),
            onOk: async () => {
                const res = await UserAction.delete(user.user_id);
                res.code === '' && setUsers(users.filter(v => v.user_id !== user.user_id));
            }
        });
    }

    /** 表格项目 */
    const columns = [
        {
            title: 'No.',
            width: 150,
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: __('username.'),
            width: 200,
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: __('Enable/Disable.'),
            width: 150,
            dataIndex: 'is_use',
            key: 'is_use',
        },
        {
            title: __('Create time.'),
            width: 200,
            dataIndex: 'create_time',
            key: 'create_time',
        },
        {
            title: __('Operation.'),
            width: 100,
            key: 'operation',
            fixed: 'right',
            render: (text, record, index) => (
                <Space size={2} className="list-opt">
                    <Tag color="processing" className="pointer" onClick={() => { userEdit(record) }}>{__('Edit.')}</Tag>
                    <Tag color="error" className="pointer" onClick={() => { userDestory(record) }}>{__('Delete.')}</Tag>
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
                            <Button type="primary" onClick={getUsers}>{__('Search.')}</Button>
                            <Button type="primary" onClick={() => { setSearchParam({}) }}>{__('Reset.')}</Button>
                        </Space>
                        <Space>
                            <Button type="primary" onClick={userCreate}>{__('Create new user.')}</Button>
                        </Space>
                    </div>
                </div>
                <div className="table">
                    <Table
                        bordered
                        size="small"
                        columns={columns}
                        dataSource={users}
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

export default User;