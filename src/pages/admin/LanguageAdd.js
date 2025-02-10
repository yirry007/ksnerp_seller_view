import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { AdminAction } from '../../actions/AdminAction';
import Loading from '../../components/loading';
import { __ } from '../../utils/functions';

function LanguageAdd(props) {
    const [loading, setLoading] = useState('none');//加载转圈圈

    const onSubmit = async (values) => {
        setLoading('block');

        const res = await AdminAction.languageAdd(values);
        res && props.created(res.result);

        setLoading('none');
    }

    return (
        <Form layout="vertical" onFinish={onSubmit}>
            <Form.Item
                label="KEY"
                name="key"
                rules={[{ required: true, message: 'Please input key' }]}
            >
                <Input placeholder="Please input key" autoComplete="off" />
            </Form.Item>
            <Form.Item
                label="中文简体"
                name="cn"
                rules={[{ required: true, message: '请输入中文简体' }]}
            >
                <Input placeholder="请输入中文简体" autoComplete="off" />
            </Form.Item>
            <Form.Item
                label="日本語"
                name="jp"
                rules={[{ required: true, message: '日本語を入力してください' }]}
            >
                <Input placeholder="日本語を入力してください" autoComplete="off" />
            </Form.Item>
            <Form.Item
                label="English"
                name="en"
                rules={[{ required: true, message: 'Please input english' }]}
            >
                <Input placeholder="Please input english" autoComplete="off" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">{__('submit.')}</Button>
            </Form.Item>

            <Loading loading={loading} />
        </Form>
    );
}

export default LanguageAdd;