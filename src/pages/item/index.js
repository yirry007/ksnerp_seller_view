import { Input, Button, Select, Table, Space, Modal, Drawer, Tag, Typography, Image, message, Avatar } from 'antd';
import { useEffect, useState } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Loading from '../../components/loading';
import Title from '../../components/Title';
import { marketIcons, markets } from '../../Constants';
import { ItemAction } from '../../actions/ItemAction';
import SupplyMore from './SupplyMore';
import { __, addComma, transformItemOption } from '../../utils/functions';
import ItemEdit from './edit';
import Merge from './Merge';

function Item(props) {
    const [totalCount, setTotalCount] = useState(0);//商品资料总数量
    const [items, setItems] = useState([]);//店铺列表
    const [discovering, setDiscovering] = useState(false);//新商品发现中
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [modalOpen, setModalOpen] = useState(false);//是否弹出商品资料合并弹窗
    const [modalElement, setModalElement] = useState(null);//商品资料合并弹窗组件
    const [supplyMoreOpen, setSupplyMoreOpen] = useState(false);//是否弹出附加采购商品弹窗
    const [supplyMoreElement, setSupplyMoreElement] = useState(null);//附加采购商品弹窗组件
    const [searchParam, setSearchParam] = useState({});//列表搜索参数
    const [pageSize, setPageSize] = useState(10);//每页显示数量
    const [currentPage, setCurrentPage] = useState(1);//标记当前页
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);//列表中勾选的商品
    const [mainItem, setMainItem] = useState();//合并主体商品id
    const [loading, setLoading] = useState('none');//加载转圈圈

    const { confirm } = Modal;
    const { Paragraph } = Typography;

    const itemStatusIcons = {
        0: <Tag color="default">{__('Init.')}</Tag>,
        1: <Tag color="processing">{__('Not edited.')}</Tag>,
        2: <Tag color="success">{__('Edited.')}</Tag>,
        3: <Tag color="cyan">{__('Merged')}</Tag>,
        4: <Tag color="error">{__('Reserved.')}</Tag>,
    };

    /** 列表勾选 */
    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        columnWidth: 30,
        selectedRowKeys,
        onChange: onSelectChange
    };

    /** 页面加载或筛选的订单状态改变后获取订单数据 */
    useEffect(() => {
        getItems(1);
    }, [pageSize]);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取订单数据和订单总数 */
    const getItems = async (page = currentPage, page_size = pageSize) => {
        setLoading('block');

        const res = await ItemAction.list(searchParam, page, page_size);

        if (res.code === '') {
            setTotalCount(res.result.count);
            setSelectedRowKeys([]);//重置勾选的订单列表

            setItems(res.result.items.map((v, k) => (
                {
                    key: v.id,
                    number: k + 1,
                    item_image: v.item_image,
                    supply_image: v.supply_image,
                    item_id: v.item_id,
                    market: v.market,
                    item_name: <Paragraph ellipsis={{ rows: 3 }} title={v.item_name}>{v.item_name}</Paragraph>,
                    ksn_code: v.ksn_code,
                    item_price: addComma(v.item_price),
                    item_url: v.item_url,
                    item_options: v.item_options,
                    is_depot: v.is_depot,
                    supply_id: v.supply_id,
                    logistic: v.nickname ? v.nickname : '-',
                    inventory: v.inventory,
                    status: v.status,
                    supply_more_count: v.supply_more_count,
                    id: v.id,
                    merged_ksn_code: v.merged_ksn_code,
                    merging_ksn_code: v.merging_ksn_code,
                    data: v
                }
            )));
        }

        setLoading('none');
    }

    /** 发现新商品 */
    const discover = async () => {
        setDiscovering(true);

        const res = await ItemAction.discover();
        console.log(res);

        getItems();

        setDiscovering(false);
    }

    /** 设置列表搜索参数 */
    const setSearch = (key, value) => {
        setSearchParam({
            ...searchParam,
            [key]: value
        });
    }

    /** 打开商品资料合并窗口 */
    const itemMergeView = () => {
        const itemIdArr = rowSelection.selectedRowKeys;

        if (itemIdArr.length === 0) {
            message.error(__('Please select the item.'));
            return false;
        }

        const _items = items.filter(v => itemIdArr.includes(v.id));

        setModalElement(<Merge items={_items} setMain={(item_id) => { setMainItem(item_id) }} />);
        setModalOpen(true);
    }

    /** 关闭商品资料合并弹窗 */
    const closeItemMergeView = () => {
        setModalOpen(false);
        setModalElement(null);
        setMainItem(null);
    }

    /** 商品资料合并 */
    const itemMerge = async () => {
        setLoading('block');

        if (!mainItem) {
            message.error(__('Please select main merging item.'));
            setLoading('none');
            return false;
        }

        const res = await ItemAction.merge({ item_ids: selectedRowKeys, main_item_id: mainItem });

        closeItemMergeView();
        setLoading('none');

        /** 商品资料合并后重新获取当前页的商品数据 */
        res && getItems();
    }

    /** 编辑商品资料表单弹出 */
    const itemEdit = (item) => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Edit item info.'),
            width: 720
        });
        setDrawElement(<ItemEdit item_id={item.id} updated={requestFinish} />);
    }

    /** 新增，更新数据后关闭抽屉，重新获取列表数据 */
    const requestFinish = () => {
        closeDraw();
        getItems();
    }

    /** 关闭抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
    }

    /** 弹出附加采购商品弹窗 */
    const supplyMoreView = (supply_id) => {
        setSupplyMoreElement(<SupplyMore supply_id={supply_id} update={updateSupplyMore} delete={deleteSupplyMore} />);
        setSupplyMoreOpen(true);
    }

    /** 更新附加采购商品 */
    const updateSupplyMore = async (id, params) => {
        const res = await ItemAction.updateSupplyMore(id, params);
        console.log(res);
    }

    /** 删除附加采购商品 */
    const deleteSupplyMore = async (id) => {
        return await ItemAction.deleteSupplyMore(id);
    }

    /** 关闭附加采购商品弹窗 */
    const closeSupplyMoreView = () => {
        setSupplyMoreOpen(false);
        setSupplyMoreElement(null);
        getItems();
    }

    /**
     * 状态改为保留与还原
     * 0：初始化（订单商品中新发现的商品），1：未编辑（谷歌插件自动映射），2：已编辑（手动调整过），3：被合并，4：保留（被丢弃）
     * 9：从保留的状态还原为其他状态
     */
    const changeStatus = (id, ksn_code, status) => {
        const confirmText = status === 4 ? __('Confirm to reserve item.') : __('Confirm to restore item.');

        confirm({
            icon: <ExclamationCircleOutlined />,
            title: `${__('KSNCODE.')}: ${ksn_code}`,
            content: confirmText,
            okText: __('Confirm.'),
            cancelText: __('Cancel.'),
            onOk: async () => {
                const res = await ItemAction.changeStatus(id, { status });
                /** 订单改为保留或还原后重新获取当前页的订单数据 */
                res && getItems();
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
            className: 'align-middle',
        },
        {
            title: __('Item image.'),
            width: 100,
            dataIndex: 'item_image',
            key: 'item_image',
            className: 'align-middle align-center',
            render: (text, record, index) => {
                const _image = record.item_image && record.item_image !== ''
                    ? record.item_image
                    : (record.supply_image && record.supply_image !== ''
                        ? record.supply_image
                        : require('../../assets/img/gift.png')
                    );

                return record.supply_more_count > 0
                    ? (
                        <Avatar.Group>
                            <Image src={_image} width={60} />
                            <Avatar
                                size="middle"
                                style={{ backgroundColor: '#fa541c', cursor: 'pointer'}}
                                onClick={() => {supplyMoreView(record.supply_id)}}
                            >
                                +{record.supply_more_count}
                            </Avatar>
                        </Avatar.Group>
                    )
                    : <Image src={_image} width={60} />
            },
        },
        {
            title: __('Item ID.'),
            width: 100,
            dataIndex: 'item_id',
            key: 'item_id',
            className: 'align-middle',
        },
        {
            title: __('Shop type.'),
            width: 80,
            dataIndex: 'market',
            key: 'market',
            className: 'align-middle',
            render: (text, record, index) => (
                marketIcons[record.market] ? <img src={require('../../assets/img/' + record.market.toLowerCase() + '.png')} alt={record.market} style={{ width: '50px' }} /> : record.market
            )
        },
        {
            title: __('Item name.'),
            width: 160,
            dataIndex: 'item_name',
            key: 'item_name',
            className: 'align-middle',
        },
        {
            title: __('KSNCODE.'),
            width: 100,
            dataIndex: 'ksn_code',
            key: 'ksn_code',
            className: 'align-middle',
        },
        {
            title: __('Merged info.'),
            width: 100,
            dataIndex: 'merge',
            key: 'merge',
            className: 'align-middle',
            render: (text, record, index) => {
                if (record.merged_ksn_code !== '') {
                    return __('Merged main.');
                } else if (record.merging_ksn_code !== '') {
                    return record.merging_ksn_code;
                } else {
                    return '-';
                }
            }
        },
        {
            title: __('Item price.'),
            width: 80,
            dataIndex: 'item_price',
            key: 'item_price',
            className: 'align-middle',
        },
        {
            title: __('Supply url.'),
            width: 120,
            dataIndex: 'item_url',
            key: 'item_url',
            className: 'align-middle',
            render: (text, record, index) => (
                <Paragraph ellipsis={{ rows: 3 }} className="pointer" underline title={record.item_url} onClick={() => { window.open(record.item_url) }}>{record.item_url}</Paragraph>
            )
        },
        {
            title: __('Item options.'),
            width: 120,
            dataIndex: 'item_options',
            key: 'item_options',
            className: 'align-middle',
            render: (text, record, index) => (
                <Paragraph ellipsis={{ rows: 3 }} title={transformItemOption(record.item_options)}>
                    <div dangerouslySetInnerHTML={{ __html: transformItemOption(record.item_options, 'html') }} />
                </Paragraph>
            )
        },
        {
            title: __('Is depot.'),
            width: 80,
            dataIndex: 'is_depot',
            key: 'is_depot',
            className: 'align-middle',
            render: (text, record, index) => (
                record.is_depot === 1
                    ? <Tag color="success">{__('Depot.')}</Tag>
                    : <Tag color="error">{__('Not depot.')}</Tag>
            )
        },
        {
            title: __('Supply ID.'),
            width: 80,
            dataIndex: 'supply_id',
            key: 'supply_id',
            className: 'align-middle',
            render: (text, record, index) => (
                record.supply_id > 0
                    ? <Tag color="success">{__('Mapped.')}</Tag>
                    : <Tag color="error">{__('Not Mapped.')}</Tag>
            )
        },
        {
            title: __('Logistic.'),
            width: 100,
            dataIndex: 'logistic',
            key: 'logistic',
            className: 'align-middle',
        },
        {
            title: __('Depot Number.'),
            width: 80,
            dataIndex: 'inventory',
            key: 'inventory',
            className: 'align-middle',
        },
        {
            title: __('Item status.'),
            width: 80,
            dataIndex: 'status',
            key: 'status',
            className: 'align-middle',
            render: (text, record, index) => itemStatusIcons[record.status]
        },
        {
            title: __('Operation.'),
            width: 120,
            key: 'operation',
            fixed: 'right',
            className: 'align-middle',
            render: (text, record, index) => {
                return (
                    <Space size={2} className="list-opt">
                        <Tag color="processing" className="pointer" onClick={() => { itemEdit(record) }}>{__('Edit.')}</Tag>
                        {record.status === 4
                            ? <Tag color="warning" className="pointer" onClick={() => { changeStatus(record.id, record.ksn_code, 9); }}>{__('Restore.')}</Tag>
                            : <Tag color="error" className="pointer" onClick={() => { changeStatus(record.id, record.ksn_code, 4); }}>{__('Reserve.')}</Tag>
                        }
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
                            <em>{__('Search.')}:</em>
                            <Input placeholder={`${__('Item ID.')} | ${__('KSNCODE.')} | ${__('Item name.')}`} className="input" value={searchParam['keyword']} style={{ width: 240 }} onChange={(e) => { setSearch('keyword', e.target.value) }} />
                        </div>
                        <div className="search-elem">
                            <em>{__('Is depot.')}:</em>
                            <Select
                                value={searchParam['is_depot']}
                                onChange={(e) => { setSearch('is_depot', e) }}
                                options={[
                                    { value: '1', label: __('Depot.') },
                                    { value: '0', label: __('Not depot.') },
                                ]}
                                className="select"
                                style={{ width: 160 }}
                            />
                        </div>
                        <div className="search-elem">
                            <em>{__('Status.')}:</em>
                            <Select
                                value={searchParam['status']}
                                onChange={(e) => { setSearch('status', e) }}
                                options={[
                                    { value: '0', label: __('Init.') },
                                    { value: '1', label: __('Not edited.') },
                                    { value: '2', label: __('Edited.') },
                                    { value: '3', label: __('Merged.') },
                                ]}
                                className="select"
                                style={{ width: 160 }}
                            />
                        </div>
                    </div>
                    <div className="content-btn-group">
                        <Space>
                            <Button type="primary" onClick={() => { setCurrentPage(1); getItems(1) }}>{__('Search.')}</Button>
                            <Button type="primary" onClick={() => { setSearchParam({}) }}>{__('Reset.')}</Button>
                            <Button type="primary" style={{ background: '#08979c' }} onClick={itemMergeView}>{__('Merge item.')}</Button>
                        </Space>
                        <Space>
                            <Button type="primary" style={{ background: '#faad14' }} onClick={discover} loading={discovering}>{__('Discover new item.')}</Button>
                        </Space>
                    </div>
                </div>
                <div className="table">
                    <Table
                        bordered
                        size="small"
                        columns={columns}
                        dataSource={items}
                        rowSelection={rowSelection}
                        pagination={{
                            total: totalCount,
                            defaultPageSize: pageSize,
                            current: currentPage,
                            showSizeChanger: true,
                            onChange: (page) => {
                                setCurrentPage(page);
                                getItems(page);
                            },
                            onShowSizeChange: (current, size) => {
                                setCurrentPage(1);
                                setPageSize(size);
                            }
                        }}
                        scroll={{ x: 1500, y: 450 }}
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

            <Modal
                open={modalOpen}
                width={650}
                title={__('Merge item.')}
                okText={__('Confirm to merge.')}
                cancelText={__('Cancel.')}
                onOk={itemMerge}
                onCancel={closeItemMergeView}
                forceRender
            >
                {modalElement}
            </Modal>

            <Modal
                open={supplyMoreOpen}
                width={960}
                title="附加采购商品"
                onCancel={closeSupplyMoreView}
                footer={[]}
                forceRender
            >
                {supplyMoreElement}
            </Modal>

            <Loading loading={loading} />
        </div>
    );
}

export default Item;