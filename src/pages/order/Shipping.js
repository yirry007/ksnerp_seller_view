import { useEffect, useState } from "react";
import { OrderAction } from "../../actions/OrderAction";
import { Empty, Spin, Steps } from "antd";

function Shipping(props) {
    const [loading, setLoading] = useState(true);//加载转圈圈
    const [shippingData, setShippingData] = useState([]);

    useEffect(() => {
        getShippingInfo();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const getShippingInfo = async () => {
        const res = await OrderAction.shippingInfo(props.orderItemId);

        if (res.code === '') {
            if (res.result.shipping_company === 'Sagawa') {
                const _shippingData = res.result.info['詳細表示'];
                setShippingData(_shippingData.split('↑'));

            } else if (res.result.shipping_company === 'Yamato') {
                setShippingData(Object.keys(res.result.info).map(v => res.result.info[v] + ' ' + v));

            } else if (res.result.shipping_company === 'JapanPost') {
                setShippingData(res.result.info);
            }
        }

        setLoading(false);
    }

    return (
        <Spin spinning={loading}>
            {shippingData.length > 0
                ? <Steps
                    progressDot
                    current={0}
                    direction="vertical"
                    items={shippingData.map(v => (
                        {
                            title: (
                                <div style={{ fontSize: 15, color: '#434343' }}>{v}</div>
                            )
                        }
                    ))}
                />
                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 0 }} />
            }
        </Spin>
        
    );
}

export default Shipping;