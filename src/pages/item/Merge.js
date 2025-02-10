import { Tooltip, Row, Card, Checkbox, Image } from 'antd';
import { useState } from 'react';
import { __ } from '../../utils/functions';

function Merge(props) {
    const [mainItem, setMainItem] = useState();//设置主商品

    const itemTitle = (ksn_code, item_id) => (
        <Row justify="space-between">
            <p>{ksn_code}</p>
            <Tooltip placement="top" title={__('Set merged main.')}>
                <Checkbox
                    value={item_id}
                    checked={item_id === mainItem}
                    onChange={(e)=>{
                        setMainItem(e.target.value);
                        props.setMain(e.target.value);
                    }}
                />
            </Tooltip>
        </Row>
    );

    return (
        <Row gutter={[16, 16]} justify="space-between">
            {props.items.map((v, k)=>(
                <Card
                    key={k}
                    title={itemTitle(v.ksn_code, v.id)}
                    size="small"
                    style={{
                        width: 300,
                    }}
                >
                    <Row wrap={false}>
                        {v.item_image && v.item_image !== ''
                            ? <Image width={50} src={v.item_image} preview={false} />
                            : <Image width={50} src={require('../../assets/img/gift.png')} preview={false} />
                        }
                        <div style={{width: 230, marginLeft: 12}}>{v.item_name}</div>
                    </Row>
                </Card>
            ))}
        </Row>
    );
}

export default Merge;