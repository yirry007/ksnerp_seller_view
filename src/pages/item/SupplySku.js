import { Space, Spin, Tag, Typography, message } from "antd";
import styles from "./item.module.scss";
import { useEffect, useState } from "react";
import Search from "antd/es/input/Search";
import { SupplierAction } from "../../actions/SupplierAction";
import { StoreAction } from "../../actions/StoreAction";
import { __, analysisSupplyUrl } from "../../utils/functions";

function SupplySku(props) {
    const [loading, setLoading] = useState(false);//加载转圈圈
    const [supplySku, setSupplySku] = useState(() => props.supplyData.sku || []);
    const [mainInfo, setMainInfo] = useState(() => props.supplyData.mainInfo || {});
    const [searchUrl, setSearchUrl] = useState(() => {
        let _url;

        if (props.supplyData.mainInfo && props.supplyData.mainInfo.supply_url)
            _url = props.supplyData.mainInfo.supply_url;
        else if (props.supplyData.searchUrl)
            _url = props.supplyData.searchUrl;
        else
            _url = '';

        return _url;
    });
    const [selectedSpecId, setSelectedSpecId] = useState();

    const { Paragraph } = Typography;

    useEffect(() => {
        if (props.supplyData.searchUrl) {
            searchSupplyItemByUrl();
        }
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 根据商品url搜索采购商品 */
    const searchSupplyItemByUrl = async () => {
        if (!searchUrl) {
            message.error(__('Please input sourcing item url.'));
            return false;
        }

        const itemInfo = analysisSupplyUrl(searchUrl);

        /** 没有解析到采购平台和商品id */
        if (!itemInfo.market || !itemInfo.itemId) {
            message.error(__('Invalid item url.'));
            return false;
        }

        setLoading(true);

        let res;
        if (itemInfo.market === 'store') {
            res = await StoreAction.getGoodsItems(itemInfo.itemId);
        } else {
            res = await SupplierAction.supplierItem(itemInfo.itemId, itemInfo.market);
        }

        if (res) {
            const result = res.result;
            const _supply = {};
            _supply['supply_url'] = searchUrl;
            _supply['supply_image'] = result['images'][0];
            _supply['supply_code'] = result['item_id'];
            _supply['supply_opt'] = '';
            _supply['supply_market'] = itemInfo.marketAlias;
            _supply['supply_name'] = result['title'];
            _supply['supply_options'] = '';
            _supply['min_quantity'] = result['min_buy'];

            if (props.supplyData.supply_id)
                _supply['supply_id'] = props.supplyData.supply_id;

            setMainInfo(_supply);
            setSupplySku(result['sku']);
        }

        setLoading(false);
    }

    return (
        <Spin spinning={loading}>
            <div className={styles['supply-sku']}>
                <Search
                    value={searchUrl}
                    placeholder={__('Please input sourcing item url.')}
                    onChange={(e) => setSearchUrl(e.target.value)}
                    onSearch={searchSupplyItemByUrl}
                    style={{
                        width: '100%',
                        marginBottom: 10
                    }}
                />
                <ul>
                    {supplySku.map(v => {
                        let sku = '';
                        v.data.forEach((v1, k1) => {
                            if (k1 > 0) sku += ' ; '

                            const objKey = Object.keys(v1)[0];
                            sku += objKey + ':' + v1[objKey];
                        });

                        return (
                            <li key={v.spec_id} className={v.spec_id === selectedSpecId ? styles['active'] : ''}>
                                <img src={v.sku_image ? v.sku_image : require('../../assets/img/gift.png')} alt="" />
                                <section>
                                    <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 13, marginBottom: 4, color: 'rgba(0,0,0,0.65)' }} title={sku}>{sku}</Paragraph>
                                    <div className={styles['sku-sel']}>
                                        <p>{v.price > 0 ? `￥${v.price}` : '--'}</p>
                                        <Space size={0}>
                                            <Tag color="success" className="pointer" onClick={() => { props.selectSku(mainInfo, v); setSelectedSpecId(v.spec_id); }}>{__('Select.')}</Tag>
                                        </Space>
                                    </div>
                                </section>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Spin>
    );
}

export default SupplySku;