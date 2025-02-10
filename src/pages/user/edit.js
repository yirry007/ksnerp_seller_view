import { Button, Checkbox, Form, Input, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { UserAction } from '../../actions/UserAction';
import Loading from '../../components/loading';
import { __ } from '../../utils/functions';

function UserEdit(props) {
    const [loading, setLoading] = useState('none');//加载转圈圈
    const [menu, setMenu] = useState([]);//菜单（权限）列表
    const [shops, setShops] = useState([]);//店铺列表
    const [form] = Form.useForm();

    useEffect(() => {
        if (props.user.parent_id > 0) {//管理员以外的普通用户需要菜单（权限）数据
            getMenu();
            getUserMenu();

            getShops();
            getUserShops();
        }
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取所有菜单（权限） */
    const getMenu = async () => {
        const res = await UserAction.menu();
        res.code === '' && setMenu(res.result);
    }

    /** 获取用户所拥有的菜单（权限） */
    const getUserMenu = async () => {
        const res = await UserAction.userMenu(props.user.user_id);
        res.code === '' && form.setFieldsValue({ 'menu': res.result });
    }

    /** 获取所有店铺信息 */
    const getShops = async () => {
        const res = await UserAction.shops();
        res.code === '' && setShops(res.result);
    }

    /** 获取用户可操作的店铺 */
    const getUserShops = async () => {
        const res = await UserAction.userShops(props.user.user_id);
        res.code === '' && form.setFieldsValue({ 'shops': res.result });
    }

    const onSubmit = async (values) => {
        setLoading('block');

        const params = values;
        params['is_use'] = params['is_use'] === undefined || params['is_use'] ? 1 : 0;
        const result = await UserAction.update(props.user.user_id, params);
        result.code === '' && props.updated(values);

        setLoading('none');
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={{
                'username': props.user.username,
                'is_use': props.user.is_use_org === 1
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
            {props.user.parent_id > 0 &&
                <Form.Item name="menu" label={__('Privilege.')}>
                    <Checkbox.Group>
                        {menu.map(v => (
                            <Checkbox value={`${v.id}`} style={{ lineHeight: '32px' }} key={v.id}>{v.title}</Checkbox>
                        ))}
                    </Checkbox.Group>
                </Form.Item>
            }
            {props.user.parent_id > 0 &&
                <Form.Item name="shops" label={__('Shop.')}>
                    <Checkbox.Group>
                        {shops.map(v => (
                            <Checkbox value={`${v.id}`} style={{ lineHeight: '32px' }} key={v.id}>{v.shop_id}</Checkbox>
                        ))}
                    </Checkbox.Group>
                </Form.Item>
            }
            {props.user.parent_id > 0 &&
                <Form.Item name="is_use" valuePropName="checked">
                    <Switch checkedChildren={__('Enable.')} unCheckedChildren={__('Disable.')} />
                </Form.Item>
            }
            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">{__('submit.')}</Button>
            </Form.Item>

            <Loading loading={loading} />
        </Form>
    );
}

export default UserEdit;