import { Button, Form, Input, Switch } from 'antd';
import { useState } from 'react';
import { AdminAction } from '../../actions/AdminAction';
import Loading from '../../components/loading';
import { __ } from '../../utils/functions';

function AdminEdit(props) {
    const [loading, setLoading] = useState('none');//加载转圈圈
    const [form] = Form.useForm();

    const onSubmit = async (values) => {
        setLoading('block');

        const params = values;
        params['is_use'] = params['is_use'] === undefined || params['is_use'] ? 1 : 0;
        const result = await AdminAction.update(props.admin.user_id, params);
        result.code === '' && props.updated(values);

        setLoading('none');
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={{
                'username': props.admin.username,
                'server_ip': props.admin.server_ip,
                'private_ip': props.admin.private_ip,
                'domain': props.admin.domain,
                'tag': props.admin.tag,
                'is_use': props.admin.is_use_org === 1
            }}
        >
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
            >
                <Input.Password placeholder={__('Leave blank if do not modify.')} />
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
            {props.admin.user_id > 0 &&
                <Form.Item name="is_use" valuePropName="checked">
                    <Switch checkedChildren={__('Enable')} unCheckedChildren={__('Disable')} />
                </Form.Item>
            }
            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">{__('submit.')}</Button>
            </Form.Item>

            <Loading loading={loading} />
        </Form>
    );
}

export default AdminEdit;