import { Button, Input, Spin } from 'antd';
import { useState } from 'react';
import { SupplierAction } from '../../actions/SupplierAction';
import { __ } from '../../utils/functions';


function SupplierAccountAuth(props) {
    const [account, setAccount] = useState([]);//用户名
    const [pwd, setPwd] = useState({});//密码
    const [loading, setLoading] = useState(false);

    /** 供应商账号密码授权 */
    const supplierAccountAuth = async () => {
        setLoading(true);

        const res = await SupplierAction.supplierAccountAuth({market: props.market, account, pwd});

        if (res) {
            props.closeModal();
        }

        setLoading(false);
    }

    return (
        <Spin spinning={loading}>
            <div className="supplier-auth">
                <h2>{__('Supplier Auth.')}</h2>
                <section>
                    <em>{__('username.')}</em>
                    <Input placeholder={__('Please input username.')} onChange={(e) => {setAccount(e.target.value)}} />
                </section>
                <section>
                    <em>{__('password.')}</em>
                    <Input.Password placeholder={__('Please input password.')} onChange={(e) => {setPwd(e.target.value)}} />
                </section>
                <div className="supplier-opt">
                    <Button type="primary" onClick={supplierAccountAuth}>{__('Authorize.')}</Button>
                </div>
            </div>
        </Spin>
    );
}

export default SupplierAccountAuth;