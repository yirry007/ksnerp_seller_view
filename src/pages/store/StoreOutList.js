import { Button, Card, Descriptions, Divider, Empty, Image, Input, InputNumber, Modal, Space, Spin, Table, Tag } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { __, transformItemOption } from "../../utils/functions";
import { StoreAction } from "../../actions/StoreAction";

function StoreOutList(props) {
    const [loading, setLoading] = useState(false);
    const [outing, setOuting] = useState([]);//申请出库中的商品
    const [outList, setOutList] = useState([]);//待出库清单列表
    const [requestData, setRequestData] = useState({
        name: '',
        tel: '',
        zipcode: '',
        address: '',
        user_explain: '',
    });

    const { confirm } = Modal;
    const { TextArea } = Input;
    const { Meta } = Card;

    useEffect(() => {
        getOuting();
        getOutList();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取申请出库中的库存商品列表 */
    const getOuting = async () => {
        setLoading(true);

        const res = await StoreAction.storeOutRequesting();
        res.code === '' && setOuting(res.result);
        setLoading(false);
    }

    /** 待出库清单 */
    const getOutList = async () => {
        setLoading(true);

        const res = await StoreAction.storeOutList();
        if (res.code === '') {
            setOutList(res.result);

            const _requestMap = {};
            res.result.forEach(v => {
                _requestMap[v.id] = '1';
            });
            setRequestData({...requestData, ..._requestMap})
        }
        setLoading(false);
    }

    /** 取消申请出库 */
    const cancelOutRequesting = (storeOut) => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: storeOut.user_explain,
            content: __('Confirm to delete store out request.'),
            okText: __('Confirm.'),
            cancelText: __('Cancel.'),
            onOk: async () => {
                const res = await StoreAction.cancelOutRequesting(storeOut.id);
                res && setOuting(outing.filter(v => v.id !== storeOut.id));
                console.log(res);
            }
        });
    }

    /** 删除待出库清单 */
    const deleteOutList = (item) => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: item.sku,
            content: __('Confirm to delete row.'),
            okText: __('Confirm.'),
            cancelText: __('Cancel.'),
            onOk: async () => {
                const res = await StoreAction.deleteOutList(item.id);
                if (res) {
                    setOutList(outList.filter(v => v.id !== item.id));
                    props.resetRequestingCount();
                }
                console.log(res);
            }
        });
    }

    /** 库存商品申请出库 */
    const storeOutRequest = async () => {
        setLoading(true);

        const params = {};
        const _items = [];

        Object.keys(requestData).forEach(v => {
            if (isNaN(v)) {
                params[v] = requestData[v];
            } else {
                _items.push({
                    store_goods_item_id: v,
                    num: requestData[v]
                });
            }
        });

        params['items'] = _items;

        const res = await StoreAction.storeOutRequest(params);
        if (res) {
            getOuting();

            setOutList([]);
            setRequestData({
                name: '',
                tel: '',
                zipcode: '',
                address: '',
                user_explain: '',
            });
            
            props.resetRequestingCount();
        }

        setLoading(false);
    }

    const columnsOuting = [
        {
            title: __('SKU image.'),
            width: 60,
            dataIndex: 'img_src',
            key: 'img_src',
            render: (text, record, index) => <Image src={record['img_src']} style={{ width: 50 }} />,
        },
        {
            title: __('SKU code.'),
            width: 100,
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: __('SKU number.'),
            width: 60,
            dataIndex: 'num',
            key: 'num',
        },
        {
            title: __('SKU value.'),
            width: 160,
            dataIndex: 'item_json',
            key: 'item_json',
            render: (text, record, index) => transformItemOption(record.item_json)
        },
    ];

    const columnsOutList = [
        {
            title: __('SKU image.'),
            width: 60,
            dataIndex: 'img_src',
            key: 'img_src',
            render: (text, record, index) => <Image src={record['img_src']} style={{ width: 50 }} />,
        },
        {
            title: __('SKU code.'),
            width: 100,
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: __('Depot Number.'),
            width: 60,
            dataIndex: 'num',
            key: 'num',
        },
        {
            title: __('Store out number.'),
            width: 60,
            dataIndex: 'out_num',
            key: 'out_num',
            render: (text, record, index) =>
                <InputNumber style={{width: 60}} defaultValue={1} onBlur={(e) => setRequestData({...requestData, [record.id]: e.target.value})} />,
        },
        {
            title: __('SKU value.'),
            width: 150,
            dataIndex: 'item_json',
            key: 'item_json',
            render: (text, record, index) => transformItemOption(record.item_json)
        },
        {
            title: __('Operation.'),
            width: 60,
            key: 'operation',
            fixed: 'right',
            render: (text, record, index) => {
                return (
                    <Space size={2} className="list-opt">
                        <Tag color="error" className="pointer" onClick={() => { deleteOutList(record) }}>{__('Delete.')}</Tag>
                    </Space>
                );
            },
        },
    ];

    const storeOut = [
        {
            key: 'name',
            label: __('Recipient.'),
            children: (
                <Input
                    size="small"
                    style={{ width: 450 }}
                    value={requestData.name}
                    onChange={(e) => setRequestData({...requestData, name: e.target.value})}
                />
            ),
            span: 2,
            labelStyle: { width: 90 }
        },
        {
            key: 'tel',
            label: __('Phone.'),
            children: <Input size="small" value={requestData.tel} onChange={(e) => setRequestData({...requestData, tel: e.target.value})} />
        },
        {
            key: 'zipcode',
            label: __('Zipcode.'),
            children: <Input size="small" value={requestData.zipcode} onChange={(e) => setRequestData({...requestData, zipcode: e.target.value})} />
        },
        {
            key: 'address',
            label: __('Full address.'),
            children: (
                <Input
                    size="small"
                    value={requestData.address}
                    style={{ width: 450 }}
                    onChange={(e) => setRequestData({...requestData, address: e.target.value})}
                />
            ),
            span: 2,
            labelStyle: { width: 90 }
        },
        {
            key: 'user_explain',
            label: __('Memo.'),
            labelStyle: { width: 90, verticalAlign: 'top' },
            children: (
                <TextArea
                    value={requestData.user_explain}
                    onChange={(e) => setRequestData({...requestData, user_explain: e.target.value})}
                    autoSize={{ minRows: 3, maxRows: 5 }}
                />
            )
        },
    ];

    const outInfo = (info) => (
        [
            {
              key: 'name',
              label: __('Recipient.'),
              children: info.name,
            },
            {
              key: 'tel',
              label: __('Phone.'),
              children: info.tel,
            },
            {
              key: 'zipcode',
              label: __('Zipcode.'),
              children: info.zipcode,
            },
            {
              key: 'address',
              label: __('Full address.'),
              children: info.address,
            },
            {
              key: 'user_explain',
              label: __('Memo.'),
              children: info.user_explain,
              span: 2
            },
          ]
    );

    return (
        <Spin spinning={loading}>
            <Divider orientation="left" style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)', margin: 0, marginBottom: 20 }}>{__('Store out requesting.')}</Divider>

            {outing.map(v => (
                <div key={v.id}>
                    <Card
                        size="small"
                        title={v.nickname}
                        extra={<Tag color="error" className="pointer" onClick={() => { cancelOutRequesting(v) }}>{__('Delete.')}</Tag>}
                    >
                        <Table
                            bordered
                            size="small"
                            columns={columnsOuting}
                            dataSource={v.store_out_log}
                            rowKey={r => r.sku}
                            pagination={false}
                            scroll={{ y: 370 }}
                        />
                        <div style={{ height: 12 }}></div>
                        <Meta description={<Descriptions size="small" column={2} items={outInfo(v)} />} />
                    </Card>
                    <div style={{ height: 10 }}></div>
                </div>
            ))}

            {outing.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}

            <div style={{ height: 40 }}></div>

            <Divider orientation="left" style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)', margin: 0, marginBottom: 20 }}>{__('Store out requesting list.')}</Divider>

            <Table
                bordered
                size="small"
                columns={columnsOutList}
                dataSource={outList}
                rowKey={r => r.id}
                pagination={false}
                scroll={{ y: 370 }}
            />

            <div style={{ height: 10 }}></div>

            <Descriptions
                bordered
                column={2}
                title={false}
                size="small"
                items={storeOut}
            />

            <div style={{ height: 40 }}></div>

            {outList.length > 0 && <Button type="primary" htmlType="submit" className="login-form-button" onClick={storeOutRequest}>{__('submit.')}</Button>}
        </Spin>
    );
}

export default StoreOutList;