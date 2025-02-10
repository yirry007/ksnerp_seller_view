import { Button, Image, Input, Spin, Table, Tooltip } from "antd";
import { useEffect, useState } from "react";
import styles from './store.module.scss';
import { StoreAction } from "../../actions/StoreAction";
import { __, timeFormat, transformItemOption } from "../../utils/functions";

function StoreInLog(props) {
    const [storeInLogs, setStoreInLogs] = useState([]);
    const [logCount, setLogCount] = useState(0);//日志总数量
    const [pageSize, setPageSize] = useState(10);//每页显示数量
    const [currentPage, setCurrentPage] = useState(1);//标记当前页
    const [searchParam, setSearchParam] = useState({});//列表搜索参数
    const [spinLoading, setSpinLoading] = useState(true);

    useEffect(() => {
        getStoreInLogs(1);
    }, [pageSize]);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取邮件发送日志 */
    const getStoreInLogs = async (page = currentPage, page_size = pageSize) => {
        setSpinLoading(true);

        const res = await StoreAction.getStoreInLogs(searchParam, page, page_size);

        if (res.code === '') {
            setLogCount(res.result.count);
            setStoreInLogs(res.result.logs);
        }

        setSpinLoading(false);
    }

    /** 设置列表搜索参数 */
    const setSearch = (key, value) => {
        setSearchParam({
            ...searchParam,
            [key]: value
        });
    }

    /** 状态映射表 */
    const statusMap = {
        0: __('Ready to do.'),
        1: __('Store in finish.'),
        2: __('Store in cancelled.'),
    };

    /** 表格项目 */
    const columns = [
        {
            title: __('SKU image.'),
            width: 80,
            dataIndex: 'img_src',
            key: 'img_src',
            render: (text, record, index) => <Image src={record['img_src']} style={{ width: 50 }} />,
        },
        {
            title: __('Supply name.'),
            width: 120,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: __('KSNCODE.'),
            width: 150,
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: __('SKU value.'),
            width: 200,
            dataIndex: 'item_specifications',
            key: 'item_specifications',
            render: (text, record, index) => transformItemOption(record.item_specifications)
        },
        {
            title: __('Number.'),
            width: 60,
            dataIndex: 'num',
            key: 'num',
        },
        {
            title: __('SKU price.'),
            width: 100,
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: __('Add time.'),
            width: 160,
            dataIndex: 'addtime',
            key: 'addtime',
            render: (text, record, index) => timeFormat(record['addtime']),
        },
        {
            title: __('Store in status.'),
            width: 120,
            dataIndex: 'statu',
            key: 'statu',
            render: (text, record, index) => (
                <Tooltip placement="top" title={`${__('ERP memo.')}：${record['user_explain']}; ${__('Logistic memo.')}：${record['logistics_explain']}`}>{statusMap[record['statu']]}</Tooltip>
            )
        }
    ];

    return (
        <Spin spinning={spinLoading}>
            <div className={styles['store-log-title']}>
                <h3>{__('Store items Request in logs.')}</h3>
                <section>
                    <Input placeholder={`${__('Supply name.')}|${__('KSNCODE.')}`} className="input" value={searchParam['keyword']} onChange={(e) => { setSearch('keyword', e.target.value) }} />
                    <Button type="default" style={{ backgroundColor: '#52c41a', color: '#ffffff', borderColor: '#52c41a', marginLeft: 10 }} onClick={() => { getStoreInLogs(1) }}>{__('Search.')}</Button>
                </section>
            </div>
            <Table
                bordered
                size="small"
                columns={columns}
                dataSource={storeInLogs}
                rowKey={record => record.id}
                pagination={{
                    total: logCount,
                    defaultPageSize: pageSize,
                    current: currentPage,
                    showSizeChanger: true,
                    onChange: (page) => {
                        setCurrentPage(page);
                        getStoreInLogs(page);
                    },
                    onShowSizeChange: (current, size) => {
                        setCurrentPage(1);
                        setPageSize(size);
                    }
                }}
            />
        </Spin>
    );
}

export default StoreInLog;