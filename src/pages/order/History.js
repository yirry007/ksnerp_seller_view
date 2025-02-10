import { Input, Button, Select, Table, Space, Tooltip, ConfigProvider, Drawer, DatePicker, Tag, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Title from '../../components/Title';
import { OrderAction } from '../../actions/OrderAction';
import { useEffect, useState } from 'react';
import Loading from '../../components/loading';
import { marketIcons, markets, orderStatusMap } from '../../Constants';
import { __, addComma, buildItemInfos, buildItemOption } from '../../utils/functions';
import HistoryView from './HistoryView';
import dayjs from 'dayjs';
import styles from './order.module.scss';

function History(props) {
    const [orders, setOrders] = useState([]);//订单列表数据
    const [orderCount, setOrderCount] = useState(0);//订单总数
    const [expendedKeys, setExpendedKeys] = useState([]);//展开订单商品数据
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [searchParam, setSearchParam] = useState({});//列表搜索参数
    const [loading, setLoading] = useState('block');//加载转圈圈

    const { RangePicker } = DatePicker;
    const { Paragraph } = Typography;

    useEffect(() => {
        getOrders();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取订单数据和订单总数 */
    const getOrders = async (page = 1) => {
        setLoading('block');

        const res = await OrderAction.histories(searchParam, page);

        if (res.code === '') {
            const _expendedKeys = [];

            setOrders(res.result.orders.map((v, k) => {
                _expendedKeys.push(v.order_id);

                return {
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
                }
            }));

            setOrderCount(res.result.count);
            setExpendedKeys(_expendedKeys);//订单商品数据展开（全部展开）
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
                >Thanks</Tag>
                <Tag
                    icon={shippedMailSended ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    color={shippedMailSended ? 'success' : 'error'}
                    className="pointer"
                >Ship</Tag>
            </Space>
        );
    }

    /** 设置列表搜索参数 */
    const setSearch = (key, value) => {
        setSearchParam({
            ...searchParam,
            [key]: value
        });
    }
    /** 设置搜索日期 */
    const setSearchDate = (e) => {
        if (!e) return false;

        const start_date = e[0].format('YYYY-MM-DD');
        const end_date = e[1].format('YYYY-MM-DD');

        setSearchParam({
            ...searchParam,
            start_date: start_date,
            end_date: end_date
        });
    }

    /** 设置日期搜索框的日期值 */
    const defaultSearchDate = (date) => {
        if (!date) return null;

        return dayjs(date, 'YYYY-MM-DD')
    }

    /** 订单详细信息（+表单） */
    const historyView = (order) => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Order Info.'),
            width: 720
        });
        setDrawElement(<HistoryView order_id={order.id} />);
    }

    /** 关闭抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
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
                                <a href={v.supply_url} target='_blank' rel="noreferrer" className="pointer" title={v.supply_url} style={{ maxWidth: 120, wordBreak: 'break-all', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.supply_market === '' ? 'no data' : v.supply_market}</a>
                            </div>
                            <div className={styles['item-row']}>
                                <b>{__('Order ID.')}</b>
                                <strong>{v.supply_order_id === '' ? 'no data' : v.supply_order_id}</strong>
                            </div>
                            <div className={styles['item-row']}>
                                <b>{__('Invoice number.')}</b>
                                <strong>{v.supply_delivery_number === '' ? 'no data' : v.supply_delivery_number}</strong>
                            </div>
                            <div className={styles['item-row']}>
                                <b>{__('Supply price.')}</b>
                                <strong>{v.supply_price === '' ? 'no data' : v.supply_price}</strong>
                            </div>
                        </div>
                ),
                logistic: (
                    <div className={styles['item-infos']}>
                        <div className={styles['item-row']}>
                            <b>{__('Name abbr.')}</b>
                            <strong>{v.nickname ? v.nickname : 'no data'}</strong>
                        </div>
                        <div className={styles['item-row']}>
                            <b>{__('Full name.')}</b>
                            <strong>{v.company ? v.company : 'no data'}</strong>
                        </div>
                        <div className={styles['item-row']}>
                            <b>{__('Manager.')}</b>
                            <strong>{v.manager ? v.manager : 'no data'}</strong>
                        </div>
                    </div>
                ),
                shipping: (
                    <div className={styles['item-infos']}>
                        <div className={styles['item-row']}>
                            <b>{__('Logistic Company.')}</b>
                            <strong>{v.shipping_company === '' ? 'no data' : v.shipping_company}</strong>
                        </div>
                        <div className={styles['item-row']}>
                            <b>{__('Invoice number.')}</b>
                            <strong>{v.invoice_number === '' ? 'no data' : v.invoice_number}</strong>
                        </div>
                        <div className={styles['item-row']}>
                            <b></b>
                            <strong>{v.shipping_default === 1 ? __('Set as default.') : '-'}</strong>
                        </div>
                    </div>
                ),
                infos: (
                    <div className={styles['item-infos']}>
                        {itemInfos.length > 0
                            ? itemInfos.map((v, k) => (
                                <div className={styles['item-row']}>
                                    <b>{v['name']}</b>
                                    <strong>{v['value']}</strong>
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
            width: 120,
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
            width: 70,
            dataIndex: 'total_price',
            key: 'total_price',
        },
        {
            title: __('Order time.'),
            width: 100,
            dataIndex: 'order_time',
            key: 'order_time',
        },
        {
            title: __('Memo.'),
            width: 120,
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
            width: 50,
            key: 'operation',
            fixed: 'right',
            render: (text, record, index) => (
                <Space size={2} className="list-opt">
                    <Tag color="processing" className="pointer" onClick={() => { historyView(record) }}>{__('Detail.')}</Tag>
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
                            />
                        </div>
                        <div className="search-elem">
                            <em>{__('Shop ID.')}:</em>
                            <Input placeholder={__('Please input Shop ID.')} className="input" value={searchParam['sh_shop_id']} onChange={(e) => { setSearch('sh_shop_id', e.target.value) }} />
                        </div>
                        <div className="search-elem">
                            <em>{__('Order ID.')}:</em>
                            <Input placeholder={__('Please input Order ID.')} className="input" value={searchParam['order_id']} onChange={(e) => { setSearch('order_id', e.target.value) }} />
                        </div>
                        <div className="search-elem">
                            <em>{__('Order status.')}:</em>
                            <Select
                                value={searchParam['order_status']}
                                onChange={(e) => { setSearch('order_status', e) }}
                                options={Object.keys(orderStatusMap).map(key => ({ value: key, label: orderStatusMap[key] }))}
                                className="select"
                            />
                        </div>
                        <div className="search-elem">
                            <em>{__('Order time.')}:</em>
                            <RangePicker value={[defaultSearchDate(searchParam['start_date']), defaultSearchDate(searchParam['end_date'])]} onChange={setSearchDate} />
                        </div>
                    </div>
                    <div className="content-btn-group">
                        <Space>
                            <Button type="primary" onClick={() => { getOrders(1) }}>{__('Search.')}</Button>
                            <Button type="primary" onClick={() => { setSearchParam({}) }}>{__('Reset.')}</Button>
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
                                total: orderCount,
                                showSizeChanger: false,
                                onChange: (page) => {
                                    getOrders(page);
                                }
                            }}
                            scroll={{ x: 1500, y: 480 }}
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

            <Loading loading={loading} />
        </div>
    );
}

export default History;