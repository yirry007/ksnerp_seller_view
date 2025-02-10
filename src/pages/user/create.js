import { Button, Checkbox, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import { UserAction } from '../../actions/UserAction';
import Loading from '../../components/loading';
import { __ } from '../../utils/functions';

function UserCreate(props) {
    const [loading, setLoading] = useState('none');//加载转圈圈
    const [menu, setMenu] = useState([]);//菜单（权限）列表
    const [shops, setShops] = useState([]);//店铺列表

    useEffect(() => {
        getMenu();
        getShops();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取所有菜单（权限） */
    const getMenu = async () => {
        const res = await UserAction.menu();
        res.result && setMenu(res.result);
    }

    /** 获取所有店铺信息 */
    const getShops = async () => {
        const res = await UserAction.shops();
        res.result && setShops(res.result);
    }

    const onSubmit = async (values) => {
        setLoading('block');

        const res = await UserAction.store(values);
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
            <Form.Item name="menu" label={__('Privilege.')}>
                <Checkbox.Group>
                {menu.map(v=>(
                    <Checkbox value={v.id} style={{ lineHeight: '32px' }} key={v.id}>{v.title}</Checkbox>
                ))}
                </Checkbox.Group>
            </Form.Item>
            <Form.Item name="shops" label={__('Shop.')}>
                <Checkbox.Group>
                {shops.map(v=>(
                    <Checkbox value={v.id} style={{ lineHeight: '32px' }} key={v.id}>{v.shop_id}</Checkbox>
                ))}
                </Checkbox.Group>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">{__('submit.')}</Button>
            </Form.Item>

            <Loading loading={loading} />
        </Form>
    );
}

export default UserCreate;