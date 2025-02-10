import { Input, Button, Table, Drawer, Space, Badge, ConfigProvider, Image, Tag, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import Title from '../../components/Title';
import Loading from '../../components/loading';
import StoreRequest from './StoreRequest';
import { StoreAction } from '../../actions/StoreAction';
import { __, timeFormat, transformItemOption } from '../../utils/functions';
import StoreOutList from './StoreOutList';
import StoreTransfer from './StoreTranfer';
import StoreInLog from './StoreInLog';
import StoreOutLog from './StoreOutLog';

function StoreInfo(props) {
    const [storeGoods, setStoreGoods] = useState([]);//库存商品数据
    const [storeCount, setStoreCount] = useState(0);//申请入库商品种类数量
    const [requestingCount, setRequestingCount] = useState(0);//申请入库商品种类数量
    const [storeOutListsCount, setStoreOutListsCount] = useState(0);//出库清单SKU数量
    const [users, setUsers] = useState([]);
    const [expendedKeys, setExpendedKeys] = useState([]);//展开库存商品SKU
    const [pageSize, setPageSize] = useState(10);//每页显示数量
    const [currentPage, setCurrentPage] = useState(1);//标记当前页
    const [drawStatus, setDrawStatus] = useState(false);//申请入库抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//申请入库抽屉配置选项
    const [drawElement, setDrawElement] = useState();//申请入库抽屉表单内容
    const [storeOutDrawStatus, setStoreOutDrawStatus] = useState(false);//申请出库抽屉弹出状态
    const [storeOutDrawOption, setStoreOutDrawOption] = useState({});//申请出库抽屉配置选项
    const [storeOutDrawElement, setStoreOutDrawElement] = useState();//申请出库抽屉表单内容
    const [storeTransferOpen, setStoreTransferOpen] = useState(false);//是否弹出转移库存弹窗
    const [storeTransferElement, setStoreTransferElement] = useState(null);//转移库存弹窗组件
    const [storeInLogOpen, setStoreInLogOpen] = useState(false);//是否弹出入库申请日志弹窗
    const [storeInLogElement, setStoreInLogElement] = useState(null);//入库申请日志弹窗组件
    const [storeOutLogOpen, setStoreOutLogOpen] = useState(false);//是否弹出出库申请日志弹窗
    const [storeOutLogElement, setStoreOutLogElement] = useState(null);//出库申请日志弹窗组件
    const [searchParam, setSearchParam] = useState({});//列表搜索参数
    const [loading, setLoading] = useState('block');//加载转圈圈

    const { confirm } = Modal;

    useEffect(() => {
        getStore();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取库存商品列表 */
    const getStore = async (page = 1) => {
        setLoading('block');

        const res = await StoreAction.storeInfo(searchParam, page);
        if (res.code === '') {
            setStoreCount(res.result.store_count);
            setRequestingCount(res.result.request_count);
            setStoreOutListsCount(res.result.store_out_lists_count);

            // const _expendedKeys = [];
            const _storeGoods = [];

            res.result.store_goods.forEach((v, k) => {
                /** SKU信息展开设置 */
                // _expendedKeys.push(v.id);

                /** 构建库存商品 */
                _storeGoods.push({
                    key: v.id,
                    number: k + 1,
                    ...v
                });
            });

            setStoreGoods(_storeGoods);
            setUsers(res.result.users);
            // setExpendedKeys(_expendedKeys);
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

    /** 申请入库表单弹出 */
    const applyStore = (action = null) => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Request store in.'),
            width: 720
        });
        setDrawElement(<StoreRequest action={action} resetRequestingCount={resetRequestingCount} users={users} />);
    }

    /** 重新设置申请中的入库商品数量 */
    const resetRequestingCount = () => {
        getStore(currentPage);
    }

    /** 关闭抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
    }

    /** 申请出库表单弹出 */
    const applyStoreOut = (action = null) => {
        setStoreOutDrawStatus(true);
        setStoreOutDrawOption({
            title: __('Request store out.'),
            width: 720
        });
        setStoreOutDrawElement(<StoreOutList resetRequestingCount={resetRequestingCount} />);
    }

    /** 关闭抽屉 */
    const closeStoreOutDraw = () => {
        setStoreOutDrawStatus(false);
        setStoreOutDrawElement(null);
    }

    /** 删除库存商品 */
    const storeGoodsDelete = (store) => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: `${__('KSNCODE.')}: ${store.code}`,
            content: __('Confirm to delete.'),
            okText: __('Confirm.'),
            cancelText: __('Cancel.'),
            onOk: async () => {
                const res = await StoreAction.storeGoodsDelete(store.id);
                res.code === '' && setStoreGoods(storeGoods.filter(v => v.id !== store.id));
            }
        });
    }

    /** 库存商品添加到待出库清单 */
    const addStoreOutList = async (storeGoodsItem) => {
        setLoading('block');
        await StoreAction.addStoreOutList(storeGoodsItem);
        setLoading('none');
    }

    /** 弹出库存转移弹窗 */
    const storeTransferView = (sku) => {
        setStoreTransferElement(<StoreTransfer sku={sku} closeAction={closeStoreTransferView} />);
        setStoreTransferOpen(true);
    }

    /** 关闭库存转移弹窗 */
    const closeStoreTransferView = () => {
        setStoreTransferOpen(false);
        setStoreTransferElement(null);
        getStore(currentPage);
    }

    /** 弹出申请入库日志 */
    const openStoreInLog = () => {
        setStoreInLogElement(<StoreInLog />);
        setStoreInLogOpen(true);
    }

    /** 弹出申请出库日志 */
    const openStoreOutLog = () => {
        setStoreOutLogElement(<StoreOutLog />);
        setStoreOutLogOpen(true);
    }

    /** 关闭库存申请日志弹窗 */
    const closeStoreLog = () => {
        setStoreInLogOpen(false);
        setStoreInLogElement(null);

        setStoreOutLogOpen(false);
        setStoreOutLogElement(null);
    }

    /** 库存商品SKU */
    const expandedRowRender = (record, index, indent, expanded) => {
        const columns = [
            {
                title: __('SKU image.'),
                width: 40,
                dataIndex: 'img_src',
                key: 'img_src',
                render: (text, record, index) => <Image src={record['img_src']} style={{ width: 50 }} />,
            },
            {
                title: __('SKU code.'),
                width: 160,
                dataIndex: 'sku',
                key: 'sku',
            },
            {
                title: __('SKU number.'),
                width: 50,
                dataIndex: 'num',
                key: 'num',
                render: (text, record, index) => record['num'] > 0 ? record['num'] : __('None store.')
            },
            {
                title: __('SKU price.'),
                width: 50,
                dataIndex: 'price',
                key: 'price',
            },
            {
                title: __('SKU value.'),
                width: 160,
                dataIndex: 'item_json',
                key: 'item_json',
                render: (text, record, index) => transformItemOption(record.item_json)
            },
            {
                title: __('Operation.'),
                width: 120,
                key: 'operation',
                fixed: 'right',
                render: (text, record, index) => (
                    <Space size={2} className="list-opt">
                        <Tag color="green" className="pointer" onClick={() => { storeTransferView(record.sku) }}>{__('Store transfer.')}</Tag>
                        <Tag color="gold" className="pointer" onClick={() => { addStoreOutList(record) }}>{__('Add store out list.')}</Tag>
                        <Tag color="processing" className="pointer" onClick={() => { applyStore(record) }}>{__('Apply store.')}</Tag>
                    </Space>
                ),
            },
        ];

        const items = record['store_goods_items'].map((v, k) => {
            return {
                key: k.toString(),
                ...v,
                name: record.name,
                logistics_id: record.logistics_id,
            }
        });

        return (
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            headerBorderRadius: 0,
                            cellFontSizeSM: 12
                        }
                    },
                }}
            >
                <Table bordered size="small" columns={columns} dataSource={items} pagination={false} style={{ width: 1200, margin: '10px 0 10px 100px' }} rowClassName={record => 'order-item-row'} />
            </ConfigProvider>
        );
    };

    /** 库存商品表格项目 */
    const columns = [
        {
            title: 'No.',
            width: 20,
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: __('Supply image.'),
            width: 40,
            dataIndex: 'img_src',
            key: 'img_src',
            render: (text, record, index) => <Image src={record['img_src']} style={{ width: 50 }} />,
        },
        {
            title: __('Supply name.'),
            width: 150,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: __('KSNCODE.'),
            width: 80,
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: __('User belongs to.'),
            width: 80,
            dataIndex: 'usernames',
            key: 'usernames',
        },
        {
            title: __('Logistic and Store.'),
            width: 80,
            dataIndex: 'nickname',
            key: 'nickname',
        },
        {
            title: __('Width.'),
            width: 40,
            dataIndex: 'goods_width',
            key: 'goods_width',
        },
        {
            title: __('Height.'),
            width: 40,
            dataIndex: 'goods_height',
            key: 'goods_height',
        },
        {
            title: __('Length.'),
            width: 40,
            dataIndex: 'goods_length',
            key: 'goods_length',
        },
        {
            title: __('Quality.'),
            width: 40,
            dataIndex: 'goods_quality',
            key: 'goods_quality',
        },
        {
            title: __('Add time.'),
            width: 80,
            dataIndex: 'addtime',
            key: 'addtime',
            render: (text, record, index) => timeFormat(record['addtime']),
        },
        {
            title: __('Operation.'),
            width: 80,
            key: 'operation',
            fixed: 'right',
            render: (text, record, index) => (
                <Space size={2} className="list-opt">
                    <Tag color="processing" className="pointer" onClick={() => { applyStore(record) }}>{__('Create new SKU.')}</Tag>
                    <Tag color="error" className="pointer" onClick={() => { storeGoodsDelete(record) }}>{__('Delete.')}</Tag>
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
                            <em>{__('Search.')}:</em>
                            <Input placeholder={`${__('Supply name.')}|${__('KSNCODE.')}|${__('User belongs to.')}`} className="input" value={searchParam['keyword']} onChange={(e) => { setSearch('keyword', e.target.value) }} />
                        </div>
                    </div>
                    <div className="content-btn-group">
                        <Space>
                            <Button type="primary" onClick={() => { setCurrentPage(1); getStore(1); }}>{__('Search.')}</Button>
                            <Button type="primary" onClick={() => { setSearchParam({}) }}>{__('Reset.')}</Button>
                        </Space>
                        <Space size={16}>
                            <Button type="primary" style={{ background: '#52c41a' }} onClick={openStoreOutLog}>{__('Store out log.')}</Button>
                            <Button type="primary" style={{ background: '#52c41a' }} onClick={openStoreInLog}>{__('Store in log.')}</Button>
                            <Badge count={storeOutListsCount}>
                                <Button type="primary" style={{ background: '#faad14' }} onClick={applyStoreOut}>{__('Store out list.')}</Button>
                            </Badge>
                            <Badge count={requestingCount}>
                                <Button type="primary" onClick={() => { applyStore(null) }}>{__('Request store in.')}</Button>
                            </Badge>
                        </Space>
                    </div>
                </div>
                <div className="table">
                    <ConfigProvider
                        theme={{
                            components: {
                                Table: {
                                    rowExpandedBg: '#f6ffed',
                                }
                            },
                        }}
                    >
                        <Table
                            bordered
                            size="small"
                            columns={columns}
                            dataSource={storeGoods}
                            expandable={{
                                expandedRowRender,
                                columnWidth: 20,
                                expandedRowKeys: expendedKeys,
                                onExpand: (event, record) => {
                                    if (event) {
                                        setExpendedKeys([...expendedKeys, record.key]);
                                    } else {
                                        setExpendedKeys(expendedKeys.filter(v => v !== record.key));
                                    }
                                }
                            }}
                            pagination={{
                                total: storeCount,
                                defaultPageSize: pageSize,
                                current: currentPage,
                                showSizeChanger: true,
                                onChange: (page) => {
                                    setCurrentPage(page);
                                    getStore(page);
                                },
                                onShowSizeChange: (current, size) => {
                                    setCurrentPage(1);
                                    setPageSize(size);
                                }
                            }}
                            scroll={{ x: 1500, y: 450 }}
                        />
                    </ConfigProvider>
                </div>
            </div>

            <Drawer
                title={drawOption.title}
                width={drawOption.width}
                maskClosable={false}
                onClose={closeDraw}
                open={drawStatus}
            >{drawElement}</Drawer>

            <Drawer
                title={storeOutDrawOption.title}
                width={storeOutDrawOption.width}
                maskClosable={false}
                onClose={closeStoreOutDraw}
                open={storeOutDrawStatus}
            >{storeOutDrawElement}</Drawer>

            <Modal
                open={storeTransferOpen}
                width={960}
                title={__('Store transfer.')}
                onCancel={closeStoreTransferView}
                footer={[]}
                forceRender
            >
                {storeTransferElement}
            </Modal>

            <Modal
                open={storeInLogOpen}
                closable={false}
                width={960}
                title={false}
                onCancel={closeStoreLog}
                footer={[]}
                forceRender
            >
                {storeInLogElement}
            </Modal>

            <Modal
                open={storeOutLogOpen}
                closable={false}
                width={1280}
                title={false}
                onCancel={closeStoreLog}
                footer={[]}
                forceRender
            >
                {storeOutLogElement}
            </Modal>

            <Loading loading={loading} />
        </div>
    );
}

export default StoreInfo;