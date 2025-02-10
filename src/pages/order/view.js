import { Col, Divider, List, Row, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { OrderAction } from '../../actions/OrderAction';
import { marketIcons, orderStatusMap } from '../../Constants';
import { __, addComma, buildFullAddress, buildItemOption, sliceArray } from '../../utils/functions';
import styles from './order.module.scss';

function OrderView(props) {
    const [order, setOrder] = useState({});
    const [orderState, setOrderState] = useState('');
    const [loading, setLoading] = useState(true);

    const {Text} = Typography;

    useEffect(() => {
        getOrder();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取订单详细数据 */
    const getOrder = async () => {
        const res = await OrderAction.show(props.order_id);

        /** 订单数据 */
        setOrder(res.result);

        /** 订单状态 */
        for (let i = 0; i < orderStatusMap.length; i++) {
            if (orderStatusMap[i]['keys'].includes(res.result.order_status)) {
                setOrderState(orderStatusMap[i]['status']);
                break;
            }
        }

        setLoading(false);
    }

    /** 订单其他信息 */
    const otherOrderInfo = () => {
        let infoNode = <></>;

        if (order.infos) {
            try {
                const infos = JSON.parse(order.infos);
                const infoGroup = sliceArray(infos, 3);
                
                infoNode = infoGroup.map((group, g_key)=>
                    <Row key={g_key}>
                        {group.map((v, k)=>
                            <Col span={8} key={k}>
                                <DescriptionItem title={v.name} content={v.value} />
                            </Col>
                        )}
                    </Row>
                );
            } catch (e) {
                console.log(e);
            }
        }

        return (
            <>
                {infoNode}
            </>
        );
    }

    /** 订单数据 ReactNode, key: value */
    const DescriptionItem = ({ title, content }) => {
        return (
            <div className={styles['item-wrapper']}>
                <p className={styles['item-label']}>{title}:</p>
                <Text className={styles['item-content']} ellipsis={{tooltip: content}}>{content}</Text>
            </div>
        );
    };

    return (
        <Spin spinning={loading}>

            <p className={styles['item-title']}>
                {marketIcons[order.market] ? <img src={require('../../assets/img/' + order.market.toLowerCase() + '.png')} alt={order.market} style={{ width: '60px' }} /> : order.market}
            </p>
            <Row>
                <Col span={8}>
                    <DescriptionItem title={__('Shop type.')} content={order.market} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Shop ID.')} content={order.sh_shop_id} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Device name.')} content={order.device} />
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <DescriptionItem title={__('Order ID.')} content={order.order_id} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Order status.')} content={orderState} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Order time.')} content={order.order_time} />
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <DescriptionItem title={__('Payment status.')} content={order.pay_status === 1 ? __('Paid.') : __('Not Paid.')} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Payment time.')} content={order.pay_time ? order.pay_time : '-'} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Payment currency.')} content={order.currency} />
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <DescriptionItem title={__('Order Price.')} content={order.order_price} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Discount price.')} content={order.discount} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Actual Order price.')} content={order.total_price} />
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <DescriptionItem title={__('Shipping time.')} content={order.shipping_time ? order.shipping_time : '-'} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Logistic Company.')} content={order.shipping_company} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Invoice number.')} content={order.invoice_number_1} />
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <DescriptionItem title={__('Country.')} content={order.country} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Prefecture.')} content={order.prefecture} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Districts.')} content={order.city} />
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <DescriptionItem title={__('Name 1.')} content={order.name_1} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Name 2.')} content={order.name_2} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Email address.')} content={order.email} />
                </Col>
            </Row>
            <Row>
                <Col span={8}>
                    <DescriptionItem title={__('Phone 1.')} content={order.phone_1} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Phone 2.')} content={order.phone_2} />
                </Col>
                <Col span={8}>
                    <DescriptionItem title={__('Zipcode.')} content={order.zipcode} />
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <DescriptionItem title={__('Full address.')} content={buildFullAddress(order)} />
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <DescriptionItem title={__('Memo.')} content={order.remark} />
                </Col>
            </Row>

            <Divider />
            <p className={styles['item-title']}>{__('Order Items.')}</p>
            <List
                className="demo-loadmore-list"
                itemLayout="horizontal"
                dataSource={order.order_items}
                renderItem={(item) => (
                    <List.Item actions={[
                        <strong>{addComma(item.item_price)}</strong>
                        , <span>x {item.quantity}</span>
                    ]}>
                        <List.Item.Meta
                            avatar={<img width={80} src={
                                item.item_image !== ''
                                ? item.item_image
                                : (item.supply_image !== ''
                                    ? item.supply_image
                                    : require('../../assets/img/gift.png')
                                )
                            } alt="" />}
                            title={<a target="_blank" href={item.item_url} rel="noreferrer" className={styles['item-url']}>{item.item_name}</a>}
                            description={buildItemOption(item.options)}
                        />
                    </List.Item>
                )}
            />

            <Divider />
            <p className={styles['item-title']}>{__('Other.')}</p>
            {otherOrderInfo()}
        </Spin>
    );
}

export default OrderView;