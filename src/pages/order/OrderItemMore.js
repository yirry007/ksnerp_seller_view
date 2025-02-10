import { useEffect, useState } from "react";
import { Image, Input, Spin, Table } from "antd";
import { __, transformItemOption } from "../../utils/functions";
import { OrderAction } from "../../actions/OrderAction";

function OrderItemMore(props) {
    const [orderItemMores, setOrderItemMores] = useState([]);
    const [loading, setLoading] = useState(false);//加载转圈圈

    useEffect(() => {
        getOrderItemMore();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取附加采购商品 */
    const getOrderItemMore = async () => {
        setLoading(true);

        const res = await OrderAction.orderItemMore(props.orderItemId);
        if (res) {
            setOrderItemMores(res.result);
        }

        setLoading(false);
    }

    /** 更新附加采购商品 */
    const updateOrderItemMore = async (id, params) => {
        const res = await OrderAction.updateOrderItemMore(id, params);
        console.log(res);
    }

    const columns = [
        {
            title: __('Supply image.'),
            width: 50,
            dataIndex: 'supply_image',
            key: 'supply_image',
            className: 'align-middle',
            render: (text, record, index) => <Image src={record['supply_image']} style={{ width: 60 }} />,
        },
        {
            title: __('Supply name.'),
            width: 120,
            dataIndex: 'supply_name',
            key: 'supply_name',
            className: 'align-middle',
            render: (text, record, index) => (
                <a
                    href={record.supply_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{color: 'rgba(0,0,0,0.8)', textDecoration: 'underline', fontSize: 13}}
                >{record.supply_name}</a>
            ),
        },
        {
            title: __('Supply options.'),
            width: 100,
            dataIndex: 'supply_options',
            key: 'supply_options',
            className: 'align-middle',
            render: (text, record, index) => transformItemOption(record.supply_options)
        },
        {
            title: __('Supply unit.'),
            width: 50,
            dataIndex: 'supply_unit',
            key: 'supply_unit',
            className: 'align-middle',
        },
        {
            title: __('Sourcing item number.'),
            width: 50,
            dataIndex: 'supply_quantity',
            key: 'supply_quantity',
            className: 'align-middle',
        },
        {
            title: __('Order ID.'),
            width: 90,
            dataIndex: 'supply_order_id',
            key: 'supply_order_id',
            className: 'align-middle',
            render: (text, record, index) => (
                <Input
                    placeholder={__('Please input Order ID.')}
                    defaultValue={record.supply_order_id}
                    onBlur={e => updateOrderItemMore(record.id, {supply_order_id: e.target.value})}
                />
            )
        },
        {
            title: __('Invoice number.'),
            width: 90,
            dataIndex: 'supply_delivery_number',
            key: 'supply_delivery_number',
            className: 'align-middle',
            render: (text, record, index) => (
                <Input
                    placeholder={__('Please input invoice number.')}
                    defaultValue={record.supply_delivery_number}
                    onBlur={e => updateOrderItemMore(record.id, {supply_delivery_number: e.target.value})}
                />
            )
        },
    ];

    return (
        <Spin spinning={loading}>
            <div className="table">
                <Table
                    bordered
                    size="small"
                    columns={columns}
                    dataSource={orderItemMores}
                    rowKey={record => record.id}
                    pagination={false}
                />
            </div>
        </Spin>
    );
}

export default OrderItemMore;