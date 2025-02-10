import { Button, Checkbox, ConfigProvider, Image, Spin, Table, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './item.module.scss';
import { SupplierAction } from '../../actions/SupplierAction';
import { __, transformItemOption } from '../../utils/functions';

function OrderCreate(props) {
    const [address, setAddress] = useState([]);//收货地址列表
    const [selectedAddress, setSelectedAddress] = useState({});//已选择的收货地址
    const [orderItems, setOrderItems] = useState([]);//待生成订单商品
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);//列表中勾选的商品
    const [expendedKeys, setExpendedKeys] = useState([]);//展开附加采购商品
    const [rowDatas, setRowDatas] = useState({});//商品列表信息，用于最终创建订单
    const [loading, setLoading] = useState(false);//加载转圈圈
    const [creating, setCreating] = useState(false);//正在创建订单

    const { Paragraph } = Typography;

    /** 列表勾选 */
    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const rowSelection = {
        columnWidth: 30,
        selectedRowKeys,
        onChange: onSelectChange
    };

    useEffect(() => {
        getAddress();
        getOrderItems();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取地址列表 */
    const getAddress = async () => {
        setLoading(true);

        const res = await SupplierAction.getAddress(props.market);
        if (res) {
            const _address = res.result;
            setAddress(_address);

            for (let i = 0; i < _address.length; i++) {
                if (_address[i].isDefault) {
                    setSelectedAddress(_address[i]);
                    break;
                }
            }
        }

        setLoading(false);
    }

    /** 获取待生成订单商品列表 */
    const getOrderItems = async () => {
        setLoading(true);

        const res = await SupplierAction.orderItems(props.market);

        if (res.code === '') {
            setOrderItems(res.result);

            /** 根据库存数量，重新勾选商品列表 */
            const _rowSelected = [];
            const _rowData = {};
            const _expendedKeys = [];
            res.result.forEach(v => {
                /** 勾选列表 */
                _rowSelected.push(v.ksn_code);

                /** 附加采购商品展开设置 */
                if (v.order_item_mores.length > 0)
                    _expendedKeys.push(v.ksn_code);

                /** 初始化最终提交的商品及数量 */
                _rowData[v.ksn_code] = {
                    order_item_ids: v.order_item_ids,
                    supply_code: v.supply_code,
                    supply_opt: v.supply_opt,
                    supply_market: v.supply_market,
                    supply_image: v.supply_image,
                    supply_name: v.supply_name,
                    supply_price: v.supply_price,
                    supply_options: v.supply_options,
                    supply_quantity: v.quantity,
                    total_quantity: v.total_quantity,
                    supply_unit: v.supply_unit,
                    min_quantity: v.min_quantity,
                }
            });

            setSelectedRowKeys(_rowSelected);
            setRowDatas(_rowData);
            setExpendedKeys(_expendedKeys);
        }

        setLoading(false);
    }

    /** 采购平台中自动生成订单 */
    const createOrders = async () => {
        if (!selectedAddress.addressId) {
            message.error(__('Please select address, If there is no address, Get to the 1688 admin and add address.'));
            return false;
        }

        if (selectedRowKeys.length === 0) {
            message.error(__('Please select the supply items.'));
            return false;
        }

        const _rowDatas = {};//已被勾选的商品
        selectedRowKeys.forEach(v => {
            _rowDatas[v] = rowDatas[v];
        });

        setCreating(true);

        const res = await SupplierAction.createOrders({market: props.market, address: selectedAddress, items: _rowDatas});

        if (res) {
            props.finished(res.result);
        }

        setCreating(false);        
    }

    /** 附加采购商品列表 */
    const expandedRowRender = (record, index, indent, expanded) => {
        const columns = [
            {
                title: __('Supply image.'),
                width: 80,
                dataIndex: 'supply_image',
                key: 'supply_image',
                className: 'align-middle align-center',
                render: (text, record, index) => (
                    record.supply_image && record.supply_image !== ''
                        ? <Image src={record.supply_image} width={50} />
                        : <Image src={require('../../assets/img/gift.png')} width={50} />
                ),
            },
            {
                title: __('Supply name.'),
                width: 160,
                dataIndex: 'supply_name',
                key: 'supply_name',
                className: 'align-middle',
                render: (text, record, index) => (
                    <div style={{ fontSize: '12px' }}>{record.supply_name}</div>
                )
            },
            {
                title: __('Supply price.'),
                width: 80,
                dataIndex: 'supply_price',
                key: 'supply_price',
                className: 'align-middle',
            },
            {
                title: __('Supply unit.'),
                width: 80,
                dataIndex: 'supply_unit',
                key: 'supply_unit',
                className: 'align-middle',
            },
            {
                title: __('Supply options.'),
                width: 120,
                dataIndex: 'supply_options',
                key: 'supply_options',
                className: 'align-middle',
                render: (text, record, index) => (
                    <Paragraph ellipsis={{ rows: 3 }} title={transformItemOption(record.supply_options)}>
                        <div dangerouslySetInnerHTML={{ __html: transformItemOption(record.supply_options, 'html') }} />
                    </Paragraph>
                )
            },
        ];

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
                <Table
                    bordered
                    size="small"
                    columns={columns}
                    dataSource={record['order_item_mores']}
                    pagination={false}
                    style={{margin: '10px 0 10px 50px'}}
                    rowKey={r => r.id}
                    rowClassName={record => 'order-item-row'}
                />
            </ConfigProvider>
        );
    };

    /** 表格项目 */
    const columns = [
        {
            title: __('Supply image.'),
            width: 80,
            dataIndex: 'supply_image',
            key: 'supply_image',
            className: 'align-middle align-center',
            render: (text, record, index) => (
                record.supply_image && record.supply_image !== ''
                    ? <Image src={record.supply_image} width={50} />
                    : <Image src={require('../../assets/img/gift.png')} width={50} />
            ),
        },
        {
            title: __('Supply name.'),
            width: 160,
            dataIndex: 'supply_name',
            key: 'supply_name',
            className: 'align-middle',
            render: (text, record, index) => (
                <div style={{ fontSize: '12px' }}>{record.supply_name}</div>
            )
        },
        {
            title: __('Supply price.'),
            width: 80,
            dataIndex: 'supply_price',
            key: 'supply_price',
            className: 'align-middle',
        },
        {
            title: __('Order Number.'),
            width: 80,
            dataIndex: 'total_quantity',
            key: 'total_quantity',
            className: 'align-middle',
        },
        {
            title: __('Supply unit.'),
            width: 80,
            dataIndex: 'supply_unit',
            key: 'supply_unit',
            className: 'align-middle',
        },
        {
            title: __('Supply options.'),
            width: 120,
            dataIndex: 'supply_options',
            key: 'supply_options',
            className: 'align-middle',
            render: (text, record, index) => (
                <Paragraph ellipsis={{ rows: 3 }} title={transformItemOption(record.supply_options)}>
                    <div dangerouslySetInnerHTML={{ __html: transformItemOption(record.supply_options, 'html') }} />
                </Paragraph>
            )
        },
        {
            title: __('Sourcing item number.'),
            width: 70,
            dataIndex: 'total_quantity',
            key: 'total_quantity',
            className: 'align-middle',
            render: (text, record, index) => (
                <Tooltip placement='top' title={`${__('Actually Sourcing.')} = ${__('Sourcing item number.')} x ${__('Supply unit.')}`}>
                    <strong
                        style={{fontWeight: 'bold', color: '#ff0000', textDecoration: 'underline', cursor: 'pointer'}}
                    >{record.total_quantity * record.supply_unit}</strong>
                </Tooltip>
            )
        }
    ];

    return (
        <Spin spinning={loading}>
            <div className={styles['order-create']}>
                <ul className={styles['address-select']}>
                    {address.map(v => (
                        <li key={v.addressId}>
                            <Checkbox
                                value={v.addressCode}
                                checked={v.addressId === selectedAddress.addressId}
                                onChange={() => { setSelectedAddress(v) }}
                            />
                            <section>
                                <h3>{v.receiver} {v.mobile}</h3>
                                <p>{v.address} {v.postCode}</p>
                            </section>
                        </li>
                    ))}
                </ul>
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
                            dataSource={orderItems}
                            rowKey={record => record.ksn_code}
                            rowSelection={rowSelection}
                            expandable={{
                                expandedRowRender,
                                columnWidth: 20,
                                expandedRowKeys: expendedKeys,
                                onExpand: (event, record) => {
                                    if (event) {
                                        setExpendedKeys([...expendedKeys, record.ksn_code]);
                                    } else {
                                        setExpendedKeys(expendedKeys.filter(v => v !== record.ksn_code));
                                    }
                                }
                            }}
                            pagination={false}
                        />
                    </ConfigProvider>
                </div>
                <div className={styles['create-order']}>
                    <Button type="primary" onClick={createOrders} loading={creating}>{__('Confirm to create order.')}</Button>
                </div>
            </div>
        </Spin>
    );
}

export default OrderCreate;