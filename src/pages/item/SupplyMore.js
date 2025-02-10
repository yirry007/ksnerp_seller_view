import { useEffect, useState } from "react";
import { ItemAction } from "../../actions/ItemAction";
import { Image, InputNumber, Popconfirm, Space, Spin, Table, Tag } from "antd";
import { __, transformItemOption } from "../../utils/functions";

function SupplyMore(props) {
    const [supplyMoreData, setSupplyMoreData] = useState([]);
    const [loading, setLoading] = useState(false);//加载转圈圈

    useEffect(() => {
        getSupplyMore();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取附加采购商品 */
    const getSupplyMore = async () => {
        setLoading(true);

        const res = await ItemAction.supplyMore(props.supply_id);
        if (res) {
            setSupplyMoreData(res.result);
        }

        setLoading(false);
    }

    /** 删除采购附加商品 */
    const deleteSupplyMore = async (id) => {
        setLoading(true);

        const res = await props.delete(id);
        res && setSupplyMoreData(supplyMoreData.filter(v => v.id !== id));

        setLoading(false);
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
            width: 160,
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
            title: __('Number.'),
            width: 60,
            dataIndex: 'supply_unit',
            key: 'supply_unit',
            className: 'align-middle',
            render: (text, record, index) => <InputNumber size="small" min={1} defaultValue={record.supply_unit} style={{ width: 60 }} onChange={(e) => { props.update(record.id, { supply_unit: e }) }} />,
        },
        {
            title: __('Operation.'),
            width: 80,
            key: 'operation',
            fixed: 'right',
            className: 'align-middle',
            render: (text, record, index) => {
                return (
                    <Space size={2} className="list-opt">
                        <Popconfirm
                            title={__('Confirm to delete.')}
                            description={null}
                            onConfirm={() => {deleteSupplyMore(record.id)}}
                            okText={__('Confirm.')}
                            cancelText={__('Cancel.')}
                        >
                            <Tag color="error" className="pointer">{__('Delete.')}</Tag>
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <Spin spinning={loading}>
            <div className="table">
                <Table
                    bordered
                    size="small"
                    columns={columns}
                    dataSource={supplyMoreData}
                    rowKey={record => record.id}
                    pagination={false}
                />
            </div>
        </Spin>
    );
}

export default SupplyMore;