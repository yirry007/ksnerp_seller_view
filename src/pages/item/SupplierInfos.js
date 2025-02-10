import { Button, Col, Modal, Row } from "antd";
import Title from "../../components/Title";
import styles from './item.module.scss';
import { useEffect, useState } from "react";
import { SupplierAction } from "../../actions/SupplierAction";
import Loading from "../../components/loading";
import SupplierAccountAuth from "./SupplierAccountAuth";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { __ } from "../../utils/functions";

function SupplierInfos(props) {
    const [suppliers, setSuppliers] = useState({});
    const [loading, setLoading] = useState('none');//加载转圈圈
    const [supplierAccountAuthModal, setSupplierAccountAuthModal] = useState(false);//供应商账号授权弹窗开启状态
    const [supplierAccountAuthView, setSupplierAccountAuthView] = useState(null);//供应商账号授权弹窗组件

    const { confirm } = Modal;

    useEffect(() => {
        getSupplierInfos();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取采购平台授权信息 */
    const getSupplierInfos = async () => {
        setLoading('block');

        const res = await SupplierAction.supplierInfo();

        if (res.code === '') {
            const _suppliers = {};

            const authAlibaba = res.result.Alibaba;
            if (authAlibaba && authAlibaba.token) {
                _suppliers['Alibaba'] = authAlibaba;
            }

            const authKsnshop = res.result.Ksnshop;
            if (authKsnshop && authKsnshop.token) {
                _suppliers['Ksnshop'] = authKsnshop;
            }

            setSuppliers(_suppliers);
        }

        setLoading('none');
    }

    /** 采购平台授权 */
    const supplierAuth = async (market) => {
        setLoading('block');

        const res = await SupplierAction.supplierEncrypted(market);
        const authUrl = 'https://api.kesunuo.com';

        if (res.code === 'E301') {
            window.open(authUrl + '/auth/' + res.result);
        }

        setLoading('none');
    }

    /** 开启供应商账号授权导出弹窗 */
    const openSupplierAccountAuthModal = (market) => {
        setSupplierAccountAuthView(<SupplierAccountAuth market={market} closeModal={() => {closeSupplierAccountAuthModal(true)}} />);
        setSupplierAccountAuthModal(true);
    }

    /** 关闭供应商账号授权导出弹窗 */
    const closeSupplierAccountAuthModal = (is_success = false) => {
        setSupplierAccountAuthModal(false);
        setSupplierAccountAuthView(null);
        is_success && getSupplierInfos();
    }

    /** 取消授权 */
    const supplyCancelAuth = (market) => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            title: __('Confirm to delete the auth.'),
            content: __('The goods information can not obtain the platform and cannot use the order function of order to generate orders.'),
            okText: __('Confirm.'),
            cancelText: __('Cancel.'),
            onOk: async () => {
                const res = await SupplierAction.supplierCancelAuth({ market });
                /** 订单改为保留或还原后重新获取当前页的订单数据 */
                res && getSupplierInfos();
            }
        });
    }

    return (
        <div className="P-Content">
            <Title />
            <div className="content">
                <Row gutter={[12, 20]} style={{ marginBottom: 30 }}>
                    <Col span={4}>
                        <div className={styles['supplier-card']}>
                            <h2>
                                <img src={require('../../assets/img/1688.png')} alt="" />
                            </h2>
                            <ul>
                                <li>
                                    <strong>{__('Auth status.')}</strong>
                                    <b className={suppliers.Alibaba ? styles['success'] : styles['error']}>
                                        {suppliers.Alibaba ? __('Authorized.') : __('Not Authorized.')}
                                    </b>
                                </li>
                                <li>
                                    <strong>{__('Authorized account.')}</strong>
                                    <em>{suppliers.Alibaba ? suppliers.Alibaba.account : '-'}</em>
                                </li>
                                <li>
                                    <strong>{__('Shop ID.')}</strong>
                                    <em>{suppliers.Alibaba ? suppliers.Alibaba.market_id : '-'}</em>
                                </li>
                                <li>
                                    <strong>{__('Authorized time.')}</strong>
                                    <em>{suppliers.Alibaba ? suppliers.Alibaba.create_time : '-'}</em>
                                </li>
                                <li>
                                    <strong>{__('Last updated.')}</strong>
                                    <em>{suppliers.Alibaba ? suppliers.Alibaba.update_time : '-'}</em>
                                </li>
                            </ul>
                            <Button
                                type="primary"
                                block
                                onClick={() => { supplierAuth('alibaba') }}
                            >{__('Click to auth.')}</Button>
                            <Button
                                type="dashed"
                                danger
                                style={{marginTop: '10px'}}
                                block
                                onClick={() => {supplyCancelAuth('alibaba')}}
                            >{__('Cancel auth.')}</Button>
                        </div>
                    </Col>

                    <Col span={4}>
                        <div className={styles['supplier-card']}>
                            <h2>
                                <img src={require('../../assets/img/crmeb.png')} alt="" />
                            </h2>
                            <ul>
                                <li>
                                    <strong>{__('Auth status.')}</strong>
                                    <b className={suppliers.Ksnshop ? styles['success'] : styles['error']}>
                                        {suppliers.Ksnshop ? __('Authorized.') : __('Not Authorized.')}
                                    </b>
                                </li>
                                <li>
                                    <strong>{__('Authorized account.')}</strong>
                                    <em>{suppliers.Ksnshop ? suppliers.Ksnshop.account : '-'}</em>
                                </li>
                                <li>
                                    <strong>{__('Shop ID.')}</strong>
                                    <em>{suppliers.Ksnshop ? suppliers.Ksnshop.market_id : '-'}</em>
                                </li>
                                <li>
                                    <strong>{__('Authorized time.')}</strong>
                                    <em>{suppliers.Ksnshop ? suppliers.Ksnshop.create_time : '-'}</em>
                                </li>
                                <li>
                                    <strong>{__('Last updated.')}</strong>
                                    <em>{suppliers.Ksnshop ? suppliers.Ksnshop.update_time : '-'}</em>
                                </li>
                            </ul>
                            <Button
                                type="primary"
                                block
                                onClick={() => {openSupplierAccountAuthModal('ksnshop')}}
                            >{__('Click to auth.')}</Button>
                            <Button
                                type="dashed"
                                danger
                                style={{marginTop: '10px'}}
                                block
                                onClick={() => {supplyCancelAuth('ksnshop')}}
                            >{__('Cancel auth.')}</Button>
                        </div>
                    </Col>
                </Row>
            </div>
            <Loading loading={loading} />

            <Modal
                open={supplierAccountAuthModal}
                width={500}
                onCancel={closeSupplierAccountAuthModal}
                closeIcon={null}
                footer={[]}
                forceRender
            >
                {supplierAccountAuthView}
            </Modal>
        </div>
    );
}

export default SupplierInfos;