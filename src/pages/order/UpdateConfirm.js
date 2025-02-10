import { Button, DatePicker, Divider, Empty, Input, Popover, Select, Spin } from 'antd';
import { shippingCompany, marketIcons, orderStatusMap } from '../../Constants';
import styles from './order.module.scss';
import { OrderAction } from '../../actions/OrderAction';
import { useEffect, useState } from 'react';
import { __ } from '../../utils/functions';


function UpdateConfrim(props) {
    const [confirmData, setConfirmData] = useState([]);
    const [shopEmailTemplateId, setShopEmailTemplateId] = useState({});
    const [orderShippingInfo, setOrderShippingInfo] = useState({});
    const [shippingDate, setShippingDate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOrderUpdateConfirmData();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取订单状态更新之前的订单数据，并加以确认 */
    const getOrderUpdateConfirmData = async () => {
        const res = await OrderAction.orderConfirm(props.selectedRowKeys);

        if (res.code !== '') {
            setLoading(false);
            return false;
        }

        const result = res.result;
        setConfirmData(result);

        /** 设置店铺默认使用的邮件模板，并初始化每个订单的初始物流信息 */
        const _shopTemplateMap = {};
        const _orderShippingMap = {};
        for (let i = 0; i < result.length; i++) {
            /**
             * 构建店铺和邮件模板id映射表
             * format: {shop_id: template_id, shop_id: template_id}
             */
            for (let m = 0; m < result[i]['email_templates'].length; m++) {
                if (result[i]['email_templates'][m]['type'] !== parseInt(props.orderStatus)) continue;

                /** 订单确认时邮件模板默认已被选择的状态，订单发货时邮件模板默认未选择的状态 */
                _shopTemplateMap[result[i]['shop_id']] = props.orderStatus === '0' ? result[i]['email_templates'][m]['id'] : 0;
            }

            /**
             * 构建订单和物流信息映射表
             * format: {
             *     order_id: {
             *          shipping_company: some number,
             *          invoice_number_1: some number,
             *          invoice_number_2: some number,
             *     },
             *     order_id: {
             *          shipping_company: some number,
             *          invoice_number_1: some number,
             *          invoice_number_2: some number,
             *     }
             * }
             */
            for (let j = 0; j < result[i]['orders'].length; j++) {
                _orderShippingMap[result[i]['orders'][j]['order_id']] = result[i]['orders'][j];
            }
        }
        
        setShopEmailTemplateId(_shopTemplateMap);
        setOrderShippingInfo(_orderShippingMap);
        /** 给父组件同步 */
        props.orderDataChange(_shopTemplateMap, _orderShippingMap, shippingDate);

        setLoading(false);
    }

    const setLogo = market => {
        return marketIcons[market] ? <img src={require('../../assets/img/' + market.toLowerCase() + '.png')} alt={market} style={{ width: '60px' }} /> : market;
    }

    /** 重新设置店铺的邮件模板 */
    const resetShopEmailTemplate = (val, shop_id) => {
        const _shopEmailTemplateId = { ...shopEmailTemplateId, [shop_id]: val };
        setShopEmailTemplateId(_shopEmailTemplateId);

        /** 给父组件同步 */
        props.orderDataChange(_shopEmailTemplateId, orderShippingInfo, shippingDate);
    }

    /** 重新设置订单的物流信息 */
    const resetOrderShippingInfo = (key, val, order_id) => {
        const _orderInfo = orderShippingInfo[order_id];
        _orderInfo[key] = val;
        const _orderShippingInfo = { ...orderShippingInfo, [order_id]: _orderInfo };
        setOrderShippingInfo(_orderShippingInfo);

        /** 给父组件同步 */
        props.orderDataChange(shopEmailTemplateId, _orderShippingInfo, shippingDate);
    }

    /** 重新设置发货时间 */
    const resetShippingDate = (date, dateString) => {
        setShippingDate(dateString);

        /** 给父组件同步 */
        props.orderDataChange(shopEmailTemplateId, orderShippingInfo, dateString);
    }

    return (
        <Spin spinning={loading}>
            {confirmData.length > 0
                ? <div className={styles['update-confirm']}>
                    {props.orderStatus === '4' &&
                        <h4 style={{ fondSize: 13, color: '#ff0000' }}>{__('Note: Orders in customs clearance tracking status usually do not need to be updated manually. The ERP system automatically tracks the logistics and updates the order status. If the delivery time is delayed or the logistics information cannot be tracked for a long time.')}</h4>
                    }

                    {confirmData.map((v, k) => {
                        /** 构建邮件模板的select option */
                        let emailTemplateOptions = v.email_templates.filter(eto => eto.type === parseInt(props.orderStatus));
                        emailTemplateOptions = emailTemplateOptions.map(v => (
                            {
                                value: v.id,
                                label: v.title
                            }
                        ));

                        return (
                            <div key={k}>
                                <Divider />
                                <div className={styles['update-module']}>
                                    <h2>{setLogo(v.market)}</h2>
                                    <ul>
                                        <li>
                                            <em>{__('Shop ID.')}</em>
                                            <strong title={v.shop_id}>{v.shop_id}</strong>
                                        </li>
                                        <li>
                                            <em>{__('Shop name.')}</em>
                                            <strong title={v.shop_name}>{v.shop_name}</strong>
                                        </li>
                                        {emailTemplateOptions.length > 0 &&
                                            <li>
                                                <em>{__('Email template.')}</em>
                                                <strong>
                                                    <Select
                                                        style={{ width: 200, marginLeft: 8 }}
                                                        onChange={e => { resetShopEmailTemplate(e, v.shop_id) }}
                                                        options={[{ value: 0, label: __('Not send.') }, ...emailTemplateOptions]}
                                                        defaultValue={props.orderStatus === '0' ? emailTemplateOptions[0]['value'] : 0}
                                                    />
                                                </strong>
                                            </li>
                                        }
                                    </ul>
                                    <section>
                                        <em>{__('Order ID.')}</em>
                                        {v.orders.map((v1, k1) => {
                                            const orderInfo = (
                                                <dl className={styles['confirm-order-info']}>
                                                    <dd>
                                                        <em style={{ display: 'inline-block', width: 72 }}>{__('Order status.')}: </em>
                                                        <strong>{orderStatusMap[v1.order_status]}</strong>
                                                    </dd>
                                                    {v1.order_status >= 4 &&
                                                        <>
                                                            <dd style={{ marginTop: 12 }}>
                                                                <em style={{ display: 'inline-block', width: 72 }}>{__('Logistic Company.')}: </em>
                                                                <Select
                                                                    style={{ width: 200 }}
                                                                    defaultValue={v1.shipping_company}
                                                                    options={shippingCompany.map(exp => (
                                                                        {
                                                                            value: exp.name,
                                                                            label: exp.label
                                                                        }
                                                                    ))}
                                                                    onChange={e => { resetOrderShippingInfo('shipping_company', e, v1.order_id) }}
                                                                />
                                                            </dd>
                                                            <dd style={{ marginTop: 12 }}>
                                                                <em style={{ display: 'inline-block', width: 72 }}>{__('Invoice number I.')}: </em>
                                                                <Input
                                                                    defaultValue={v1.invoice_number_1}
                                                                    style={{ width: 200 }}
                                                                    placeholder={__('Invoice number I.')}
                                                                    onChange={e => { resetOrderShippingInfo('invoice_number_1', e.target.value, v1.order_id) }}
                                                                />
                                                            </dd>
                                                            <dd style={{ marginTop: 12 }}>
                                                                <em style={{ display: 'inline-block', width: 72 }}>{__('Invoice number II.')}: </em>
                                                                <Input
                                                                    defaultValue={v1.invoice_number_2}
                                                                    style={{ width: 200 }}
                                                                    placeholder={__('Invoice number II.')}
                                                                    onChange={e => { resetOrderShippingInfo('invoice_number_2', e.target.value, v1.order_id) }}
                                                                />
                                                            </dd>
                                                        </>
                                                    }
                                                </dl>
                                            );

                                            return (
                                                <Popover key={k1} content={orderInfo}>
                                                    <Button type="text">{v1.order_id}</Button>
                                                </Popover>
                                            );
                                        })}
                                    </section>
                                </div>
                            </div>
                        );
                    })}

                    <Divider />

                    {props.orderStatus === '4' &&
                        <div style={{textAlign:'right'}}>
                            <DatePicker onChange={resetShippingDate}/>
                            <h4 style={{ fondSize: 12, color: '#ff0000' }}>*{__('Please select a shipping date (for Yahoo, Rakuten, Wowma stores)')}</h4>
                        </div>
                    }
                </div>
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            }
        </Spin>
    );
}

export default UpdateConfrim;