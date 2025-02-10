import { useEffect, useState } from 'react';
import styles from './item.module.scss';
import { Button, Card, Col, Divider, Empty, Image, Input, Popconfirm, Row, Spin, Tooltip, Typography, message } from 'antd';
import { __, addComma, transformItemOption } from '../../utils/functions';
import { ItemAction } from '../../actions/ItemAction';
import { OrderAction } from '../../actions/OrderAction';

function SourcingView(props) {
    const [itemData, setItemData] = useState({});//订单商品信息
    const [supplyData, setSupplyData] = useState(null);//采购商品
    const [orders, setOrders] = useState([]);//订单商品所属的订单列表
    const [unitySupplyInput, setUnitySupplyInput] = useState({});//统一采购信息
    const [loading, setLoading] = useState(false);

    const { Paragraph } = Typography;

    useEffect(() => {
        getItemInfo();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取订单数据和订单总数 */
    const getItemInfo = async () => {
        setLoading(true);

        const res = await ItemAction.sourcingView({ item_id: props.item_id, item_options: encodeURIComponent(props.item_options) });

        if (res) {
            setItemData(res.result.item);
            setSupplyData(res.result.supply);
            setOrders(res.result.orders);
        }

        setLoading(false);
    }

    /** 更新订单商品的采购，快递信息 */
    const updateOrderItem = async (order_item_id, update_data) => {
        const res = await OrderAction.updateOrderItem(order_item_id, update_data);
        console.log(res);
    }

    /** 统一更新订单商品的采购，快递信息 */
    const unityUpdateOrderItem = async () => {
        if (!unitySupplyInput.unity_supply_order_id || !unitySupplyInput.unity_supply_delivery_name || !unitySupplyInput.unity_supply_delivery_number) {
            message.error(__('Parameter error.'));
            return false;
        }

        setLoading(true);

        const res = await OrderAction.unityUpdateOrderItem({ item_id: props.item_id, item_options: props.item_options, ...unitySupplyInput });
        res.code === '' && message.info(__('Updated orders.') + res.result);

        setLoading(false);

        await getItemInfo();
    }

    return (
        <Spin spinning={loading}>
            <div className="sourcing-view">
                <Divider orientation="left" style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)' }}>{__('Sourcing items.')}</Divider>
                {supplyData
                    ? (
                        <div className={styles['info']}>
                            <Row gutter={8} style={{ marginBottom: 12 }}>
                                <Col span={6}>
                                    <Image src={supplyData.supply_image} />
                                </Col>
                                <Col span={18}>
                                    <Paragraph ellipsis={{ rows: 4 }} title={supplyData.supply_name} style={{ margin: 0, minHeight: 70 }}>
                                        {supplyData.supply_name}
                                    </Paragraph>
                                    <div className={styles['item-price']}>￥{addComma(supplyData.supply_price)}</div>
                                </Col>
                            </Row>
                            <ul className={styles['info-line']}>
                                <li>
                                    <b>{__('Buy number.')}</b>
                                    <i className={styles['item-quantity']}>x {itemData.quantity ? itemData.quantity : '-'}</i>
                                </li>
                                <li>
                                    <b>{__('Item options.')}</b>
                                    <Tooltip placement="topRight" title={supplyData.supply_options}>
                                        <i>{transformItemOption(supplyData.supply_options)}</i>
                                    </Tooltip>
                                </li>
                                <li>
                                    <b>{__('Supply url.')}</b>
                                    <a className={styles['item-url']} href={supplyData.supply_url} target='_blank' rel="noreferrer">{supplyData.supply_url}</a>
                                </li>
                            </ul>
                        </div>
                    )
                    : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={__('There is no mapped item.')} />
                }

                <Divider orientation="left" style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)' }}>{__('Order Items.')}</Divider>
                <div className={styles['info']}>
                    <Row gutter={8} style={{ marginBottom: 12 }}>
                        <Col span={6}>
                            <Image src={itemData.item_image !== '' ? itemData.item_image : require('../../assets/img/gift.png')} />
                        </Col>
                        <Col span={18}>
                            <Paragraph ellipsis={{ rows: 3 }} title={itemData.item_name} style={{ margin: 0, minHeight: 54 }}>
                                {itemData.item_name}
                            </Paragraph>
                            <div className={styles['item-price']}>{addComma(itemData.item_price)}円</div>
                        </Col>
                    </Row>
                    <ul className={styles['info-line']}>
                        <li>
                            <b>{__('Buy number.')}</b>
                            <i className={styles['item-quantity']}>x {itemData.quantity}</i>
                        </li>
                        <li>
                            <b>{__('Item options.')}</b>
                            <Tooltip placement="topRight" title={itemData.item_options}>
                                <i>{transformItemOption(itemData.item_options)}</i>
                            </Tooltip>
                        </li>
                        <li>
                            <b>{__('Supply url.')}</b>
                            <a className={styles['item-url']} href={itemData.item_url} target='_blank' rel="noreferrer">{itemData.item_url}</a>
                        </li>
                    </ul>
                </div>

                <Divider orientation="left" style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)' }}>{__('Order Info.')}</Divider>
                <Card size="small" style={{ marginBottom: 12 }}>
                    <ul className={styles['info-line']}>
                        <li>
                            <b>{__('Uniform order ID.')}</b>
                            <Input size="small" style={{ width: 200, textAlign: 'right' }} placeholder={__('Please input uniform order ID.')} onInput={(e) => { setUnitySupplyInput({ ...unitySupplyInput, unity_supply_order_id: e.target.value }) }} />
                        </li>
                        <li>
                            <b>{__('Uniform delivery company.')}</b>
                            <Input size="small" style={{ width: 200, textAlign: 'right' }} placeholder={__('Please input uniform delivery company.')} onInput={(e) => { setUnitySupplyInput({ ...unitySupplyInput, unity_supply_delivery_name: e.target.value }) }} />
                        </li>
                        <li>
                            <b>{__('Uniform delivery number.')}</b>
                            <Input size="small" style={{ width: 200, textAlign: 'right' }} placeholder={__('Please input uniform delivery number.')} onInput={(e) => { setUnitySupplyInput({ ...unitySupplyInput, unity_supply_delivery_number: e.target.value }) }} />
                        </li>
                        <li>
                            <Popconfirm
                                placement="topRight"
                                title={__('Confirm update uniform info.')}
                                description={<div dangerouslySetInnerHTML={{__html: __('After the unified modification, all orders containing the purchase order ID, courier company name, courier invoice number are updated to the unified input information.')}} />}
                                onConfirm={unityUpdateOrderItem}
                                okText="确认"
                                cancelText="取消"
                                style={{width: 200}}
                            >
                                <Button block size="small">{__('Update all.')}</Button>
                            </Popconfirm>
                        </li>
                    </ul>
                </Card>
                {orders.map((v, k) => (
                    <Card size="small" style={{ marginBottom: 12 }} key={k}>
                        <ul className={styles['info-line']}>
                            <li>
                                <b>{__('Shop type.')}</b>
                                <i>{v.market}</i>
                            </li>
                            <li>
                                <b>{__('Shop ID.')}</b>
                                <i>{v.shop_id}</i>
                            </li>
                            <li>
                                <b>{__('Shop name.')}</b>
                                <i>{v.shop_name}</i>
                            </li>
                            <li>
                                <b>{__('Order id.')}</b>
                                <i>{v.order_id}</i>
                            </li>
                            <li>
                                <b>{__('Buy number.')}</b>
                                <i>{v.quantity}</i>
                            </li>
                            {/*
                                以下的 li 标签必须带 key 属性，
                                被 li 包含的 Input 带有 defaultValue 属性，
                                默认情况下 state 变换时 defaultValue 不会重新赋值，
                                除非包含 Input 的 li 的 key 属性有变化
                                * 添加 Math.random() 是因为有相同 key 时渲染冲突
                            */}
                            <li key={v.supply_order_id + Math.random()}>
                                <b>{__('Supply order id.')}</b>
                                <Input size="small" style={{ width: 200, textAlign: 'right' }} placeholder={__('Please input supply order id.')} defaultValue={v.supply_order_id} onBlur={e => { updateOrderItem(v.order_item_id, { supply_order_id: e.target.value }) }} />
                            </li>
                            <li key={v.supply_delivery_name + Math.random()}>
                                <b>{__('Delivery company.')}</b>
                                <Input size="small" style={{ width: 200, textAlign: 'right' }} placeholder={__('Please input delivery company.')} defaultValue={v.supply_delivery_name} onBlur={e => { updateOrderItem(v.order_item_id, { supply_delivery_name: e.target.value }) }} />
                            </li>
                            <li key={v.supply_delivery_number + Math.random()}>
                                <b>{__('Delivery number.')}</b>
                                <Input size="small" style={{ width: 200, textAlign: 'right' }} placeholder={__('Please input delivery number.')} defaultValue={v.supply_delivery_number} onBlur={e => { updateOrderItem(v.order_item_id, { supply_delivery_number: e.target.value }) }} />
                            </li>
                        </ul>
                    </Card>
                ))}
            </div>
        </Spin>
    );
}

export default SourcingView;