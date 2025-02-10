import { Input, Button, Select, Table, Space, Drawer, Tag, Typography, Image, Empty, Tooltip, Badge, Modal, Avatar } from 'antd';
import { PlusOutlined, CommentOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import Loading from '../../components/loading';
import Title from '../../components/Title';
import { ItemAction } from '../../actions/ItemAction';
import SupplyMore from './SupplyMore';
import styles from './item.module.scss';
import SourcingView from './SourcingView';
import SupplySku from './SupplySku';
import OrderCreate from './OrderCreate';
import { shippingOption, supplyMarkets } from '../../Constants';
import OrderCreateFinished from './OrderCreateFinished';
import { __, transformItemOption } from '../../utils/functions';
import OrderCreateKsn from './OrderCreateKsn';
import TextArea from 'antd/es/input/TextArea';

function Sourcing(props) {
    const [items, setItems] = useState([]);//待采购订单商品
    const [logistics, setLogistics] = useState([]);//物流商列表
    const [storeInfo, setStoreInfo] = useState({});//商品库存信息
    const [mapping, setMapping] = useState(false);//商品自动匹配中
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [searchParam, setSearchParam] = useState({});//列表搜索参数
    const [drawStatusSku, setDrawStatusSku] = useState(false);//sku抽屉弹出状态
    const [drawOptionSku, setDrawOptionSku] = useState({});//sku抽屉配置选项
    const [drawElementSku, setDrawElementSku] = useState();//sku抽屉表单内容
    const [supplyMoreOpen, setSupplyMoreOpen] = useState(false);//是否弹出附加采购商品弹窗
    const [supplyMoreElement, setSupplyMoreElement] = useState(null);//附加采购商品弹窗组件
    const [modalOpen, setModalOpen] = useState(false);//是否弹出订单生成确认弹窗弹窗
    const [modalTitle, setModalTitle] = useState(false);//订单生成确认弹窗标题
    const [modalElement, setModalElement] = useState(null);//订单生成弹窗组件
    const [createdModalOpen, setCreatedModalOpen] = useState(false);//生成订单结果弹窗弹窗
    const [createdModalElement, setCreatedModalElement] = useState(null);//生成订单生成弹窗组件
    const [loading, setLoading] = useState('none');//加载转圈圈
    // const [initMapItem, setInitMapItem] = useState(true);

    const { Paragraph } = Typography;

    const remappingItem = {};

    const marketColorMap = {
        Yahoo: '#ff0033',
        Rakuten: '#bf0000',
        Wowma: '#eb5505',
        Qoo10: '#1262ae',
    };
    const supplyMarketColorMap = {
        1688: '#ef7c1b',
        taobao: '#ff9000',
        tmall: '#ff002b',
        store: '#237804',
    };

    useEffect(() => {
        getItems();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 加载待采购订单商品后，自动映射商品资料 */
    // useEffect(() => {
    //     initMapItem && mapItem();
    // }, [items]);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取订单数据和订单总数 */
    const getItems = async () => {
        setLoading('block');

        const res = await ItemAction.sourcing(searchParam);

        setItems(res.result.items.map((v, k) => (
            {
                key: v.id,
                number: k + 1,
                data: v
            }
        )));

        setLogistics(res.result.logistics);
        setStoreInfo(res.result.store);

        setLoading('none');
    }

    /** 设置列表搜索参数 */
    const setSearch = (key, value) => {
        setSearchParam({
            ...searchParam,
            [key]: value
        });
    }

    /** 采购商品自动映射 */
    const mapItem = async () => {
        //没有采购商品是不映射
        if (items.length === 0) return;

        setMapping(true);

        const res = await ItemAction.mapItem();
        console.log(res);

        getItems();

        setMapping(false);

        //执行一次后初始化标记设置为 false
        // setInitMapItem(false);
    }

    /** 获取采购商品url，并打开商品SKU弹窗 */
    const getSupplyUrl = async (item) => {
        remappingItem['item_id'] = item.item_id;
        remappingItem['item_options'] = item.item_options;

        /** 如果有采购商品url，直接打开商品SKU */
        if (item.supply_url) {
            openSupplySku({ searchUrl: item.supply_url });
            return false;
        }

        /** 如果没有采购商品url，则先查询item_id相同商品的采购商品url */
        const res = await ItemAction.getSupplyUrl(item.item_id);
        openSupplySku({ searchUrl: res.result });
    }

    /** 打开商品选项列表 */
    const openSupplySku = (_supplyData) => {
        setDrawStatusSku(true);
        setDrawOptionSku({
            title: __('Item SKU.'),
            width: 360
        });
        setDrawElementSku(<SupplySku supplyData={_supplyData} selectSku={selectSku} />);
    }

    /** 打开商品选项列表（附加采购商品） */
    const openSupplyMoreSku = (item) => {
        remappingItem['item_id'] = item.item_id;
        remappingItem['item_options'] = item.item_options;

        setDrawStatusSku(true);
        setDrawOptionSku({
            title: __('Item SKU.'),
            width: 360
        });
        setDrawElementSku(<SupplySku supplyData={{ supply_id: item.supply_id }} selectSku={setSupplyMoreSku} />);
    }

    /** 选择sku，更新订单商品，商品资料以及映射的采购商品 */
    const selectSku = async (mainInfo, sku) => {
        setLoading('block');

        mainInfo['supply_opt'] = sku.spec_id;
        mainInfo['supply_price'] = sku.price;

        if (sku.sku_image) {
            mainInfo['supply_image'] = sku.sku_image;
        }
        if (sku.data) {
            let _sku = {};
            sku.data.forEach(v => {
                _sku = { ..._sku, ...v };
            });
            mainInfo['supply_options'] = JSON.stringify(_sku);
        }

        const res = await ItemAction.remapItem({
            item_id: remappingItem.item_id,
            item_options: remappingItem.item_options,
            supply: mainInfo
        });

        if (res) {
            /** 重新渲染列表 */
            setItems(items.map(v => {
                if (v.data.item_id === remappingItem.item_id && v.data.item_options === remappingItem.item_options) {
                    return {
                        key: v.key,
                        number: v.number,
                        data: { ...v.data, ...res.result }
                    }
                }
                return v;
            }));
        }

        setLoading('none');
    }

    /** 选择sku，设置附加采购商品 */
    const setSupplyMoreSku = async (main, sku) => {
        const _supply = { ...main };
        _supply['supply_opt'] = sku.spec_id;
        _supply['supply_price'] = sku.price;
        _supply['supply_unit'] = 1;

        if (sku.sku_image) {
            _supply['supply_image'] = sku.sku_image;
        }
        if (sku.data) {
            let _sku = {};
            sku.data.forEach(v => {
                _sku = { ..._sku, ...v };
            });
            _supply['supply_options'] = JSON.stringify(_sku);
        }

        const res = await ItemAction.addSupplyMore({
            item_id: remappingItem.item_id,
            item_options: remappingItem.item_options,
            supply: _supply
        });

        if (res) {
            /** 重新渲染列表 */
            setItems(items.map(v => {
                if (v.data.item_id === remappingItem.item_id && v.data.item_options === remappingItem.item_options) {
                    const _orderItemMores = [...v.data.order_item_mores, res.result]

                    return {
                        key: v.key,
                        number: v.number,
                        data: { ...v.data, order_item_mores: _orderItemMores }
                    }
                }
                return v;
            }));
            console.log(res);
        }

        closeDrawSku();
    }

    /** 关闭二级抽屉 */
    const closeDrawSku = () => {
        setDrawStatusSku(false);
        setDrawElementSku(null);
    }

    /** 更新采购备注 */
    const updateSupplyMemo = async (supply_memo, item_id, item_options) => {
        const res = await ItemAction.updateSupplyMemo({ supply_memo, item_id, item_options });
        
        res && getItems();
    }

    /** 设置物流商/库存信息 */
    const updateLogistic = async (logistic_id, item_id, item_options) => {
        const res = await ItemAction.updateLogistic({ logistic_id, item_id, item_options });

        if (res) {
            const _logistics = logistics.filter(v => v.id === logistic_id);
            const _logistic = _logistics.length > 0 ? _logistics[0] : null;

            setItems(items.map(v => {
                if (v.data.item_id === item_id || v.data.item_options === item_options) {
                    v.data.logistic_id = logistic_id;
                    v.data.nickname = _logistic ? _logistic.nickname : null;
                    v.data.company = _logistic ? _logistic.company : null;
                    v.data.manager = _logistic ? _logistic.manager : null;
                }

                return v;
            }));
        }
    }

    const updateShippingOption = async (shipping_option, item_id, item_options) => {
        const res = await ItemAction.updateShippingOption({ shipping_option, item_id, item_options });
        console.log(res);
    }

    /** 采购商品详细表单弹出 */
    const sourcingView = (item_id, item_options) => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Sourcing item view.'),
            width: 480
        });
        setDrawElement(<SourcingView item_id={item_id} item_options={item_options} />);
    }

    /** 关闭抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
    }

    /** 弹出附加采购商品弹窗 */
    const supplyMoreView = (item) => {
        remappingItem['item_id'] = item.item_id;
        remappingItem['item_options'] = item.item_options;

        setSupplyMoreElement(<SupplyMore supply_id={item.supply_id} update={updateSupplyMore} delete={deleteSupplyMore} />);
        setSupplyMoreOpen(true);
    }

    /** 更新附加采购商品 */
    const updateSupplyMore = async (id, params) => {
        const res = await ItemAction.updateSupplyMore(id, {...params, ...remappingItem}, 'reset_mapped');
        console.log(res);
    }

    /** 删除附加采购商品 */
    const deleteSupplyMore = async (id) => {
        return await ItemAction.deleteSupplyMore(id, remappingItem, 'reset_mapped');
    }

    /** 关闭附加采购商品弹窗 */
    const closeSupplyMoreView = () => {
        setSupplyMoreOpen(false);
        setSupplyMoreElement(null);
        getItems();
    }

    /** 打开订单生成弹窗 */
    const orderCreateView = (market) => {
        if (market === 'alibaba') {
            setModalElement(<OrderCreate market={market} finished={orderCreateFinish} />);
        } else if (market === 'ksnshop') {
            setModalElement(<OrderCreateKsn market={market} finished={orderCreateFinish} />);
        } else {
            console.log(__('Parameter error.'));
            return false;
        }

        let _marketName = market;

        for (let i = 0; i < supplyMarkets.length; i++) {
            if (supplyMarkets[i].alias === market) {
                _marketName = supplyMarkets[i].code;
                break;
            }
        }

        setModalTitle(_marketName);
        setModalOpen(true);
    }

    /** 订单生成成功 */
    const orderCreateFinish = (result) => {
        /** 关闭订单生成弹窗 */
        closeOrderCreateView();

        /** 重新获取采购商品 */
        getItems();

        /** 采购结果弹窗 */
        orderCreateFinishedView(result);
    }

    /** 关闭订单生成弹窗 */
    const closeOrderCreateView = () => {
        setModalOpen(false);
        setModalElement(null);
    }

    /** 打开订单生成结果弹窗 */
    const orderCreateFinishedView = (result) => {
        setCreatedModalElement(<OrderCreateFinished result={result} close={closeOrderCreateFinishedView} />);
        setCreatedModalOpen(true);
    }

    /** 关闭订单生成结果弹窗 */
    const closeOrderCreateFinishedView = () => {
        setCreatedModalOpen(false);
        setCreatedModalElement(null);
    }

    /** 待采购订单商品 html render */
    const orderItemRender = (record) => (
        <Badge.Ribbon text={record.data.market} color={marketColorMap[record.data.market]} style={{ top: -5, right: -16, zIndex: 999 }}>
            <div className={styles['sourcing-item']}>
                <Image style={{ width: 60 }} src={
                    record.data.item_image !== ''
                        ? record.data.item_image
                        : (record.data.supply_image !== ''
                            ? record.data.supply_image
                            : require('../../assets/img/gift.png'
                            ))} />
                <div className={styles['item-data']}>
                    <h3>{__('Item ID.')}: {record.data.item_id}</h3>
                    <Paragraph ellipsis={{ rows: 2 }} className="pointer" underline style={{ fontSize: 12, marginBottom: 8, minHeight: 40 }} title={record.data.item_name} onClick={() => { window.open(record.data.item_url) }}>{record.data.item_name}</Paragraph>
                    <section>
                        <Tooltip placement="bottomLeft" title={record.data.item_options}>
                            <p>{transformItemOption(record.data.item_options)}</p>
                        </Tooltip>
                        <strong>x {record.data.total_count}</strong>
                    </section>
                </div>
            </div>
        </Badge.Ribbon>
    );

    /** 采购商品 html render */
    const supplyItemRender = (record) => (
        <div className={styles['mapped-item']}>
            {
                record.data.supply_id === 0
                    ? (record.data.supply_memo !== ''
                        ? <Paragraph
                            style={{padding: 16, wordBreak: 'break-all'}}
                            ellipsis={{ rows: 2, tooltip: record.data.supply_memo}}
                        >{record.data.supply_memo}</Paragraph>
                        : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />
                    )
                    : <Badge.Ribbon text={record.data.supply_market} color={supplyMarketColorMap[record.data.supply_market]} style={{ top: -5, right: -16, zIndex: 999 }}>
                        <div className={styles['sourcing-item']}>
                            <Image style={{ width: 60 }} src={record.data.supply_image !== '' ? record.data.supply_image : require('../../assets/img/gift.png')} />
                            <div className={styles['item-data']}>
                                <h3>
                                    <strong>{__('Item ID.')}: {record.data.supply_code}</strong>
                                    {
                                        record.data.supply_market === '1688'
                                        && <Tag color={supplyMarketColorMap[record.data.supply_market]}>{__('Create 1688 order.')}</Tag>
                                    }
                                    {
                                        record.data.supply_market === 'store'
                                        && <Tag color={supplyMarketColorMap[record.data.supply_market]}>{__('Stored item.')}</Tag>
                                    }
                                </h3>
                                <Paragraph ellipsis={{ rows: 1 }} className="pointer" underline style={{ fontSize: 12, marginBottom: 4 }} title={record.data.supply_name} onClick={() => { window.open(record.data.supply_url) }}>{record.data.supply_name}</Paragraph>
                                <section>
                                    <Tooltip placement="bottomLeft" title={`${transformItemOption(record.data.supply_options)} x ${record.data.supply_unit}`}>
                                        <p>{transformItemOption(record.data.supply_options)} x {record.data.supply_unit}</p>
                                    </Tooltip>
                                    <strong>{record.data.supply_price > 0 ? `￥${record.data.supply_price}` : '--'}</strong>
                                </section>
                                <div className={styles['supply-more']}>
                                    <Avatar.Group shape="square" size={30}>
                                        {record.data.order_item_mores.map((v, k) => (
                                            <Tooltip
                                                key={k}
                                                title={
                                                    <>
                                                        <div>{v.supply_name}</div>
                                                        <div>{transformItemOption(v.supply_options)}</div>
                                                    </>
                                                }
                                                placement="top"
                                                color="#597ef7"
                                            >
                                                <Avatar
                                                    src={v.supply_image}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => { supplyMoreView(record.data) }}
                                                />
                                            </Tooltip>
                                        ))}

                                        <Tooltip title={__('Add additional supply item.')} placement="top">
                                            <Avatar style={{ cursor: 'pointer' }} icon={<PlusOutlined />} onClick={() => { openSupplyMoreSku(record.data) }} />
                                        </Tooltip>
                                    </Avatar.Group>
                                </div>
                            </div>
                        </div>
                    </Badge.Ribbon>
            }
            <Space>
                <Tooltip title={__('Item map.')}>
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                        style={{ position: 'absolute', left: 0, bottom: 0, zIndex: 999 }}
                        size="small"
                        onClick={() => { getSupplyUrl(record.data) }}
                    />
                </Tooltip>
                <Tooltip 
                    placement="top"
                    color="white"
                    trigger="click"
                    title={<TextArea
                        style={{fontSize: '13px', resize: 'none', scrollbarWidth: 'none', width: '240px'}}
                        rows={5}
                        onBlur={e => updateSupplyMemo(e.target.value, record.data.item_id, record.data.item_options)}
                        defaultValue={record.data.supply_memo}
                        placeholder={__('Please input supply memo.')}
                    />}
                >
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<CommentOutlined />}
                        style={{ position: 'absolute', left: 30, bottom: 0, zIndex: 999, background: '#52c41a' }}
                        size="small"
                    />
                </Tooltip>
            </Space>
        </div>
    );

    /** 物流商，库存 html render */
    const logisticRender = (record) => (
        <ul className={styles['logistic']}>
            <li>
                <i>{__('Please select logistic.')}: </i>
                <Select
                    size="small"
                    defaultValue={record.data.logistic_id}
                    style={{
                        width: 120,
                        marginLeft: 10
                    }}
                    onChange={(e) => { updateLogistic(e, record.data.item_id, record.data.item_options) }}
                    options={[{ label: __('Please select logistic.'), value: 0 }, ...logistics.map(v => ({ label: v.nickname, value: v.id }))]}
                />
            </li>
            <li>
                <i>{__('Name abbr.')}: </i>
                <strong>{record.data.nickname ? record.data.nickname : '-'}</strong>
            </li>
            <li>
                <i>{__('Manager.')}: </i>
                <strong>{record.data.manager ? record.data.manager : '-'}</strong>
            </li>
            <li>
                <i>{__('Shipping option.')}</i>
                <Select
                    size="small"
                    placeholder={__('Shipping option.')}
                    defaultValue={record.data.shipping_option + ''}
                    onChange={(e) => { updateShippingOption(e, record.data.item_id, record.data.item_options) }}
                    style={{ width: 120, marginLeft: 10 }}
                    options={Object.keys(shippingOption).map(val => (
                        {
                            value: val,
                            label: shippingOption[val]
                        }
                    ))}
                />
            </li>
        </ul>
    );

    /** 库存数量 */
    const depotRender = (record) => {
        let _store = '0';
        let _outing = '0';

        if (storeInfo[record.data.supply_opt]) {
            _store = storeInfo[record.data.supply_opt]['store'];
            _outing = storeInfo[record.data.supply_opt]['outing'];
        }
        let _remain = _store - _outing;

        return (
            <ul className={styles['depot']}>
                <li>
                    <i>{__('Depot Number.')}: </i>
                    <strong>{_store}</strong>
                </li>
                <li>
                    <i>{__('Using.')}: </i>
                    <strong>{_outing}</strong>
                </li>
                <li>
                    <i>{__('Available.')}: </i>
                    <em>{_remain}</em>
                </li>
            </ul>
        );
    };

    /** 表格项目 */
    const columns = [
        {
            title: 'No.',
            width: 30,
            dataIndex: 'number',
            key: 'number',
            className: 'align-middle',
        },
        {
            title: __('Sourcing order items.'),
            width: 300,
            dataIndex: 'order_item',
            key: 'order_item',
            className: 'align-middle',
            render: (text, record, index) => orderItemRender(record),
        },
        {
            title: __('Supply items.'),
            width: 300,
            dataIndex: 'supply_item',
            key: 'supply_item',
            className: 'align-middle',
            render: (text, record, index) => supplyItemRender(record),
        },
        {
            title: __('Logistic.'),
            width: 150,
            dataIndex: 'logistic',
            key: 'logistic',
            className: 'align-middle',
            render: (text, record, index) => logisticRender(record),
        },
        {
            title: __('Depot Number.'),
            width: 80,
            dataIndex: 'depot',
            key: 'depot',
            className: 'align-middle',
            render: (text, record, index) => depotRender(record),
        },
        {
            title: __('Operation.'),
            width: 100,
            key: 'operation',
            className: 'align-middle',
            fixed: 'right',
            render: (text, record, index) => {
                return (
                    <Space size={2} className="list-opt" direction="vertical">
                        <Tag color="processing" className="pointer" onClick={() => { sourcingView(record.data.item_id, record.data.item_options); }}>{__('View more.')}</Tag>
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
                            <em>{__('Item type.')}:</em>
                            <Select
                                className="select"
                                value={searchParam['supply_type']}
                                onChange={(e) => { setSearch('supply_type', e) }}
                                options={[
                                    {
                                        value: 'matched',
                                        label: __('Mapped.'),
                                    },
                                    {
                                        value: 'unmatched',
                                        label: __('Not Mapped.'),
                                    },
                                    {
                                        value: 'depot',
                                        label: __('Stored item.'),
                                    }
                                ]}
                            />
                        </div>
                        <div className="search-elem">
                            <em>{__('Sourcing status.')}:</em>
                            <Select
                                className="select"
                                value={searchParam['source_status']}
                                onChange={(e) => { setSearch('source_status', e) }}
                                options={[
                                    {
                                        value: 'sourcing',
                                        label: __('Sourcing Now.'),
                                    },
                                    {
                                        value: 'sourced',
                                        label: __('Already sourced.'),
                                    }
                                ]}
                            />
                        </div>
                        <div className="search-elem">
                            <em>{__('Search by keywords.')}:</em>
                            <Input placeholder={`${__('Item ID.')}|${__('Item name.')}|${__('Item options.')}|${__('Order ID.')}|${__('Shop ID.')}`} className="input" value={searchParam['keyword']} style={{ width: 240 }} onChange={(e) => { setSearch('keyword', e.target.value) }} />
                        </div>
                    </div>
                    <div className="content-btn-group">
                        <Space>
                            <Button type="primary" onClick={() => { getItems() }}>{__('Search.')}</Button>
                            <Button type="primary" onClick={() => { setSearchParam({}) }}>{__('Reset.')}</Button>
                        </Space>
                        <Space>
                            <Button type="primary" style={{ background: '#08979c' }} onClick={() => { orderCreateView('ksnshop') }}>{__('Order create in ksnshop.')}</Button>
                            <Button type="primary" style={{ background: '#08979c' }} onClick={() => { orderCreateView('alibaba') }}>{__('Order create in 1688.')}</Button>
                            <Button type="primary" style={{ background: '#faad14' }} onClick={mapItem} loading={mapping}>{__('Auto mapping.')}</Button>
                        </Space>
                    </div>
                </div>
                <div className="table">
                    <Table
                        bordered
                        size="small"
                        columns={columns}
                        dataSource={items}
                        pagination={false}
                        scroll={{ x: 1500, y: 540 }}
                    />
                </div>
            </div>

            <Drawer
                title={drawOption.title}
                width={drawOption.width}
                maskClosable={false}
                bodyStyle={{ paddingTop: 0 }}
                onClose={closeDraw}
                open={drawStatus}
            >{drawElement}</Drawer>

            <Drawer
                title={drawOptionSku.title}
                width={drawOptionSku.width}
                onClose={closeDrawSku}
                open={drawStatusSku}
                bodyStyle={{ padding: 12 }}
            >{drawElementSku}</Drawer>

            <Modal
                open={modalOpen}
                width={960}
                title={`${modalTitle}${__('Confirm orders created automatically.')}`}
                onCancel={closeOrderCreateView}
                footer={[]}
                forceRender
            >
                {modalElement}
            </Modal>

            <Modal
                open={createdModalOpen}
                width={960}
                title={__('Sourced items.')}
                onCancel={closeOrderCreateFinishedView}
                footer={[]}
                forceRender
            >
                {createdModalElement}
            </Modal>

            <Modal
                open={supplyMoreOpen}
                width={960}
                title={__('Additional supply item.')}
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

export default Sourcing;