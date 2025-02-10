import { Button, ConfigProvider, Image, Spin, Table, Tooltip, Typography } from 'antd';
import styles from './item.module.scss';
import { __, transformItemOption } from '../../utils/functions';
import { useEffect, useState } from 'react';

function OrderCreateFinished(props) {
    const [expendedKeys, setExpendedKeys] = useState([]);//展开附加采购商品
    const [loading] = useState(false);//加载转圈圈

    useEffect(() => {
        setExpendedKeys(props.result.map(v => (
            v.result.order_item_mores && v.result.order_item_mores.length > 0 ? v.result.supply_opt : null
        )));
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const { Paragraph } = Typography;

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
                    record.result.supply_image && record.result.supply_image !== ''
                        ? <Image src={record.result.supply_image} width={50} />
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
                    <div style={{ fontSize: '12px' }}>{record.result.supply_name}</div>
                )
            },
            {
                title: __('Supply price.'),
                width: 80,
                dataIndex: 'supply_price',
                key: 'supply_price',
                className: 'align-middle',
                render: (text, record, index) => record.result.supply_price
            },
            {
                title: __('Supply unit.'),
                width: 80,
                dataIndex: 'supply_unit',
                key: 'supply_unit',
                className: 'align-middle',
                render: (text, record, index) => record.result.supply_unit
            },
            {
                title: __('Supply options.'),
                width: 120,
                dataIndex: 'supply_options',
                key: 'supply_options',
                className: 'align-middle',
                render: (text, record, index) => (
                    <Paragraph ellipsis={{ rows: 3 }} title={transformItemOption(record.result.supply_options)}>
                        <div dangerouslySetInnerHTML={{ __html: transformItemOption(record.result.supply_options, 'html') }} />
                    </Paragraph>
                )
            },
            {
                title: __('Sourced result.'),
                width: 70,
                dataIndex: 'create_result',
                key: 'create_result',
                className: 'align-middle',
                render: (text, record, index) => (
                    record.code === ''
                        ? <div>{__('Sourced successfully.')}</div>
                        : <Tooltip placement="top" title={record.message}>{__('Sourced failed.')}</Tooltip>
                )
            }
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
                    dataSource={record['result']['order_item_mores']}
                    pagination={false}
                    style={{ margin: '10px 0 10px 30px' }}
                    rowKey={r => r.result.supply_opt}
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
                record.result.supply_image && record.result.supply_image !== ''
                    ? <Image src={record.result.supply_image} width={50} />
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
                <div style={{ fontSize: '12px' }}>{record.result.supply_name}</div>
            )
        },
        {
            title: __('Supply price.'),
            width: 80,
            dataIndex: 'supply_price',
            key: 'supply_price',
            className: 'align-middle',
            render: (text, record, index) => record.result.supply_price
        },
        {
            title: __('Supply unit.'),
            width: 80,
            dataIndex: 'supply_unit',
            key: 'supply_unit',
            className: 'align-middle',
            render: (text, record, index) => record.result.supply_unit
        },
        {
            title: __('Supply options.'),
            width: 120,
            dataIndex: 'supply_options',
            key: 'supply_options',
            className: 'align-middle',
            render: (text, record, index) => (
                <Paragraph ellipsis={{ rows: 3 }} title={transformItemOption(record.result.supply_options)}>
                    <div dangerouslySetInnerHTML={{ __html: transformItemOption(record.result.supply_options, 'html') }} />
                </Paragraph>
            )
        },
        {
            title: __('Sourcing item number.'),
            width: 70,
            dataIndex: 'supply_quantity',
            key: 'supply_quantity',
            className: 'align-middle',
            render: (text, record, index) => record.result.total_quantity
        },
        {
            title: __('Sourced result.'),
            width: 70,
            dataIndex: 'create_result',
            key: 'create_result',
            className: 'align-middle',
            render: (text, record, index) => (
                record.code === ''
                    ? <div>{__('Sourced successfully.')}</div>
                    : <Tooltip placement="top" title={record.message}>{__('Sourced failed.')}</Tooltip>
            )
        }
    ];

    return (
        <Spin spinning={loading}>
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                <a
                    href="https://trade.1688.com/order/buyer_order_list.htm?trade_status=waitbuyerpay"
                    rel="noreferrer"
                    target="_blank"
                    style={{ textDecoration: 'underline', fontSize: '12px' }}
                >{__('See ksnshop orders.')}</a>
                <a
                    href="https://trade.1688.com/order/buyer_order_list.htm?trade_status=waitbuyerpay"
                    rel="noreferrer"
                    target="_blank"
                    style={{ textDecoration: 'underline', fontSize: '12px', marginLeft: '10px' }}
                >{__('See 1688 orders.')}</a>
            </div>

            <div className={styles['order-create']}>
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
                            dataSource={props.result}
                            rowKey={record => record.result.supply_opt}
                            expandable={{
                                expandedRowRender,
                                columnWidth: 20,
                                expandedRowKeys: expendedKeys,
                                onExpand: (event, record) => {
                                    if (event) {
                                        setExpendedKeys([...expendedKeys, record.result.supply_opt]);
                                    } else {
                                        setExpendedKeys(expendedKeys.filter(v => v !== record.result.supply_opt));
                                    }
                                }
                            }}
                            pagination={false}
                        />
                    </ConfigProvider>
                </div>
                <div className={styles['create-order']}>
                    <Button type="primary" onClick={props.close}>{__('Confirm.')}</Button>
                </div>
            </div>
        </Spin>
    );
}

export default OrderCreateFinished;