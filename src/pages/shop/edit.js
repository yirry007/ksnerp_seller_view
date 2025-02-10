import { Button, Checkbox, Col, DatePicker, Drawer, Form, Input, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import { ShopAction } from '../../actions/ShopAction';
import { markets } from '../../Constants';
import Subject from '../../components/subject';
import SubjectView from '../../components/subject/SubjectView';
import Loading from '../../components/loading';
import dayjs from 'dayjs';
import { __ } from '../../utils/functions';

function ShopEdit(props) {
    const [emailTemplates, setEmailTemplates] = useState([]);//邮件模板
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [proxyOn, setProxyOn] = useState(true);//是否开启 API 请求代理
    const [loading, setLoading] = useState('none');//加载转圈圈
    const [form] = Form.useForm();

    const initValue = { ...props.shop };//表单初始值
    const appKeyExpired = initValue.app_key_expired;//密钥到期时间，用 dayjs 函数单独处理
    delete initValue.app_key_expired;

    useEffect(() => {
        setProxyOn(props.shop.proxy_on === 1);
        getEmailTemplates(props.shop.market);
        getShopEmailTemplates();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取所有邮件模板信息 */
    const getEmailTemplates = async (market) => {
        const res = await ShopAction.emailTemplates(market);
        res.code === '' && setEmailTemplates(res.result);
    }

    /** 获取店铺绑定的邮件模板 */
    const getShopEmailTemplates = async () => {
        const res = await ShopAction.shopEmailTemplates(props.shop.id);
        res.code === '' && form.setFieldsValue({ 'email_templates': res.result });
    }

    /** 打开表单输入项目详细说明 */
    const subjectDetail = async (subject) => {
        setDrawStatus(true);
        setDrawOption({
            title: subject.toUpperCase(),
            width: 480
        });
        setDrawElement(<SubjectView title={subject} />);
    }

    /** 关闭二级抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
    }

    const onSubmit = async (values) => {
        setLoading('block');

        const params = {...values, proxy_on: proxyOn ? 1 : 0};
        params['app_key_expired'] = values.app_key_expired ? values.app_key_expired.format('YYYY-MM-DD') : null;

        const res = await ShopAction.update(props.shop.id, params);
        res.code ==='' && props.updated(values);

        setLoading('none');
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={initValue}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="market"
                        label={__('Shop type.')}
                        rules={[{ required: true, message: __('Please select shop type.') }]}
                    >
                        <Select placeholder={__('Please select shop type.')} onChange={getEmailTemplates}>
                            {markets.map(v => <Select.Option value={v.key} key={v.key}>{v.key + ' / ' + v.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="shop_name"
                        label={__('Shop name.')}
                        rules={[{ required: true, message: __('Please input Shop name.') }]}
                    >
                        <Input placeholder={__('Please input Shop name.')} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="shop_id"
                        label={__('Shop ID.')}
                        rules={[{ required: true, message: __('Please input Shop ID.') }]}
                    >
                        <Input placeholder={__('Please input Shop ID.')} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="shop_pwd"
                        label={__('Shop password.')}
                    >
                        <Input placeholder={__('Please input Shop password(Not required).')} />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item
                name="app_key"
                label={<Subject title="APP_KEY" content={__('Enter the app key according to the platform, click to view details.')} click={() => { subjectDetail('app_key') }} />}
                rules={[{ required: true, message: __('Please input APP KEY.') }]}
            >
                <Input placeholder={__('Please input APP KEY.')} />
            </Form.Item>
            <Form.Item
                name="app_secret"
                label={<Subject title="APP_SECRET" content={__('Please input APP SECRET, click to view details.')} click={() => { subjectDetail('app_secret') }} />}
            >
                <Input placeholder={__('Please input APP SECRET.')} />
            </Form.Item>
            <Form.Item
                name="app_id"
                label={<Subject title="APP_ID" content={__('Some platforms need to enter the app id, click to view details.')} click={() => { subjectDetail('app_id') }} />}
            >
                <Input placeholder={__('Please input APP ID.')} />
            </Form.Item>
            <Form.Item
                name="public_key"
                label={<Subject title="PUBLIC_KEY" content={__('Some platforms need to enter the public key, click to view details.')} click={() => { subjectDetail('public_key') }} />}
            >
                <Input.TextArea autoSize={{ minRows: 5, maxRows: 5 }} placeholder={__('Please input PUBLIC_KEY.')} />
            </Form.Item>
            <Form.Item
                name="authorize_url"
                label={<Subject title={__('Authorize URL.')} content={__('Some platforms need to enter the Authorize URL, click to view details.')} click={() => { subjectDetail('授权URL') }} />}
            >
                <Input placeholder={__('Please input Authorize URL.')} />
            </Form.Item>
            <Form.Item
                name="redirect_url"
                label={<Subject title={__('Redirect URL.')} content={__('Some platforms need to enter the Redirect URL, click to view details.')} click={() => { subjectDetail(__('Redirect URL.')) }} />}
            >
                <Input placeholder={__('Please input Redirect URL.')} />
            </Form.Item>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="key_version"
                        label={__('Yahoo public key version.')}
                    >
                        <Input placeholder={__('Please input Yahoo public key version.')} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="app_key_expired"
                        label={__('APP KEY expired time.')}
                        initialValue={dayjs(appKeyExpired, 'YYYY-MM-DD')}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={6}>
                    <Form.Item
                        label={__('API proxy server.')}
                    >
                        <Checkbox checked={proxyOn} onClick={()=>{setProxyOn(!proxyOn)}}>
                        {__('Proxy server on.')}
                        </Checkbox>
                    </Form.Item>
                </Col>
                <Col span={18}>
                    <Form.Item
                        name="proxy_ip"
                        label={__('Proxy server ip:port.')}
                    >
                        <Input placeholder={__('Please input Proxy server ip and port.')} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="proxy_username"
                        label={__('Proxy server username.')}
                    >
                        <Input placeholder={__('Please input Proxy server username(Not required).')} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="proxy_password"
                        label={__('Proxy server password.')}
                    >
                        <Input placeholder={__('Please input Proxy server password(Not required).')} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="smtp_address"
                        label={__('SMTP server address:port.')}
                    >
                        <Input placeholder={__('Please input SMTP server address:port.')} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="smtp_username"
                        label={__('SMTP username.')}
                    >
                        <Input placeholder={__('Please input SMTP username.')} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="smtp_password"
                        label={__('SMTP password.')}
                    >
                        <Input placeholder={__('Please input SMTP password.')} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="smtp_email"
                        label={__('SMTP email address.')}
                    >
                        <Input placeholder={__('Please input SMTP email address.')} />
                    </Form.Item>
                </Col>
            </Row>
            {emailTemplates.length > 0 &&
                <Form.Item name="email_templates" label={__('Email template.')}>
                    <Checkbox.Group>
                    {emailTemplates.map(v=>(
                        <Checkbox value={`${v.id}`} style={{ lineHeight: '32px' }} key={v.id}>{v.title}</Checkbox>
                    ))}
                    </Checkbox.Group>
                </Form.Item>
            }
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="ftp_address"
                        label={__('FTP server address.')}
                    >
                        <Input placeholder={__('Please input FTP server address.')} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="ftp_username"
                        label={__('FTP server username.')}
                    >
                        <Input placeholder={__('Please input FTP server username.')} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="ftp_password"
                        label={__('FTP server password.')}
                    >
                        <Input placeholder={__('Please input FTP server password.')} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="ftp_directory"
                        label={__('FTP server directory.')}
                    >
                        <Input placeholder={__('Please input FTP server directory.')} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="sender_address"
                        label={__('Sender address.')}
                    >
                        <Input placeholder={__('Please input Sender address.')} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="sender_phone"
                        label={__('Sender phone.')}
                    >
                        <Input placeholder={__('Please input Sender phone.')} />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">{__('submit.')}</Button>
            </Form.Item>

            <Drawer title={drawOption.title} width={drawOption.width} onClose={closeDraw} open={drawStatus}>{drawElement}</Drawer>

            <Loading loading={loading} />
        </Form>
    );
}

export default ShopEdit;