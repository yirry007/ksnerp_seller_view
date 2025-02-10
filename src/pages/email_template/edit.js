import { Button, Col, Form, Input, Row, Select, Space, Tag, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { emailAddableField, markets, toolbar } from '../../Constants';
import Loading from '../../components/loading';
import { EmailTemplateAction } from '../../actions/EmailTemplateAction';
import ReactQuill from 'react-quill';
import { __ } from '../../utils/functions';

function EmailTemplateEdit(props) {
    const [loading, setLoading] = useState('none');//加载转圈圈
    const [content, setContent] = useState(props.template.content);
    const [quillFocusPosition, setQuillFocusPosition] = useState(0);
    const [form] = Form.useForm();

    const initValue = props.template;//表单初始值

    let quill = useRef(null);

    /** 富文本编辑器光标位置插入变量 */
    const insertOrderInfo = (info) => {
        /** 指定位置插入文本 */
        quill.getEditor().insertText(quillFocusPosition, info);
        /** 重置编辑器中光标位置索引 */
        setQuillFocusPosition(quillFocusPosition + info.length);
    }

    const onSubmit = async (values) => {
        setLoading('block');

        values['content'] = content;
        const res = await EmailTemplateAction.update(props.template.id, values);
        res && props.updated();

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
                        <Select placeholder={__('Please select shop type.')}>
                            {markets.map(v => <Select.Option value={v.key} key={v.key}>{v.key + ' / ' + v.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="type"
                        label={__('Template type.')}
                        rules={[{ required: true, message: __('Please select template type.') }]}
                    >
                        <Select placeholder={__('Please select template type.')}>
                            <Select.Option value="0">{__('Order Confirm.')}</Select.Option>
                            <Select.Option value="4">{__('Shipping notice.')}</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item
                name="title"
                label={__('Template title.')}
                rules={[{ required: true, message: __('Please input template title.') }]}
            >
                <Input placeholder={__('Please input template title.')} />
            </Form.Item>
            <Row gutter={16}>
                <Col span={6}>
                    <Space wrap>
                        {emailAddableField.map((v, k)=>(
                            <Tooltip placement="top" title={`${v.name}: ${v.key}`} onClick={()=>{insertOrderInfo(v.key)}} key={k}>
                                <Tag className="pointer">{v.name}</Tag>
                            </Tooltip>
                        ))}
                    </Space>
                </Col>
                <Col span={18}>
                    <ReactQuill ref={el=>quill=el} modules={{
                        toolbar: toolbar
                    }} theme="snow" value={content} onChange={setContent} onBlur={(e)=>{setQuillFocusPosition(e.index)}} />
                </Col>
            </Row>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">{__('submit')}</Button>
            </Form.Item>

            <Loading loading={loading} />
        </Form>
    );
}

export default EmailTemplateEdit;