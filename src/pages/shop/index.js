import { Input, Button, Select, Table, Space, Tooltip, Modal, Drawer, message, Tag } from 'antd';
import { LoadingOutlined, CheckOutlined, CloseOutlined, RedoOutlined, NodeIndexOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { ShopAction } from '../../actions/ShopAction';
import { marketIcons, markets, nonAutoCreateToken } from '../../Constants';
import { connect } from 'react-redux';
import Loading from '../../components/loading';
import Title from '../../components/Title';
import ShopCreate from './create';
import ShopEdit from './edit';
import { __ } from '../../utils/functions';

function Shop(props) {
    const [shops, setShops] = useState([]);//店铺列表
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [searchParam, setSearchParam] = useState({});//列表搜索参数
    const [loading, setLoading] = useState('block');//加载转圈圈
    const [checkBtnLoading, setCheckBtnLoading] = useState(false);//获取所有店铺联动按钮加载转圈圈
    const [shopConn, setShopConn] = useState(() => {
        const shopConnection = props.shop_connection;

        //没有保存的联动的数据或已保存的店铺联动状态过期了，则联动状态 state 设置为 空对象{}
        if (!shopConnection || shopConnection.expired < Date.now()) return {};

        return shopConnection.conn;
    });//店铺联动状态
    const { confirm } = Modal;

    useEffect(() => {
        getShops();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取店铺列表 */
    const getShops = async () => {
        setLoading('block');

        const res = await ShopAction.list(searchParam);
        res.result && setShops(res.result.map((v, k) => {
            let keyExpired = '-';
            if (v.app_key_expired) {
                const now = Date.now();
                const expired = new Date(`${v.app_key_expired} 00:00:00`);

                keyExpired = now > expired ? <span style={{ color: '#f5222d' }}>{v.app_key_expired} 已过期</span> : v.app_key_expired;
            }

            return {
                key: k + 1,
                number: k + 1,
                market: marketIcons[v.market] ? <img src={require('../../assets/img/' + v.market.toLowerCase() + '.png')} alt={v.market} style={{ width: '40px' }} /> : v.market,
                shop_name: v.shop_name,
                shop_id: v.shop_id,
                proxy_ip: v.proxy_ip,
                app_key_expired: keyExpired,
                id: v.id,
                market_name: v.market,
                data: v
            };
        }));

        setLoading('none');
    }

    /** 设置列表搜索参数 */
    const setSearch = (key, value) => {
        setSearchParam({
            ...searchParam,
            [key]: value
        });
    }

    /** 新增店铺表单弹出 */
    const shopCreate = () => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Create new shop.'),
            width: 720
        });
        setDrawElement(<ShopCreate created={requestFinish} />);
    }

    /** 更新店铺表单弹出 */
    const shopEdit = (shop) => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Edit shop.'),
            width: 720
        });
        setDrawElement(<ShopEdit shop={shop.data} updated={requestFinish} />);
    }

    /** 新增，更新数据后关闭抽屉，重新获取列表数据 */
    const requestFinish = () => {
        closeDraw();
        getShops();
    }

    /** 关闭抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
    }

    /** 获取店铺联动状态 */
    const checkConnection = async (shop) => {
        setShopConn({
            ...shopConn,
            [shop.id]: 'connecting',
        });

        const res = await ShopAction.checkConnection(shop.id);

        const conn = {
            ...shopConn,
            [shop.id]: res.code !== '' ? 'failed' : 'success'
        }

        props.setShopConnection({ conn, expired: getExpiredTimestamp(1) });// redux 中写入联动状态数据，保存一个小时
        setShopConn(conn);//修改 state 重新渲染界面
    }

    /** 获取所有店铺联动状态 */
    const checkAllConnection = async () => {
        setCheckBtnLoading(true);

        const res = await ShopAction.checkAllConnection();

        if (res) {
            props.setShopConnection({ conn: res.result, expired: getExpiredTimestamp(1) });// redux 中写入联动状态数据，保存一个小时
            setShopConn(res.result);
        }

        setCheckBtnLoading(false);
    }

    /** 根据店铺的状态（connecting, success, failed等）获取列表中显示的文字和图标 */
    const getShopStatusData = (shop_id) => {
        const data = {};
        const status = shopConn[shop_id];

        if (!status) {
            data['title'] = __('Shop connection test.');
            data['icon'] = <RedoOutlined style={{ color: '#8c8c8c', cursor: 'pointer' }} />;
            return data;
        }

        const titleMap = {
            connecting: __('Connecting.'),
            success: __('Shop connect successfully.'),
            failed: __('Shop connect failed.'),
        };
        const iconMap = {
            connecting: <LoadingOutlined style={{ color: '#1677ff', cursor: 'pointer' }} />,
            success: <CheckOutlined style={{ color: '#52c41a', cursor: 'pointer' }} />,
            failed: <CloseOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} />,
        };

        data['title'] = titleMap[status];
        data['icon'] = iconMap[status];

        return data;
    }

    /** 打开雅虎等用户授权页面 */
    const openAuthPage = (record) => {
        const authorizeUrl = record.data.authorize_url;

        if (!authorizeUrl || authorizeUrl === '') {
            message.error(__('Invalid url address.'));
            return false;
        }

        window.open(authorizeUrl);
    }

    /** 删除店铺 */
    const shopDestory = (shop) => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: `${__('Shop ID.')}: ${shop.shop_id}`,
            content: __('Confirm to delete.'),
            okText: __('Confirm.'),
            cancelText: __('Cancel.'),
            onOk: async () => {
                const res = await ShopAction.delete(shop.id);
                res.code === '' && setShops(shops.filter(v => v.id !== shop.id));
            }
        });
    }

    /**
     * 获取 N 小时后的时间戳
     * @param expireHour int N小时后的时间戳
     * @return int
    */
    const getExpiredTimestamp = (expireHour) => Date.now() + expireHour * 3600 * 1000;

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
            width: 80,
            dataIndex: 'market',
            key: 'market',
        },
        {
            title: __('Shop name.'),
            width: 200,
            dataIndex: 'shop_name',
            key: 'shop_name',
        },
        {
            title: __('Shop ID.'),
            width: 80,
            dataIndex: 'shop_id',
            key: 'shop_id',
        },
        {
            title: __('Proxy IP.'),
            width: 100,
            dataIndex: 'proxy_ip',
            key: 'proxy_ip',
        },
        {
            title: __('APP KEY expired.'),
            width: 100,
            dataIndex: 'app_key_expired',
            key: 'app_key_expired',
        },
        {
            title: __('Operation.'),
            width: 150,
            key: 'operation',
            fixed: 'right',
            render: (text, record, index) => {
                const statusData = getShopStatusData(record.id);

                return (
                    <Space size={2} className="list-opt">
                        <Tooltip placement="top" title={statusData['title']} onClick={() => { checkConnection(record) }}>
                            <Tag className="pointer">{statusData['icon']}</Tag>
                        </Tooltip>
                        {nonAutoCreateToken.includes(record.market_name) &&
                            <Tooltip placement="top" title={__('Get Token.')} onClick={() => { openAuthPage(record) }}>
                                <Tag color="processing" className="pointer">
                                    <NodeIndexOutlined style={{ cursor: 'pointer' }} />
                                </Tag>
                            </Tooltip>
                        }
                        <Tag color="processing" className="pointer" onClick={() => { shopEdit(record) }}>{__('Edit.')}</Tag>
                        <Tag color="error" className="pointer" onClick={() => { shopDestory(record) }}>{__('Delete.')}</Tag>
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
                            <em>{__('Shop name.')}:</em>
                            <Input placeholder={__('Please input Shop name.')} className="input" value={searchParam['shop_name']} onChange={(e) => { setSearch('shop_name', e.target.value) }} />
                        </div>
                        <div className="search-elem">
                            <em>{__('Shop ID.')}:</em>
                            <Input placeholder={__('Please input Shop ID.')} className="input" value={searchParam['shop_id']} onChange={(e) => { setSearch('shop_id', e.target.value) }} />
                        </div>
                    </div>
                    <div className="content-btn-group">
                        <Space>
                            <Button type="primary" onClick={getShops}>{__('Search.')}</Button>
                            <Button type="primary" onClick={() => { setSearchParam({}) }}>{__('Reset.')}</Button>
                        </Space>
                        <Space>
                            <Button type="primary" onClick={checkAllConnection} loading={checkBtnLoading}>{__('Connection test.')}</Button>
                            <Button type="primary" onClick={shopCreate}>{__('Create new shop.')}</Button>
                        </Space>
                    </div>
                </div>
                <div className="table">
                    <Table
                        bordered
                        size="small"
                        columns={columns}
                        dataSource={shops}
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

/**
 connect(
    //mapStateToProps //使组件监听某个状态的改变
    //mapDispatchToProps //组件改变某个状态
    //以上两个connect参数会分配到props属性中
 )(被包装的组件)
 */

const mapStateToProps = ({
    shopConnectionReducer: { shop_connection },
}) => {
    /** 以下属性挂载到 props 参数 */
    return {
        shop_connection,
    }
}

const mapDispatchToProps = {
    setShopConnection(conn) {
        return {
            type: 'set_shop_connection',
            payload: conn
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Shop);