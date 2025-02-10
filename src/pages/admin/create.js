import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { AdminAction } from '../../actions/AdminAction';
import Loading from '../../components/loading';
import { __ } from '../../utils/functions';

function AdminCreate(props) {
    const [loading, setLoading] = useState('none');//加载转圈圈

    const onSubmit = async (values) => {
        setLoading('block');

        const res = await AdminAction.store(values);
        res && props.created(res.result);

        setLoading('none');
    }

    return (
        <Form layout="vertical" onFinish={onSubmit}>
            <Form.Item
                label={__('username.')}
                name="username"
                rules={[{ required: true, message: __('Please input username.') }]}
            >
                <Input placeholder={__('Please input username.')} autoComplete="off" />
            </Form.Item>
            <Form.Item
                label={__('password.')}
                name="password"
                rules={[{ required: true, message: __('Please input password.') }]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item
                label={__('public IP address.')}
                name="server_ip"
                rules={[{ required: true, message: __('Please input public IP address.') }]}
            >
                <Input placeholder={__('Please input public IP address.')} autoComplete="off" />
            </Form.Item>
            <Form.Item
                label={__('private IP address.')}
                name="private_ip"
                rules={[{ required: true, message: __('Please input private IP address.') }]}
            >
                <Input placeholder={__('Please input private IP address.')} autoComplete="off" />
            </Form.Item>
            <Form.Item
                label={__('domain.')}
                name="domain"
            >
                <Input placeholder={__('Please input domain.')} autoComplete="off" />
            </Form.Item>
            <Form.Item
                label={__('lightsail tag.')}
                name="tag"
            >
                <Input placeholder={__('Please input lightsail tag.')} autoComplete="off" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">{__('submit.')}</Button>
            </Form.Item>

            <Loading loading={loading} />
        </Form>
    );
}

export default AdminCreate;