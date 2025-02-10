import { Input, Button, Table, Drawer } from 'antd';
import { useEffect, useState } from 'react';
import { AdminAction } from '../../actions/AdminAction';
import Title from '../../components/Title';
import Loading from '../../components/loading';
import { __ } from '../../utils/functions';
import LanguageAdd from './LanguageAdd';

function Languages(props) {
    const [languageData, setLanguageData] = useState([]);//语言包数据
    const [updateData, setUpdateData] = useState([]);
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [loading, setLoading] = useState('block');//加载转圈圈

    useEffect(() => {
        getLanguageData();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取语言包数据 */
    const getLanguageData = async () => {
        setLoading('block');

        const res = await AdminAction.getLanguageData();
        setLanguageData(res.result);

        setLoading('none');
    }

    /** 重新设置语言包数据 */
    const resetLanguage = (code, key, value) => {
        const _data = [];
        updateData.forEach(v => {
            if (v.code !== code || v.key !== key) {
                _data.push(v)
            }
        });

        if (value && value !== '') {
            _data.push({code, key, value});
        }

        setUpdateData(_data);
    }
    
    /** 更新语言包 */
    const updateLanguageData = async () => {
        setLoading('block');

        const res = await AdminAction.updateLanguageData({update_data: updateData});
        res && window.location.reload();

        setLoading('none');
    }

    /** 新增语言项目表单弹出 */
    const languageAdd = () => {
        setDrawStatus(true);
        setDrawOption({
            title: '新增语言项目',
            width: 360
        });
        setDrawElement(<LanguageAdd created={requestFinish} />);
    }

    /** 新增，更新数据后关闭抽屉，重新获取列表数据 */
    const requestFinish = () => {
        closeDraw();
        window.location.reload();
    }

    /** 关闭抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
    }

    /** 表格项目 */
    const columns = [
        {
            title: '标识符',
            width: 200,
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: '中文简体',
            width: 200,
            dataIndex: 'cn',
            key: 'cn',
            render: (text, record, index) => (
                <Input defaultValue={record.cn} onBlur={(e) => resetLanguage('cn', record.key, e.target.value)} />
            ),
        },
        {
            title: '日本語',
            width: 200,
            dataIndex: 'jp',
            key: 'jp',
            render: (text, record, index) => (
                <Input defaultValue={record.jp} onBlur={(e) => resetLanguage('jp', record.key, e.target.value)} />
            ),
        },
        {
            title: 'English',
            width: 200,
            dataIndex: 'en',
            key: 'en',
            render: (text, record, index) => (
                <Input defaultValue={record.en} onBlur={(e) => resetLanguage('en', record.key, e.target.value)} />
            ),
        }
    ];

    return (
        <div className="P-Content">
            <Title />
            <div className="content">
                <div className="table">
                    <Table
                        bordered
                        size="small"
                        columns={columns}
                        dataSource={languageData}
                        pagination={false}
                        scroll={{ x: 1500, y: 516 }}
                    />
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '24px'}}>
                    <Button type="primary" onClick={languageAdd}>{__('Add New')}</Button>
                    <Button type="primary" onClick={updateLanguageData}>{__('submit.')}</Button>
                </div>
            </div>

            <Drawer
                title={drawOption.title}
                width={drawOption.width}
                maskClosable={false}
                onClose={closeDraw}
                open={drawStatus}
            >{drawElement}</Drawer>

            <Loading loading={loading} />
        </div>
    );
}

export default Languages;