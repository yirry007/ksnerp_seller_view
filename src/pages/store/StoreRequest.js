import { Button, Descriptions, Divider, Image, Input, InputNumber, Select, Space, Modal, Spin, Table, Upload, message, Avatar, Row, Col, Tag } from "antd";
import { ExclamationCircleOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { StoreAction } from "../../actions/StoreAction";
import { __, transformItemOption } from "../../utils/functions";
import { initSku } from "../../System";

function StoreRequest(props) {
    /** 初始化申请商品入库数据 */
    const initStoreData = () => {
        if (props.action && props.action.store_goods_id) {
            /** 已有 sku 的前提下补充数量 */
            return {
                name: props.action.name,
                request_level: 'number',//入库模式，补充数量
                store_goods_id: props.action.store_goods_id,
                store_goods_item_id: props.action.id
            };
        } else if (props.action && !props.action.store_goods_id) {
            /** 已有商品的前提下新增 sku */
            return {
                name: props.action.name,
                request_level: 'sku',//入库模式，新增SKU
                store_goods_id: props.action.id
            };
        } else {
            return {
                request_level: 'all',//入库模式，新增商品
                store_goods_id: 0
            };
        }
    }

    const [loading, setLoading] = useState(false);
    const [storing, setStoring] = useState([]);//申请入库中的商品
    const [defaultSkuKeys, setDefaultSkuKeys] = useState(null);
    const [logistics, setLogistics] = useState([]);//物流商
    const [storeData, setStoreData] = useState(initStoreData());//待入库商品资料
    const [skuGroup, setSkuGroup] = useState(storeData.request_level === 'all' ? initSku() : []);

    const { confirm } = Modal;

    const act = {
        all: '[ '+__('New Goods.')+' ]',
        sku: '[ '+__('Create new SKU.')+' ]',
        number: '[ '+__('Apply store.')+' ]',
    };

    useEffect(() => {
        getSkuKeys();
        getStoring();
        getLogistics();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 取商品SKU key */
    const getSkuKeys = async () => {
        if (storeData.request_level !== 'sku') return false;

        setLoading(true);

        const res = await StoreAction.getSkuKeys({ store_goods_id: storeData.store_goods_id });
        if (res.code === '') {
            setDefaultSkuKeys(res.result);
            setSkuGroup(initSku({ keys: res.result }));
        }
        setLoading(false);
    }

    /** 获取申请入库中的库存商品列表 */
    const getStoring = async () => {
        setLoading(true);

        const res = await StoreAction.storeRequesting();
        res.code === '' && setStoring(res.result);
        setLoading(false);
    }

    /** 获取物流商 */
    const getLogistics = async () => {
        setLoading(true);

        const res = await StoreAction.getLogistics();

        if (res.code === '') {
            setLogistics(res.result.map(v => (
                {
                    ...v,
                    key: v.id
                }
            )));

            props.action && resetStoreData('logistic_id', props.action.logistics_id);
        }

        setLoading(false);
    }

    /** 添加一行SKU值 */
    const addValue = (index) => {
        setSkuGroup(skuGroup.map((v, k) => {
            if (k === index) {
                v.values = [
                    ...v.values,
                    {
                        val: "",
                        image: "",
                        isFirst: false,
                    }
                ];
            }

            return v;
        }));
    }

    /** 删除一行SKU值 */
    const removeValue = (index, index1) => {
        setSkuGroup(skuGroup.map((v, k) => {
            if (k === index) {
                const _values = [];
                v.values.forEach((v1, k1) => {
                    if (k1 !== index1) _values.push(v1);
                });

                v.values = _values;
            }

            return v;
        }));
    }

    /** 设置 SKU key */
    const setSkuKey = (index, value) => {
        setSkuGroup(skuGroup.map((v, k) => {
            if (k === index) {
                v.key = value;
            }

            return v;
        }))
    }

    /** 设置 SKU value */
    const setSkuValue = (index, index1, value, key = 'val') => {
        setSkuGroup(skuGroup.map((v, k) => {
            if (k === index) {
                v.values.map((v1, k1) => {
                    if (k1 === index1) v1[key] = value;

                    return v1;
                });
            }

            return v;
        }));
    }

    /** 选择并设置 SKU 图片 */
    const setImage = (index, index1, file) => {
        const reader = new FileReader();
        const image = document.createElement('img');

        reader.readAsDataURL(file);
        reader.onload = () => {
            image.src = reader.result;
        }

        image.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 360;
            canvas.height = 360;
            context.drawImage(image, 0, 0, canvas.width, canvas.height)
            const base64Data = canvas.toDataURL('image/jpeg', 0.9);// 压缩图片，质量参数太大反而会加大图片体积！
            setSkuValue(index, index1, base64Data, 'image')
        }

        /** 禁止文件默认提交 */
        return false;
    }

    /** 设置申请入库的商品信息 */
    const resetStoreData = (key, value) => {
        setStoreData({
            ...storeData,
            [key]: value
        });
    }

    /** 商品申请入库 */
    const storeRequest = async () => {
        setLoading(true);

        if (!storeData.name) {
            message.error(__('Please input item name.'));
            setLoading(false);
            return false;
        }
        if (!storeData.num) {
            message.error(__('Please input item number.'));
            setLoading(false);
            return false;
        }
        if (!storeData.logistic_id) {
            message.error(__('Please select logistic.'));
            setLoading(false);
            return false;
        }

        /** 过滤空字符串的 key 和 val */
        const _skuGroup = [];
        skuGroup.forEach(v => {
            if (v.key) {
                const values = v.values.filter(v1 => v1.val !== '');

                if (values.length) {
                    _skuGroup.push({
                        key: v.key,
                        values: values,
                        hasImage: v.hasImage
                    });
                }
            }
        });

        if (storeData.request_level !== 'number' && _skuGroup.length === 0) {
            message.error(__('Please input item SKU.'));
            setLoading(false);
            return false;
        }

        const _storeData = { ...storeData, sku_group: _skuGroup }

        const res = await StoreAction.storeRequest(_storeData);
        if (res) {
            getStoring();
            setStoreData(initStoreData());//初始化申请入库商品数据

            let _skuGroupParam;
            if (defaultSkuKeys) {
                _skuGroupParam = initSku({ keys: res.result });
            } else {
                _skuGroupParam = storeData.request_level === 'all' ? initSku() : [];
            }
            setSkuGroup(_skuGroupParam);
            props.resetRequestingCount();
        }

        setLoading(false);
    }

    /** 重新设置申请入库中的SKU数量 */
    const updateRequesting = async (sku, params) => {
        setLoading(true);

        const res = await StoreAction.updateRequesting({ sku, ...params });
        console.log(res);

        setLoading(false);
    }

    /** 取消申请入库 */
    const cancelRequesting = (sku) => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: `SKU: ${sku}`,
            content: __('Confirm to delete store in request.'),
            okText: __('Confirm.'),
            cancelText: __('Cancel.'),
            onOk: async () => {
                const res = await StoreAction.cancelRequesting({ sku });
                if (res) {
                    setStoring(storing.filter(v => v.sku !== sku));
                    props.resetRequestingCount();
                }
                console.log(res);
            }
        });
    }

    const columns = [
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
            render: (text, record, index) =>
                <InputNumber style={{width: 60}} defaultValue={record.num} onBlur={(e) => updateRequesting(record.sku, {num: e.target.value})} />,
        },
        {
            title: __('SKU price.'),
            width: 80,
            dataIndex: 'price',
            key: 'price',
            render: (text, record, index) =>
                <InputNumber style={{width: 80}} defaultValue={record.price} onBlur={(e) => updateRequesting(record.sku, {price: e.target.value})} />,
        },
        {
            title: __('SKU value.'),
            width: 140,
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
                        <Tag color="error" className="pointer" onClick={() => { cancelRequesting(record.sku) }}>删除</Tag>
                    </Space>
                );
            },
        },
    ];

    const storeIn = [
        {
            key: 'name',
            label: __('Supply name.'),
            children: <Input size="small" value={storeData.name} style={{ width: 450 }} onChange={(e) => { resetStoreData('name', e.target.value) }} disabled={storeData.request_level !== 'all'} />,
            span: 2,
            labelStyle: { width: 90 }
        },
        {
            key: 'num',
            label: __('Store in number.'),
            children: <InputNumber size="small" value={storeData.num} min={0} max={100000} onChange={(e) => { resetStoreData('num', e) }} />
        },
        {
            key: 'price',
            label: __('Item price.'),
            children: <InputNumber size="small" value={storeData.price} min={0} onChange={(e) => { resetStoreData('price', e) }} />
        },
        {
            key: 'user',
            label: __('User belongs to.'),
            children: (
                <Select
                    size="small"
                    mode="tags"
                    style={{ width: '100%'}}
                    placeholder={__('Please select or input the user belongs to.')}
                    onChange={(e) => { resetStoreData('usernames', e.join(',')) }}
                    options={props.users}
                />
            )
        },
        {
            key: 'logistic_id',
            label: __('Logistic.'),
            children: (
                <Select
                    size="small"
                    style={{
                        width: 120,
                    }}
                    value={storeData.logistic_id}
                    onChange={(e) => { resetStoreData('logistic_id', e) }}
                    options={logistics.map(v => ({ value: v.id, label: v.nickname }))}
                    disabled={storeData.request_level !== 'all'}
                />
            )
        },
        {
            key: 'waybill_number',
            label: __('Delivery number.'),
            children: <Input size="small" value={storeData.waybill_number} onChange={(e) => { resetStoreData('waybill_number', e.target.value) }} />
        },
        {
            key: 'user_explain',
            label: __('Memo.'),
            children: <Input size="small" value={storeData.user_explain} onChange={(e) => { resetStoreData('user_explain', e.target.value) }} />
        },
        {
            key: 'item_json',
            label: __('Item SKU.'),
            children: (
                skuGroup.length > 0
                    ? (
                        <Row gutter={[36, 36]}>
                            {skuGroup.map((v, k) => (
                                <Col span={12} key={k}>
                                    <Space style={{ alignItems: 'flex-start' }}>
                                        <Input style={{ width: 80 }} value={v.key} onChange={(e) => setSkuKey(k, e.target.value)} disabled={!v.enable} />
                                        <Space direction="vertical">
                                            {v.values.map((v1, k1) => (
                                                <Space key={k1}>
                                                    <Input style={{ width: 100 }} value={v1.val} onChange={(e) => setSkuValue(k, k1, e.target.value)} />
                                                    {v.hasImage &&
                                                        <Upload
                                                            beforeUpload={(file) => setImage(k, k1, file)}
                                                            maxCount={1}
                                                            accept=".jpg,.jpeg,.png"
                                                            showUploadList={false}
                                                        >
                                                            <Avatar shape="square" src={v1.image ? v1.image : require('../../assets/img/upload.png')} size={32} />
                                                        </Upload>
                                                    }
                                                    {v1.isFirst
                                                        ? <Button type="dashed" icon={<PlusOutlined />} onClick={() => addValue(k)} />
                                                        : <Button type="dashed" icon={<MinusOutlined />} onClick={() => removeValue(k, k1)} />
                                                    }
                                                </Space>
                                            ))}
                                        </Space>
                                    </Space>
                                </Col>
                            ))}
                        </Row>
                    )
                    : transformItemOption(props.action.item_json)
            ),
            span: 2
        },
    ];

    return (
        <Spin spinning={loading}>
            <Divider orientation="left" style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)', margin: 0, marginBottom: 20 }}>{__('Store in requesting.')}</Divider>
            <Table
                bordered
                size="small"
                columns={columns}
                dataSource={storing}
                rowKey={r => r.sku}
                pagination={false}
                scroll={{ y: 370 }}
            />

            <div style={{ height: 40 }}></div>

            <Divider orientation="left" style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)', margin: 0, marginBottom: 20 }}>{act[storeData.request_level]} {__('Create new Store in requesting.')}</Divider>
            <Descriptions
                bordered
                column={2}
                title={false}
                size="small"
                items={storeIn}
            />

            <Divider style={{ border: 'none' }} />
            <Button type="primary" htmlType="submit" className="login-form-button" onClick={storeRequest}>{__('submit.')}</Button>
        </Spin>
    );
}

export default StoreRequest;