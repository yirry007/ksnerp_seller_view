import { Input, Button, Select, Table, Space, Tooltip, ConfigProvider, Radio, Badge, Drawer, Modal, Tag, Checkbox, Typography, InputNumber } from 'antd';
import { ExclamationCircleOutlined, LinkOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import Title from '../../components/Title';
import { OrderAction } from '../../actions/OrderAction';
import { useEffect, useState } from 'react';
import Loading from '../../components/loading';
import { excelExportableOrderStatus, excelImportableOrderStatus, marketIcons, markets, orderStatusMap, shippingCompany, shippingOption, supplyMarkets, updatableOrderStatus } from '../../Constants';
import OrderView from './view';
import { __, addComma, buildItemInfos, buildItemOption, getByteSize } from '../../utils/functions';
import UpdateConfrim from './UpdateConfirm';
import styles from './order.module.scss';
import EmailSendLog from './EmailSendLog';
import ExcelImport from './ExcelImport';
import ExcelExport from './ExcelExport';
import OrderItemMore from './OrderItemMore';
import TextArea from 'antd/es/input/TextArea';
// import Delivery from './Delivery';
import Shipping from './Shipping';

let _updating = false;//标记是否正在后端更新订单，用于判断是否刷新页面，值为 true（正在更新）时，后端api返回的结果是不进行更新订单，则刷新页面
let timer = null;

function Order(props) {
    const [orders, setOrders] = useState([]);//订单列表数据
    const [orderCount, setOrderCount] = useState({
        all: 0,
        total: 0,
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        98: 0,
        99: 0,
        100: 0
    });//订单数据统计
    const [orderUpdating, setOrderUpdating] = useState({
        title: __('Click and update order data.'),
        btnText: __('Click and update.'),
        loading: false
    });//订单实时更新的状态
    const [logistics, setLogistics] = useState([]);//物流商列表
    const [orderItemLogisticMap, setOrderItemLogisticMap] = useState({});//订单商品和物流商映射表
    const [expendedKeys, setExpendedKeys] = useState([]);//展开订单商品数据
    const [modalOpen, setModalOpen] = useState(false);//是否弹出订单状态更新弹窗
    const [modalElement, setModalElement] = useState(null);//订单状态更新弹窗组件
    const [shopEmailTemplateMap, setShopEmailTemplateMap] = useState({});//子组件（modalElement）中设置的店铺邮件映射
    const [orderShippingInfo, setOrderShippingInfo] = useState({});//子组件（modalElement）中设置的订单物流信息
    const [shippingDate, setShippingDate] = useState(null);//子组件（modalElement）中设置的发货日期（强制更新）
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [searchParam, setSearchParam] = useState({ order_status: '0' });//列表搜索参数，默认为新规订单
    const [pageSize, setPageSize] = useState(10);//每页显示数量
    const [currentPage, setCurrentPage] = useState(1);//标记当前页
    const [loading, setLoading] = useState('block');//加载转圈圈
    const [orderStatus, setOrderStatus] = useState(0);//当前页面的订单状态（后端接收的订单状态），以此判断是否显示更新状态按钮，默认为新规订单
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);//列表中勾选的订单(order_id List)
    const [updateConfirmTitle, setUpdateConfirmTitle] = useState('');//子组件（modalElement）弹窗标题
    const [emailSendLogsModal, setEmailSendLogsModal] = useState(false);//邮件发送日志弹窗开启状态
    const [emailSendLogsView, setEmailSendLogsView] = useState(null);//邮件发送日志弹窗组件
    const [excelExportModal, setExcelExportModal] = useState(false);//Excel导出弹窗开启状态
    const [excelExportView, setExcelExportView] = useState(null);//Excel导出弹窗组件
    const [excelImportModal, setExcelImportModal] = useState(false);//Excel导入弹窗开启状态
    const [excelImportView, setExcelImportView] = useState(null);//Excel导入弹窗组件
    const [supplyMoreOpen, setSupplyMoreOpen] = useState(false);//是否弹出附加采购商品弹窗
    const [supplyMoreElement, setSupplyMoreElement] = useState(null);//附加采购商品弹窗组件
    const [deliveryOpen, setDeliveryOpen] = useState(false);//是否弹出快递查询弹窗
    const [deliveryElement, setDeliveryElement] = useState(null);//快递查询弹窗组件
    const [shippingOpen, setShippingOpen] = useState(false);//是否弹出国际物流查询弹窗
    const [shippingElement, setShippingElement] = useState(null);//国际物流查询弹窗组件
    const [defaultShippingChecked, setDefaultShippingChecked] = useState([]);//设置默认的国际物流信息勾选状态
    const [showOrderItemBtn, setShowOrderItemBtn] = useState('全部隐藏');

    const { confirm } = Modal;
    const { Paragraph } = Typography;

    /** 列表勾选 */
    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        columnWidth: 24,
        selectedRowKeys,
        onChange: onSelectChange
    };

    const checkProcessPeriod = 8000;//检查后端更新订单进程的周期（毫秒）

    /** 页面加载或筛选的订单状态改变后获取订单数据 */
    useEffect(() => {
        getOrders(1);
    }, [searchParam['order_status'], pageSize]);// eslint-disable-line react-hooks/exhaustive-deps

    /** ajax 轮询，检测后端订单更新进程状态 */
    useEffect(() => {
        checkOrderProcess();
        timer = setInterval(() => {
            checkOrderProcess();
        }, checkProcessPeriod);
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取订单数据和订单总数 */
    const getOrders = async (page = currentPage, page_size = pageSize) => {
        setLoading('block');

        const res = await OrderAction.list(searchParam, page, page_size);

        if (res.code === '') {
            const _expendedKeys = [];
            const _orders = [];
            const _defaultShipping = [];

            res.result.orders.forEach((v, k) => {
                /** 商品信息展开设置 */
                _expendedKeys.push(v.order_id);

                /** 构建订单列表 */
                _orders.push({
                    key: v.order_id,
                    number: k + 1,
                    market: marketIcons[v.market] ? <img src={require('../../assets/img/' + v.market.toLowerCase() + '.png')} alt={v.market} style={{ width: '40px' }} /> : v.market,
                    sh_shop_id: v.sh_shop_id,
                    order_id: v.order_id,
                    order_status: orderStatusMap[v.order_status],
                    total_price: addComma(v.total_price),
                    order_time: v.order_time,
                    remark: v.remark && v.remark !== '' ? v.remark : '-',
                    email_sended: emailStatusButtons(v.id, v.email_send_logs),
                    id: v.id,
                    data: v,
                    items: v.order_items
                });

                /** 设置订单商品国际物流信息的"设为默认"映射 */
                v.order_items.forEach(item => {
                    _defaultShipping.push({
                        order_item_id: item.id,
                        order_id: v.id,
                        checked: item.shipping_default === 1
                    });
                });
            });

            setOrders(_orders);
            setOrderCount(res.result.count);//设置各状态的订单数量
            setOrderStatus(res.result.status);//设置当前筛选的订单状态
            setLogistics(res.result.logistics);//设置物流商列表
            setExpendedKeys(_expendedKeys);//订单商品数据展开（全部展开）
            setShowOrderItemBtn('全部隐藏');//重置订单商品显示隐藏按钮
            setDefaultShippingChecked(_defaultShipping);
            setSelectedRowKeys([]);//重置勾选的订单列表
        }

        setLoading('none');
    }

    /** 订单列表中邮件发送状态按钮 */
    const emailStatusButtons = (order_id, emailSendLogs) => {
        const thanksMailSended = emailSendLogs.find(v => v.template_type === 0 && v.is_success === 1);
        const shippedMailSended = emailSendLogs.find(v => v.template_type === 4 && v.is_success === 1);

        return (
            <Space size={[0, 8]} wrap>
                <Tag
                    icon={thanksMailSended ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={thanksMailSended ? 'success' : 'error'}
                    className="pointer"
                    title={__('List thanks email sending logs.')}
                    onClick={() => { openSendEmailLogsModal(order_id, 0, __('Thanks email sending logs.')) }}
                >Thanks</Tag>
                <Tag
                    icon={shippedMailSended ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={shippedMailSended ? 'success' : 'error'}
                    className="pointer"
                    title={__('List shipping email sending logs.')}
                    onClick={() => { openSendEmailLogsModal(order_id, 4, __('Shipping email sending logs.')) }}
                >Ship</Tag>
            </Space>
        );
    }

    /** 打开邮件发送日志弹窗 */
    const openSendEmailLogsModal = (order_id, type, title = "") => {
        setEmailSendLogsView(<EmailSendLog order_id={order_id} type={type} title={title} />);
        setEmailSendLogsModal(true);
    }

    /** 设置列表搜索参数 */
    const setSearch = (key, value) => {
        setSearchParam({
            ...searchParam,
            [key]: value
        });
    }

    /** 开启Excel导出弹窗 */
    const openExcelExportModal = () => {
        setExcelExportView(<ExcelExport status={orderStatus} search_param={searchParam} />);
        setExcelExportModal(true);
    }

    /** 开启Excel导入弹窗 */
    const openExcelImportModal = () => {
        setExcelImportView(<ExcelImport status={orderStatus} imported={excelImported} />);
        setExcelImportModal(true);
    }

    const excelImported = () => {
        setExcelImportModal(false);
        setExcelImportView(null);
        getOrders();
    }

    /** 更新实时订单数据 */
    const ordersUpdate = async () => {
        await OrderAction.ordersUpdate();

        setOrderUpdating({
            title: __('The order data shown in the update process may not be synchronized.'),
            btnText: __('Order updating.'),
            loading: true,
        });

        _updating = true;
    }

    /** 检测有没有正在执行的订单更新的后台进程 */
    const checkOrderProcess = async () => {
        const location = window.location.href;
        if (location.indexOf('/#/order') === -1) {
            /** 非订单页面关闭定时器 */
            clearInterval(timer);
            return false;
        }

        const res = await OrderAction.checkOrderProcess();
        if (res.code !== '') {
            /** 请求错误关闭定时器 */
            clearInterval(timer);
            return false;
        }

        if (res.result.state === 1) {
            setOrderUpdating({
                title: __('The order data shown in the update process may not be synchronized.'),
                btnText: __('Order updating.'),
                loading: true,
            });

            _updating = true;
        } else {
            setOrderUpdating({
                title: __('Click and update order, Last updated.') + res.result.update_time,
                btnText: __('Click and update.'),
                loading: false,
            });

            _updating && getOrders(1);

            _updating = false;
        }
    }

    /** 订单详细信息（+表单） */
    const orderView = (order) => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Order detail.'),
            width: 720
        });
        setDrawElement(<OrderView order_id={order.id} updated={orderUpdated} />);
    }

    /** 更新订单后关闭抽屉，重新获取订单数据 */
    const orderUpdated = () => {
        closeDraw();
        getOrders(currentPage);
    }

    /** 关闭抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
    }

    /** 打开订单状态更新窗口 */
    const orderUpdateConfirm = () => {
        setUpdateConfirmTitle(`${__('Order status update.')} <${orderStatusMap[orderStatus]}>`);
        setModalElement(<UpdateConfrim orderStatus={orderStatus} selectedRowKeys={selectedRowKeys} orderDataChange={orderDataChange} />);
        setModalOpen(true);
    }

    /** 子组件中修改邮件模板或订单物流信息后给父组件（当前 index.js）同步 */
    const orderDataChange = (shopEmail, orderInfo, shippingDate) => {
        setShopEmailTemplateMap(shopEmail);
        setOrderShippingInfo(orderInfo);
        setShippingDate(shippingDate);
    }

    /** 弹出附加采购商品弹窗 */
    const supplyMoreView = (orderItemId) => {
        setSupplyMoreElement(<OrderItemMore orderItemId={orderItemId} />);
        setSupplyMoreOpen(true);
    }

    /** 弹出快递查询弹窗 */
    // const deliveryView = (deliveryNumber) => {
    //     setDeliveryElement(<Delivery deliveryNumber={deliveryNumber} />);
    //     setDeliveryOpen(true);
    // }

    /** 弹出国际物流查询弹窗 */
    const shippingView = (orderItemId) => {
        setShippingElement(<Shipping orderItemId={orderItemId} />);
        setShippingOpen(true);
    }

    /** 订单状态更新 */
    const orderUpdate = async () => {
        setLoading('block');

        const res = await OrderAction.update({
            'order_ids': selectedRowKeys,
            'order_status': orderStatus,
            'shop_email': shopEmailTemplateMap,
            'order_shipping': orderShippingInfo,
            'shipping_date': shippingDate,
        });

        closeOrderUpdateConfirm();
        setLoading('none');

        /** 订单状态更新后重新获取当前页的订单数据 */
        res && getOrders();
    }

    /** 订单状态更改为保留与还原，reserve=1:保留，reserve=0:还原 */
    const orderReserve = (id, order_id, reserve) => {
        const confirmText = reserve === 1 ? __('Confirm to reserve order.') : __('Confirm to restore order.');

        confirm({
            icon: <ExclamationCircleOutlined />,
            title: `${__('Order ID.')}: ${order_id}`,
            content: confirmText,
            okText: __('Confirm.'),
            cancelText: __('Cancel.'),
            onOk: async () => {
                const res = await OrderAction.orderReserve(id, { reserve });
                /** 订单改为保留或还原后重新获取当前页的订单数据 */
                res && getOrders(currentPage);
            }
        });
    }

    /** 订单取消 */
    const orderCancel = (id, order_id) => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: `${__('Order ID.')}: ${order_id}`,
            content: __('Confirm to cancel order.'),
            okText: __('Confirm.'),
            cancelText: __('Cancel.'),
            onOk: async () => {
                const res = await OrderAction.orderCancel(id);
                /** 订单取消后重新获取当前页的订单数据 */
                res && getOrders(currentPage);
            }
        });
    }

    /** 关闭订单状态更新弹窗 */
    const closeOrderUpdateConfirm = () => {
        setModalOpen(false);
        setModalElement(null);
    }

    /** 更新订单商品的采购，快递，物流等信息 */
    const updateOrderItem = async (order_item_id, update_data) => {
        const res = await OrderAction.updateOrderItem(order_item_id, update_data);
        console.log(res);
    }

    /** 更新国际物流的默认设置 */
    const updateShippingData = async (order_item_id, order_id) => {
        setLoading('block');

        const res = await OrderAction.updateShippingData(order_item_id);

        if (res) {
            setDefaultShippingChecked(defaultShippingChecked.map(v => {
                if (v.order_id === order_id && v.order_item_id !== order_item_id) {
                    v.checked = false;
                }
                if (v.order_id === order_id && v.order_item_id === order_item_id) {
                    v.checked = true;
                }

                return v;
            }));
        }

        setLoading('none');
    }

    /** 订单商品全部隐藏或全部显示 */
    const orderShowHideToggel = () => {
        if (expendedKeys.length > 0) {
            setExpendedKeys([]);
            setShowOrderItemBtn(__('Show all.'));
        } else {
            setExpendedKeys(orders.map(v => v.key));
            setShowOrderItemBtn(__('Hide all.'));
        }
    }

    /** 订单商品选择物流商|仓库 */
    const setLogisticId = async (item_id, logistic_id) => {
        await updateOrderItem(item_id, { logistic_id });

        let logisticData = null;
        if (logistic_id > 0) {
            const _logisticData = logistics.filter(v => v.id === logistic_id);
            logisticData = _logisticData[0];
        }

        setOrderItemLogisticMap({
            ...orderItemLogisticMap,
            [item_id]: logisticData
        });
    }

    /** 渲染订单商品 */
    const expandedRowRender = (record, index, indent, expanded) => {
        const columns = [
            {
                title: __('Basic info.'),
                width: 200,
                dataIndex: 'basic',
                key: 'basic',
            },
            {
                title: __('Price and Number.'),
                width: 60,
                dataIndex: 'price',
                key: 'price',
            },
            {
                title: __('Item sourcing.'),
                width: 200,
                dataIndex: 'supply',
                key: 'supply',
            },
            {
                title: __('Logistic and Store.'),
                width: 200,
                dataIndex: 'logistic',
                key: 'logistic',
            },
            {
                title: __('International Shipping.'),
                width: 200,
                dataIndex: 'shipping',
                key: 'shipping',
            },
            {
                title: __('Other infos.'),
                width: 120,
                dataIndex: 'infos',
                key: 'infos',
            }
        ];

        const items = record['items'].map((v, k) => {
            const itemInfos = buildItemInfos(v.infos);

            /** 先从映射表中获取物流商品系 */
            let orderItemLogisticData = orderItemLogisticMap[v.id];
            if (!orderItemLogisticData) {
                /** 映射表中没有查询到，则物流商列表中根据 logistic_id 筛选 */
                const _orderItemLogistic = logistics.filter(_v => _v.id === v.logistic_id);
                orderItemLogisticData = _orderItemLogistic.length > 0 ? _orderItemLogistic[0] : null;
            }

            return {
                key: k.toString(),
                basic: (
                    <div className={styles['item-basic']}>
                        <img src={
                            v.item_image !== ''
                                ? v.item_image
                                : (v.supply_image !== ''
                                    ? v.supply_image
                                    : require('../../assets/img/gift.png')
                                )
                        } alt="" />
                        <div className={styles['basic-info']}>
                            <h3>{__('Item ID.')}: {v.item_id}</h3>
                            <Paragraph ellipsis={{ rows: 2 }} className="pointer" underline style={{ fontSize: 12, marginBottom: 4 }} title={v.item_name} onClick={() => { window.open(v.item_url) }}>{v.item_name}</Paragraph>
                            <p>{buildItemOption(v.options)}</p>
                        </div>
                        {v.order_item_mores && v.order_item_mores.length > 0 &&
                            <Button
                                type="primary"
                                shape="circle"
                                size="small"
                                style={{ background: '#fa541c', position: 'absolute', right: -6, top: -10, fontSize: 11 }}
                                onClick={() => { supplyMoreView(v.id) }}
                            >+{v.order_item_mores.length}</Button>
                        }
                    </div>
                ),
                price: (
                    <div className={styles['item-infos']}>
                        <div className={styles['item-row']}>
                            <b>{__('Per price.')}</b>
                            <strong>{addComma(v.item_price)}</strong>
                        </div>
                        <div className={styles['item-row']}>
                            <b>{__('Number.')}</b>
                            <strong>{addComma(v.quantity)}</strong>
                        </div>
                        <div className={styles['item-row']}>
                            <b>{__('Delivered.')}</b>
                            <strong>{v.supply_quantity === 0 ? '-' : addComma(v.supply_quantity)}</strong>
                        </div>
                    </div>
                ),
                supply: (
                    v.supply_market === 'store'
                        ? <div className={styles['item-infos']}>
                            <div className={styles['item-row']}>
                                <b>{__('Platform.')}</b>
                                <strong>{__('Stored item.')}</strong>
                            </div>
                            <div className={styles['item-row']}>
                                <b>{__('KSNCODE.')}</b>
                                <strong>{v.supply_code}</strong>
                            </div>
                            <div className={styles['item-row']}>
                                <b>{__('Supply opt.')}</b>
                                <strong>{v.supply_opt}</strong>
                            </div>
                        </div>

                        : <div className={styles['item-infos']}>
                            <div className={styles['item-row']}>
                                <b>{__('Platform.')}</b>
                                <Select
                                    size="small"
                                    placeholder={__('Please select market.')}
                                    defaultValue={v.supply_market}
                                    style={{ minWidth: 100 }}
                                    onChange={e => updateOrderItem(v.id, { supply_market: e })}
                                    options={supplyMarkets.map(mk => (
                                        {
                                            value: mk.code,
                                            label: mk.name
                                        }
                                    ))}
                                    disabled={v.auto_complete === 1}
                                />
                                <LinkOutlined
                                    style={{ marginLeft: 6, cursor: 'pointer', fontSize: 14, color: '#1677ff' }}
                                    onClick={() => { window.open(v.supply_url) }}
                                />
                            </div>
                            <div className={styles['item-row']}>
                                <b>{__('Order ID.')}</b>
                                <Input
                                    placeholder={__('Order ID.')}
                                    defaultValue={v.supply_order_id}
                                    size="small"
                                    onBlur={e => updateOrderItem(v.id, { supply_order_id: e.target.value })}
                                    disabled={v.auto_complete === 1}
                                />
                            </div>
                            <div className={styles['item-row']}>
                                <b>{__('Invoice number.')}</b>
                                <Input
                                    placeholder={__('Please input invoice number.')}
                                    defaultValue={v.supply_delivery_number}
                                    style={{ minWidth: 100 }}
                                    size="small"
                                    onBlur={e => updateOrderItem(v.id, { supply_delivery_number: e.target.value })}
                                    disabled={v.auto_complete === 1}
                                />
                                <EyeOutlined
                                    style={{ marginLeft: 6, cursor: 'pointer', fontSize: 14, color: '#1677ff' }}
                                    onClick={() => { console.log(v.supply_delivery_number) }}
                                />
                            </div>
                            <div className={styles['item-row']}>
                                <b>{__('Supply price.')}</b>
                                <InputNumber
                                    placeholder={__('Please input supply price.')}
                                    defaultValue={v.supply_price}
                                    size="small"
                                    min={0}
                                    onBlur={e => updateOrderItem(v.id, { supply_price: e.target.value })}
                                    disabled={v.auto_complete === 1}
                                />
                            </div>
                        </div>
                ),
                logistic: (
                    <div className={styles['item-infos']}>
                        <div className={styles['item-row']}>
                            <b>{__('Logistic.')}</b>
                            <Select
                                size="small"
                                placeholder={__('Please select market.')}
                                defaultValue={v.logistic_id}
                                style={{ minWidth: 120 }}
                                onChange={e => setLogisticId(v.id, e)}
                                options={[{ value: 0, label: __('Please select.') }, ...logistics.map(logi => (
                                    {
                                        value: logi.id,
                                        label: logi.nickname
                                    }
                                ))]}
                            />
                        </div>
                        <div className={styles['item-row']}>
                            <b>{__('Name abbr.')}</b>
                            <strong>{orderItemLogisticData ? orderItemLogisticData.nickname : '-'}</strong>
                        </div>
                        <div className={styles['item-row']}>
                            <b>{__('Full name.')}</b>
                            <strong>{orderItemLogisticData ? orderItemLogisticData.manager : '-'}</strong>
                        </div>
                        <div className={styles['item-row']}>
                            <b>{__('Shipping option.')}</b>
                            <Select
                                size="small"
                                placeholder={__('Shipping option.')}
                                defaultValue={shippingOption[v.shipping_option]}
                                style={{ minWidth: 120 }}
                                onChange={e => updateOrderItem(v.id, { shipping_option: e })}
                                options={Object.keys(shippingOption).map(val => (
                                    {
                                        value: val,
                                        label: shippingOption[val]
                                    }
                                ))}
                            />
                            <Tooltip
                                placement="top"
                                color="white"
                                trigger="click"
                                title={<TextArea
                                    style={{fontSize: '12px', resize: 'none', scrollbarWidth: 'none', width: '160px'}}
                                    rows={5}
                                    onBlur={e => updateOrderItem(v.id, { remark: e.target.value })}
                                    defaultValue={v.remark}
                                    placeholder={__('Please input logistic memo.')}
                                />}
                            >
                                <span
                                    style={{marginLeft: '8px', color: '#0958d9', textDecoration: 'underline', cursor: 'pointer'}}
                                >{__('Memo.')}</span>
                            </Tooltip>
                        </div>
                    </div>
                ),
                shipping: (
                    <div className={styles['item-infos']}>
                        <div className={styles['item-row']}>
                            <b>{__('Logistic Company.')}</b>
                            <Select
                                size="small"
                                placeholder={__('International Logistic company.')}
                                defaultValue={v.shipping_company}
                                style={{ minWidth: 100 }}
                                onChange={e => updateOrderItem(v.id, { shipping_company: e })}
                                options={shippingCompany.map(v => (
                                    {
                                        value: v.name,
                                        label: v.name
                                    }
                                ))}
                                disabled={v.auto_complete === 1}
                            />
                        </div>
                        <div className={styles['item-row']}>
                            <b>{__('Invoice number.')}</b>
                            <Input
                                placeholder={__('International Invoice number.')}
                                defaultValue={v.invoice_number}
                                size="small"
                                style={{ minWidth: 100 }}
                                onBlur={e => updateOrderItem(v.id, { invoice_number: e.target.value })}
                                disabled={v.auto_complete === 1}
                            />
                            <EyeOutlined
                                style={{ marginLeft: 6, cursor: 'pointer', fontSize: 14, color: '#1677ff' }}
                                onClick={() => { shippingView(v.id) }}
                            />
                        </div>
                        <div className={styles['item-row']}>
                            <b></b>
                            <Checkbox
                                checked={defaultShippingChecked.find(v1 => v1.order_item_id === v.id && v1.checked) !== undefined} onChange={() => { updateShippingData(v.id, v.order_id) }}
                                disabled={v.auto_complete === 1}
                            >{__('Set default.')}</Checkbox>
                        </div>
                    </div>
                ),
                infos: (
                    <div className={styles['item-infos']}>
                        {itemInfos.length > 0
                            ? itemInfos.map((v, k) => (
                                <div key={k} className={styles['item-row']}>
                                    <b>{v['name']}</b>
                                    <Tooltip placement="topLeft" title={v['value']}>
                                        {getByteSize(v['value']) > 16 ? v['value'].substring(0, 8) + '...' : v['value']}
                                    </Tooltip>
                                </div>
                            ))
                            : (
                                <div className={styles['item-row']}>
                                    <b></b>
                                    <strong>{__('No other info.')}</strong>
                                </div>
                            )
                        }
                    </div>
                ),
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
                <Table bordered size="small" columns={columns} dataSource={items} pagination={false} scroll={{ x: 800 }} rowClassName={record => 'order-item-row'} />
            </ConfigProvider>
        );
    };

    /** 表格项目 */
    const columns = [
        {
            title: 'No.',
            width: 30,
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: __('Shop type.'),
            width: 60,
            dataIndex: 'market',
            key: 'market',
        },
        {
            title: __('Shop ID.'),
            width: 80,
            dataIndex: 'sh_shop_id',
            key: 'sh_shop_id',
        },
        {
            title: __('Order ID.'),
            width: 125,
            dataIndex: 'order_id',
            key: 'order_id',
        },
        {
            title: __('Order status.'),
            width: 80,
            dataIndex: 'order_status',
            key: 'order_status',
        },
        {
            title: __('Actual Order price.'),
            width: 60,
            dataIndex: 'total_price',
            key: 'total_price',
        },
        {
            title: __('Order time.'),
            width: 90,
            dataIndex: 'order_time',
            key: 'order_time',
        },
        {
            title: __('Memo.'),
            width: 115,
            dataIndex: 'remark',
            key: 'remark',
            ellipsis: {
                showTitle: false,
            },
            render: (remark) => (
                <Tooltip placement="topLeft" title={remark}>
                    {remark}
                </Tooltip>
            ),
        },
        {
            title: __('Email sending status.'),
            width: 100,
            dataIndex: 'email_sended',
            key: 'email_sended',
        },
        {
            title: __('Operation.'),
            width: 90,
            key: 'operation',
            fixed: 'right',
            render: (text, record, index) => (
                <Space size={2} className="list-opt">
                    <Tag color="processing" className="pointer" onClick={() => { orderView(record) }}>{__('Detail.')}</Tag>
                    {record.data.order_status < 7 && record.data.is_reserved === 0 && record.data.auto_complete === 0 && //订单完成之前都可以进行取消或保留操作
                        <>
                            <Tag color="error" className="pointer" onClick={() => { orderCancel(record.data.id, record.data.order_id) }}>{__('Cancel.')}</Tag>
                            <Tag color="warning" className="pointer" onClick={() => { orderReserve(record.data.id, record.data.order_id, 1) }}>{__('Reserved.')}</Tag>
                        </>
                    }
                    {record.data.is_reserved === 1 &&
                        <Tag color="warning" className="pointer" onClick={() => { orderReserve(record.data.id, record.data.order_id, 0) }}>{__('Restore.')}</Tag>
                    }
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
                            <em>{__('Shop type.')}:</em>
                            <Select
                                value={searchParam['market']}
                                onChange={(e) => { setSearch('market', e) }}
                                options={markets.map(v => ({ value: v.key, label: v.name + ' / ' + v.key }))}
                                className="select"
                                style={{ width: 160 }}
                            />
                        </div>
                        <div className="search-elem">
                            <em>{__('Shop ID.')}:</em>
                            <Input placeholder={__('Please input Shop ID.')} className="input" value={searchParam['sh_shop_id']} style={{ width: 160 }} onChange={(e) => { setSearch('sh_shop_id', e.target.value) }} />
                        </div>
                        <div className="search-elem">
                            <em>{__('Shop name.')}:</em>
                            <Input placeholder={__('Please input Shop name.')} className="input" value={searchParam['shop_name']} style={{ width: 160 }} onChange={(e) => { setSearch('shop_name', e.target.value) }} />
                        </div>
                        <div className="search-elem">
                            <em>{__('Search.')}:</em>
                            <Input placeholder={`${__('Order ID.')} | ${__('Receiver name.')} | ${__('Phone.')}`} className="input" value={searchParam['keyword']} style={{ width: 240 }} onChange={(e) => { setSearch('keyword', e.target.value) }} />
                        </div>
                        <div className="search-elem">
                            <em>{__('International Shipping.')}:</em>
                            <Select
                                value={searchParam['shipment']}
                                onChange={(e) => { setSearch('shipment', e) }}
                                options={[
                                    { value: '1', label: __('Inputted.') },
                                    { value: '0', label: __('Not Inputted.') },
                                ]}
                                className="select"
                                style={{ width: 160 }}
                            />
                        </div>
                    </div>
                    <div className="search-group">
                        <div className="search-elem">
                            <Radio.Group value={searchParam['order_status'] ? searchParam['order_status'] : ""} onChange={(e) => { setSearch('order_status', e.target.value); setCurrentPage(1); }}>
                                {/* <Radio.Button value="">
                                    <Badge count={orderCount.total} overflowCount={9999} offset={[5, -10]}>全部订单</Badge>
                                </Radio.Button> */}
                                {Object.keys(orderStatusMap).map((status, index) => {
                                    return (
                                        <Radio.Button value={status} key={index}>
                                            <Badge count={orderCount[status]} overflowCount={9999} offset={[5, -10]}>{orderStatusMap[status]}</Badge>
                                        </Radio.Button>
                                    );
                                })}
                            </Radio.Group>
                        </div>
                    </div>
                    <div className="content-btn-group">
                        <Space>
                            <Button type="primary" onClick={() => { setCurrentPage(1); getOrders(1); }}>{__('Search.')}</Button>
                            <Button type="primary" onClick={() => { setSearchParam({}) }}>{__('Reset.')}</Button>
                            <Button type="primary" style={{ background: '#faad14' }} onClick={orderShowHideToggel}>{showOrderItemBtn}</Button>
                            {updatableOrderStatus.includes(orderStatus) &&
                                <Button type="primary" style={{ background: orderStatus === '4' ? '#434343' : '#08979c' }} onClick={orderUpdateConfirm} loading={false}>{orderStatus === '4' ? __('Force update') : __('Update status.')}</Button>
                            }
                        </Space>
                        <Space>
                            {excelExportableOrderStatus.includes(orderStatus) &&
                                <Button type="primary" style={{ background: '#52c41a' }} onClick={openExcelExportModal}>{__('Excel Export.')}</Button>
                            }
                            {excelImportableOrderStatus.includes(orderStatus) &&
                                <Button type="primary" style={{ background: '#52c41a' }} onClick={openExcelImportModal}>{__('Import Excel.')}</Button>
                            }
                            <Tooltip placement="left" title={orderUpdating.title}>
                                <Button type="primary" style={{ background: '#faad14' }} onClick={ordersUpdate} loading={orderUpdating.loading}>{orderUpdating.btnText}</Button>
                            </Tooltip>
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
                            dataSource={orders}
                            rowSelection={rowSelection}
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
                                total: orderCount.all,
                                defaultPageSize: pageSize,
                                current: currentPage,
                                showSizeChanger: true,
                                onChange: (page) => {
                                    setCurrentPage(page);
                                    getOrders(page);
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

            {/* 订单状态更新弹窗 */}
            <Modal
                open={modalOpen}
                width={960}
                title={updateConfirmTitle}
                okText={__('Confirm to update.')}
                cancelText={__('Cancel.')}
                onOk={orderUpdate}
                onCancel={closeOrderUpdateConfirm}
                forceRender
            >
                {modalElement}
            </Modal>

            {/* 邮件发送日志弹窗 */}
            <Modal
                open={emailSendLogsModal}
                width={1200}
                onCancel={() => { setEmailSendLogsModal(false); setEmailSendLogsView(null) }}
                closeIcon={null}
                footer={[]}
                forceRender
            >
                {emailSendLogsView}
            </Modal>

            {/* Excel导出弹窗 */}
            <Modal
                open={excelExportModal}
                width={600}
                onCancel={() => { setExcelExportModal(false); setExcelExportView(null) }}
                closeIcon={null}
                footer={[]}
                forceRender
            >
                {excelExportView}
            </Modal>

            {/* Excel导入弹窗 */}
            <Modal
                open={excelImportModal}
                width={1200}
                onCancel={() => { setExcelImportModal(false); setExcelImportView(null) }}
                closeIcon={null}
                footer={[]}
                forceRender
            >
                {excelImportView}
            </Modal>

            <Modal
                open={supplyMoreOpen}
                width={960}
                title={__('Additional supply item.')}
                onCancel={() => { setSupplyMoreOpen(false); setSupplyMoreElement(null) }}
                footer={[]}
                forceRender
            >
                {supplyMoreElement}
            </Modal>

            <Modal
                open={deliveryOpen}
                width={720}
                title={__('Express tracking.')}
                onCancel={() => { setDeliveryOpen(false); setDeliveryElement(null) }}
                footer={[]}
                forceRender
            >
                {deliveryElement}
            </Modal>

            <Modal
                open={shippingOpen}
                width={720}
                title={__('International Express tracking.')}
                onCancel={() => { setShippingOpen(false); setShippingElement(null) }}
                footer={[]}
                forceRender
            >
                {shippingElement}
            </Modal>

            <Loading loading={loading} />
        </div>
    );
}

export default Order;