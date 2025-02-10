import { useEffect, useState } from "react";
import { Button, Image, Input, InputNumber, Spin, Table } from "antd";
import { __, transformItemOption } from "../../utils/functions";
import styles from './store.module.scss';
import { StoreAction } from "../../actions/StoreAction";

function StoreTransfer(props) {
    const [storeData, setDataTransfer] = useState([]);
    const [loading, setLoading] = useState(false);//加载转圈圈

    useEffect(() => {
        getGoodsItemBySku(props.sku);
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const getGoodsItemBySku = async (sku) => {
        setLoading(true);

        const res = await StoreAction.getGoodsItemBySku(sku);
        if (res.code === '') {
            const _data = res.result;
            _data['transfer_num'] = 1;
            _data['username'] = '';

            setDataTransfer([...storeData, _data]);
        }

        setLoading(false);
    }

    /** 设置转移数量和用户名 */
    const resetStoreTransfer = (sku, key, value) => {
        setDataTransfer(storeData.map(v => {
            if (v.sku === sku) {
                return {
                    ...v,
                    [key]: value
                };
            }

            return v;
        }));
    }

    /** 库存转移 */
    const storeTranfer = async () => {
        const res = await StoreAction.storeTransfer({store_data: storeData});

        res.code === '' && props.closeAction();
    }

    const columns = [
        {
            title: __('Supply image.'),
            width: 50,
            dataIndex: 'img_src',
            key: 'img_src',
            className: 'align-middle',
            render: (text, record, index) => <Image src={record['img_src']} style={{ width: 60 }} />,
        },
        {
            title: __('Supply name.'),
            width: 160,
            dataIndex: 'name',
            key: 'name',
            className: 'align-middle',
        },
        {
            title: __('Supply options.'),
            width: 100,
            dataIndex: 'item_json',
            key: 'item_json',
            className: 'align-middle',
            render: (text, record, index) => transformItemOption(record.item_json)
        },
        {
            title: __('Number.'),
            width: 60,
            dataIndex: 'transfer_num',
            key: 'transfer_num',
            className: 'align-middle',
            render: (text, record, index) => <InputNumber size="small" min={1} max={record.num} defaultValue={1} style={{ width: 60 }} onChange={(e) => { resetStoreTransfer(record.sku, 'transfer_num', e) }} />,
        },
        {
            title: __('Transferring username.'),
            width: 120,
            dataIndex: 'username',
            key: 'username',
            className: 'align-middle',
            render: (text, record, index) => <Input size="small" style={{ width: 160 }} placeholder={__('Please input username.')} onChange={(e) => { resetStoreTransfer(record.sku, 'username', e.target.value) }} />,
        },
    ];

    return (
        <Spin spinning={loading}>
            <div className="table">
                <Table
                    bordered
                    size="small"
                    columns={columns}
                    dataSource={storeData}
                    rowKey={record => record.id}
                    pagination={false}
                />
                <div className={styles['table-button']}>
                    <Button type="primary" onClick={storeTranfer}>{__('Store transfer.')}</Button>
                </div>
            </div>
        </Spin>
    );
}

export default StoreTransfer;