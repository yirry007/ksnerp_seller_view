import { Button, Select, Spin, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { OrderAction } from "../../actions/OrderAction";
import styles from './order.module.scss';
import { __ } from "../../utils/functions";

function EmailSendLog(props) {
    const [emailLogs, setEmailLogs] = useState([]);
    const [emailTemplates, setEmailTemplates] = useState([]);
    const [spinLoading, setSpinLoading] = useState(true);
    const [emailTemplateId, setEmailTemplateId] = useState(0);
    const [sendLoading, setSendLoading] = useState(false);
    const [sendText, setSendText] = useState(__('Resend.'));

    useEffect(() => {
        emailSendLogsWithTemplates(props.order_id, props.type);
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取邮件发送日志 */
    const emailSendLogsWithTemplates = async (order_id, type) => {
        const res = await OrderAction.emailSendLogsWithTemplates(order_id, type);

        if (res.code === '') {
            setEmailLogs(res.result.logs.map((v, k) => (
                {
                    key: v.id,
                    number: k + 1,
                    template_type: v.template_type === 0 ? __('Thanks mail.') : __('Shipping mail.'),
                    smtp_address: v.smtp_address,
                    smtp_username: v.smtp_username,
                    smtp_email: v.smtp_email,
                    to: v.to,
                    subject: v.subject,
                    is_success: v.is_success === 1 ? (<Tag color="success">{__('Send successfully.')}</Tag>) : (<Tag color="error">{__('Send failed.')}</Tag>),
                    create_time: v.create_time,
                }
            )));

            setEmailTemplates(res.result.email_templates.map((v) => (
                {
                    value: v.id,
                    label: v.title
                }
            )))
        }

        setSpinLoading(false);
    }

    /** 重新发送邮件 */
    const resendEmail = async () => {
        setSendLoading(true);
        setSendText(__('Sending.'));

        /** 发送邮件 */
        await OrderAction.resendEmail(props.order_id, emailTemplateId);

        /** 发送后重新获取邮件发送日志 */
        setSpinLoading(true);
        await emailSendLogsWithTemplates(props.order_id, props.type);

        setSendLoading(false);
        setSendText(__('Resend.'));
    }

    /** 表格项目 */
    const columns = [
        {
            title: 'No.',
            width: 50,
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: __('Email type.'),
            width: 100,
            dataIndex: 'template_type',
            key: 'template_type',
        },
        {
            title: __('SMTP address.'),
            width: 120,
            dataIndex: 'smtp_address',
            key: 'smtp_address',
        },
        {
            title: __('SMTP username.'),
            width: 150,
            dataIndex: 'smtp_username',
            key: 'smtp_username',
        },
        {
            title: __('SMTP Email address.'),
            width: 150,
            dataIndex: 'smtp_email',
            key: 'smtp_email',
        },
        {
            title: __('Recipient.'),
            width: 150,
            dataIndex: 'to',
            key: 'to',
        },
        {
            title: __('Template title.'),
            width: 150,
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: __('Send status.'),
            width: 80,
            dataIndex: 'is_success',
            key: 'is_success',
        },
        {
            title: __('Send time.'),
            width: 120,
            dataIndex: 'create_time',
            key: 'create_time',
        }
    ];

    return (
        <Spin spinning={spinLoading}>
            <div className={styles['email-log-title']}>
                <h3>{props.title}</h3>
                <section>
                    <Select
                        placeholder={__('Please select email template.')}
                        style={{width: 240, marginRight: 10}}
                        onChange={v=>setEmailTemplateId(v)}
                        options={emailTemplates}
                    />
                    <Button type="default" style={{ backgroundColor: '#52c41a', color: '#ffffff', borderColor: '#52c41a' }} loading={sendLoading} onClick={resendEmail}>{sendText}</Button>
                </section>
            </div>
            <Table
                bordered
                size="small"
                columns={columns}
                dataSource={emailLogs}
                pagination={false}
            />
        </Spin>
    );
}

export default EmailSendLog;