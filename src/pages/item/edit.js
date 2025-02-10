import { Avatar, Button, Descriptions, Divider, Drawer, Image, Input, InputNumber, List, Select, Space, Spin, Table, Tag, Tooltip, Typography, Upload, message } from 'antd';
import { UploadOutlined, SearchOutlined, EllipsisOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { shippingOption, supplyMarkets } from '../../Constants';
import { ItemAction } from '../../actions/ItemAction';
import { __, addComma, analysisSupplyUrl, transformItemOption } from '../../utils/functions';
import styles from './item.module.scss';
import { SupplierAction } from '../../actions/SupplierAction';
import SupplySku from './SupplySku';
import Search from 'antd/es/input/Search';
import { StoreAction } from '../../actions/StoreAction';

function ItemEdit(props) {
    const [loading, setLoading] = useState(false);//加载转圈圈
    const [item, setItem] = useState({});//商品资料数据
    const [supply, setSupply] = useState({});//采购商品数据
    const [recSupply, setRecSupply] = useState([]);//可选推荐采购商品
    const [logistics, setLogistics] = useState([]);//物流商列表
    const [logisticId, setLogisticId] = useState(0);//已被选中的物流商id
    const [itemData, setItemData] = useState([]);//商品资料渲染json
    const [supplyData, setSupplyData] = useState([]);//采购商品渲染json
    const [supplyMore, setSupplyMore] = useState([]);//附加采购商品
    const [logisticData, setLogisticData] = useState([]);//物流商渲染列表
    const [drawStatus, setDrawStatus] = useState(false);//抽屉弹出状态
    const [drawOption, setDrawOption] = useState({});//抽屉配置选项
    const [drawElement, setDrawElement] = useState();//抽屉表单内容
    const [supplySku, setSupplySku] = useState([]);//采购商品sku

    const { Paragraph } = Typography;

    const itemStatusIcons = {
        0: <Tag color="default">{__('Init.')}</Tag>,
        1: <Tag color="processing">{__('Not edited.')}</Tag>,
        2: <Tag color="success">{__('Edited.')}</Tag>,
        3: <Tag color="cyan">{__('Merged.')}</Tag>,
        4: <Tag color="warning">{__('Reserved.')}</Tag>,
    };

    useEffect(() => {
        getItem();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 设置商品基本资料显示数据 */
    useEffect(() => {
        setItemData([
            {
                key: 'item_name',
                label: __('Item name.'),
                children: item.item_name,
                span: 2
            },
            {
                key:'item_image_view',
                label: __('Item image.'),
                children: itemImage(item.item_image),
                labelStyle: { width: 80, verticalAlign: 'top' },
                contentStyle: { width: 200, height: 200, verticalAlign: 'middle', textAlign: 'center' }
            },
            {
                key: 'item_image',
                label: __('Image info.'),
                children: itemImageEditor(),
                labelStyle: { width: 80, verticalAlign: 'top' },
                contentStyle: { width: 200, verticalAlign: 'top' }
            },
            {
                key: 'market',
                label: __('Shop type.'),
                children: item.market
            },
            {
                key: 'item_id',
                label: __('Item ID.'),
                children: item.item_id
            },
            {
                key: 'ksn_code',
                label: __('KSNCODE.'),
                children: item.ksn_code
            },
            {
                key: 'item_price',
                label: __('Item price.'),
                children: addComma(item.item_price)
            },
            {
                key: 'status',
                label: __('Item status.'),
                children: itemStatusIcons[item.status]
            },
            {
                key: 'create_time',
                label: __('Create time.'),
                children: item.create_time
            },
            {
                key: 'item_options',
                label: __('Item options.'),
                children: item.item_options
            },
        ]);
    }, [item]);// eslint-disable-line react-hooks/exhaustive-deps

    /** 设置采购商品显示数据 */
    useEffect(() => {
        const _supplyData = [
            {
                key: 'supply_url',
                label: __('Supply url.'),
                children: supplyUrl(supply.supply_url),
                span: 2
            },
            {
                key: 'supply_name',
                label: __('Supply name.'),
                children: transformParagraph('supply_name', supply.supply_name),
                span: 2
            },
            {
                key: 'supply_image_view',
                label: __('Supply image.'),
                children: supplyImage(supply.supply_image),
                labelStyle: { width: 80, verticalAlign: 'top' },
                contentStyle: { width: 200, height: 200, verticalAlign: 'middle', textAlign: 'center' }
            },
            {
                key: 'supply_image',
                label: __('Image url.'),
                children: transformParagraph('supply_image', supply.supply_image),
                labelStyle: { width: 80, verticalAlign: 'top' },
                contentStyle: { width: 200, verticalAlign: 'top' }
            },
            {
                key: 'supply_code',
                label: __('Supply code.'),
                children: transformParagraph('supply_code', supply.supply_code)
            },
            {
                key: 'supply_opt',
                label: __('Supply opt.'),
                children: transformParagraph('supply_opt', supply.supply_opt)
            },
            {
                key: 'supply_market',
                label: __('Supply market.'),
                children: supplyMarketSelect(supply.supply_market)
            },
            {
                key: 'supply_price',
                label: __('Supply price.'),
                children: transformParagraph('supply_price', supply.supply_price)
            },
            {
                key: 'supply_options',
                label: __('Supply options.'),
                children: transformParagraph('supply_options', supply.supply_options)
            },
            {
                key: 'supply_unit',
                label: __('Supply unit.'),
                children: transformParagraph('supply_unit', supply.supply_unit)
            },
        ];

        if (recSupply.length > 0) {
            _supplyData.unshift({ key: 'rec_supply', label: __('Rec supply.'), children: recommendSupply(), span: 2 });
        }

        setSupplyData(_supplyData);
    }, [supply, recSupply]);// eslint-disable-line react-hooks/exhaustive-deps

    /** 设置物流商显示数据 */
    useEffect(() => {
        let _logistic = logistics.filter(v => logisticId === v.id);
        _logistic = _logistic.length > 0 ? _logistic[0] : {};

        setLogisticData([
            {
                key: 'logistic_id',
                label: __('Please select logistic.'),
                children: logisticSelect(logistics, _logistic.id),
                labelStyle: { width: 100 },
                contentStyle: { width: 200 }
            },
            {
                key: 'nickname',
                label: __('Logistic nickname.'),
                children: _logistic.nickname ? _logistic.nickname : '',
                labelStyle: { width: 100 },
                contentStyle: { width: 200 }
            },
            {
                key: 'company',
                label: __('Company.'),
                children: _logistic.company ? _logistic.company : ''
            },
            {
                key: 'manager',
                label: __('Manager.'),
                children: _logistic.manager ? _logistic.manager : ''
            },
            {
                key: 'country',
                label: __('Country.'),
                children: _logistic.country ? _logistic.country : ''
            },
            {
                key: 'address',
                label: __('Address.'),
                children: _logistic.address ? _logistic.address : ''
            },
            {
                key: 'shipping_option',
                label: __('Shipping option.'),
                children: <Select
                    key={item.id}
                    size="small"
                    placeholder={__('Shipping option.')}
                    defaultValue={item.shipping_option + ''}
                    onChange={(e) => { setItem({ ...item, shipping_option: e }) }}
                    style={{ width: 160 }}
                    options={Object.keys(shippingOption).map(val => (
                        {
                            value: val,
                            label: shippingOption[val]
                        }
                    ))}
                />
            }
        ]);
    }, [logistics, logisticId]);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取商品资料，采购商品资料，物流商信息等 */
    const getItem = async () => {
        setLoading(true);

        const res = await ItemAction.show(props.item_id);

        setItem(res.result.item);
        res.result.supply && setSupply(res.result.supply);
        res.result.supply_more && setSupplyMore(res.result.supply_more);
        res.result.logistics && setLogistics(res.result.logistics);
        setRecSupply(res.result.rec_supply);
        res.result.item.logistic_id !== 0 && setLogisticId(res.result.item.logistic_id);

        setLoading(false);
    }

    /** 商品资料图片 */
    const itemImage = (item_image) => {
        return !item_image || item_image === ''
            ? <img src={require('../../assets/img/gift.png')} alt="" width={80} />
            : <img src={item_image} alt="" width={160} />
    }

    /** 选择图片，并放入可编辑div里 */
    const getImage = (file) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            const imageBase64 = reader.result;
            const imageTag = '<img src="' + imageBase64 + '" alt="" />';
            document.querySelector('#edit-div').innerHTML = imageTag;
        }

        /** 禁止文件默认提交 */
        return false;
    }

    /** 上传图片 */
    const updateItemImage = async () => {
        setLoading(true);

        const editDiv = document.querySelector('#edit-div');
        let imageData = '';
        let imageType = '';
        const imageInfo = editDiv.innerHTML;

        /** 获取图片 base64 字符串 */
        const srcRegExp = /<img.*?src="(.*?)"/;
        const base64Image = imageInfo.match(srcRegExp);
        if (base64Image) {
            imageData = base64Image[1];
            imageType = 'base64';
        }

        /** 没有获取 base64，则获取图片url */
        if (imageData === '') {
            const urlRegExp = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
            const imageUrl = imageInfo.match(urlRegExp);
            if (imageUrl) {
                imageData = imageUrl[0];
                imageType = 'url';
            }
        }

        if (imageData === '') {
            message.error(__('Image format error.'));
            editDiv.innerHTML = '';
            setLoading(false);
            return false;
        }

        const res = await ItemAction.updateItemImage(props.item_id, { type: imageType, data: imageData });
        res && setItem({ ...item, item_image: res.result });

        editDiv.innerHTML = '';

        setLoading(false);
    }

    /** 商品资料图片渲染 */
    const itemImageEditor = () => (
        <>
            <div contentEditable={true} className="image-editor" placeholder={__('Please input image url or image crop.')} id="edit-div"></div>
            <Space>
                <Upload
                    beforeUpload={getImage}
                    maxCount={1}
                    accept=".jpg,.jpeg,.png"
                    showUploadList={false}
                >
                    <Button icon={<UploadOutlined />} size="small">{__('Local image.')}</Button>
                </Upload>
                <Button type="primary" style={{ background: '#52c41a' }} size="small" onClick={updateItemImage}>{__('Edit.')}</Button>
            </Space>
        </>
    );

    /** 采购商品URL输入框 */
    const supplyUrl = (url) => {
        return (
            <Space>
                <Input size="small" style={{ width: 400 }} value={url} onChange={(e) => { resetSupply('supply_url', e.target.value) }} />
                <Button icon={<SearchOutlined />} size="small" onClick={searchSupplyItemByUrl} />
                <Tooltip placement="top" title={__('List item SKU.')} >
                    <Button icon={<EllipsisOutlined />} size="small" onClick={() => { openSupplySku(supplySku) }} />
                </Tooltip>
            </Space>
        );
    }

    /** 根据商品url搜索采购商品 */
    const searchSupplyItemByUrl = async () => {
        const supplyUrl = supply.supply_url;

        if (!supplyUrl) {
            message.error(__('Please input item url.'));
            return false;
        }

        const itemInfo = analysisSupplyUrl(supplyUrl);

        /** 没有解析到采购平台和商品id */
        if (!itemInfo.market || !itemInfo.itemId) {
            message.error(__('Invalid item url.'));
            return false;
        }

        setLoading(true);

        /** 获取各个采购平台的商品基本信息 */
        let res;
        if (itemInfo.market === 'store') {
            res = await StoreAction.getGoodsItems(itemInfo.itemId);
        } else {
            res = await SupplierAction.supplierItem(itemInfo.itemId, itemInfo.market);
        }
        
        if (res) {
            const result = res.result;
            const _supply = {};
            _supply['supply_url'] = supplyUrl;
            _supply['supply_image'] = result['images'][0];
            _supply['supply_code'] = result['item_id'];
            _supply['supply_opt'] = '';
            _supply['supply_market'] = itemInfo.marketAlias;
            _supply['supply_name'] = result['title'];
            _supply['supply_options'] = '';
            _supply['supply_unit'] = 1;
            _supply['min_quantity'] = result['min_buy'];

            setSupply(_supply);

            if (result['sku'].length > 0) {
                setSupplySku({mainInfo: _supply, sku: result['sku']});
                openSupplySku({mainInfo: _supply, sku: result['sku']});
            }
        }

        setLoading(false);
    }

    /** 打开商品选项列表 */
    const openSupplySku = (_supplyData) => {
        setDrawStatus(true);
        setDrawOption({
            title: __('Item SKU.'),
            width: 360
        });
        setDrawElement(<SupplySku supplyData={_supplyData} selectSku={selectSku} />);
    }

    /** 打开商品选项列表（附加采购商品） */
    const openSupplyMoreSku = (searchUrl) => {
        if (!searchUrl) return false;

        setDrawStatus(true);
        setDrawOption({
            title: __('Item SKU.'),
            width: 360
        });
        setDrawElement(<SupplySku supplyData={{searchUrl}} selectSku={setSupplyMoreSku} />);
    }

    /** 选择sku */
    const selectSku = (mainInfo, sku) => {
        mainInfo['supply_opt'] = sku.spec_id;
        mainInfo['supply_price'] = sku.price;

        if (sku.sku_image) {
            mainInfo['supply_image'] = sku.sku_image;
        }
        if (sku.data) {
            let _sku = {};
            sku.data.forEach(v => {
                _sku = {..._sku, ...v};
            });
            mainInfo['supply_options'] = JSON.stringify(_sku);
        }

        /** 当前mainInfo一直是参数传递的对象，只改变内容则不会重新渲染，需要修改内存地址 */
        setSupply({...mainInfo});
    }

    /** 选择sku，设置附加采购商品 */
    const setSupplyMoreSku = (main, sku) => {
        if (!Object.keys(supply).length) {
            message.error(__('Please map the main item.'));
            return false;
        }

        let hasSame = false;
        for (let i=0;i<supplyMore.length;i++) {
            if (supplyMore[i]['supply_opt'] === sku.spec_id) {
                hasSame = true;
                break;
            }
        }
        if (hasSame) return false;

        const _supplyMoreData = {...main};
        _supplyMoreData['supply_id'] = supply.id;
        _supplyMoreData['user_id'] = supply.user_id;
        _supplyMoreData['supply_opt'] = sku.spec_id;
        _supplyMoreData['supply_price'] = sku.price;
        _supplyMoreData['supply_unit'] = 1;

        if (sku.sku_image) {
            _supplyMoreData['supply_image'] = sku.sku_image;
        }
        if (sku.data) {
            let _sku = {};
            sku.data.forEach(v => {
                _sku = {..._sku, ...v};
            });
            _supplyMoreData['supply_options'] = JSON.stringify(_sku);
        }

        setSupplyMore([...supplyMore, _supplyMoreData]);
        closeDraw();
    }

    /** 重新设置附加采购商品的单位数量 */
    const resetSupplyMoreUnit = (supply_opt, unit) => {
        setSupplyMore(supplyMore.map(v => {
            if (supply_opt === v.supply_opt)
                v.supply_unit = unit;

            return v;
        }));
    }

    /** 关闭二级抽屉 */
    const closeDraw = () => {
        setDrawStatus(false);
        setDrawElement(null);
    }

    /** 采购商品推荐选择 */
    const recommendSupply = () => {
        return (
            <List
                itemLayout="horizontal"
                dataSource={recSupply}
                renderItem={(v, k) => (
                    <List.Item key={k} style={{ border: `1px solid ${item.supply_id === v.id ? '#1677ff' : '#ffffff'}` }} className={styles['rec-supply']} onClick={() => { updateItemSupplyId(v.id) }}>
                        <List.Item.Meta
                            avatar={<Avatar src={v.supply_image} size={50} shape="square" />}
                            title={<span>{v.supply_name}</span>}
                            description={v.supply_options}
                        />
                    </List.Item>
                )}
            />
        );
    }

    /** 更新商品资料的待采购商品id */
    const updateItemSupplyId = async (supply_id) => {
        setLoading(true);

        const res = await ItemAction.updateItemSupplyId({ item_id: item.id, supply_id: supply_id });

        res && getItem();

        setLoading(false);
    }

    /** 采购商品信息的普通文本转为可编辑文本 */
    const transformParagraph = (field, text) => {
        const _text = text ? text : '';

        return (
            <Paragraph
                style={{ margin: 0 }}
                editable={{
                    onChange: (e) => {
                        let _val = e;

                        if (field === 'supply_price') {
                            let supplyPrice = parseFloat(e);
                            _val = isNaN(supplyPrice) ? '0' : supplyPrice + '';
                        }

                        if (field === 'supply_unit') {
                            let supplyPrice = parseInt(e);
                            _val = isNaN(supplyPrice) ? '1' : supplyPrice + '';
                        }

                        resetSupply(field, _val);
                    }
                }}
            >{_text}</Paragraph>
        );
    }

    /** 采购商品图片 */
    const supplyImage = (image_url) => {
        return image_url === ''
            ? <img src={require('../../assets/img/gift.png')} alt="" width={80} />
            : <img src={image_url} alt="" width={160} />
    }

    /** 采购平台 Select 组件 */
    const supplyMarketSelect = (market) => {
        const _market = market ? market : '';
        const _options = supplyMarkets.map(v => (
            {
                value: v.code,
                label: v.name
            }
        ));
        _options.unshift(
            {
                value: '',
                label: __('Not selected.')
            }
        );

        return <Select
            size="small"
            placeholder={__('Please select market.')}
            value={_market}
            onChange={(e) => { resetSupply('supply_market', e) }}
            style={{ width: 120 }}
            options={_options}
        />
    };

    /** 物流商 Select 组件 */
    const logisticSelect = (logistics, logistic_id) => {
        const _options = logistics.map(v => (
            {
                value: v.id,
                label: v.nickname
            }
        ));
        _options.unshift(
            {
                value: 0,
                label: __('Not selected.')
            }
        );

        return (
            <Select
                size="small"
                placeholder={__('Please select logistic.')}
                value={logistic_id}
                onChange={(e) => { setLogisticId(e) }}
                style={{ width: 120 }}
                options={_options}
            />
        );
    };

    /** 重置采购商品资料 */
    const resetSupply = (field, value) => {
        setSupply({
            ...supply,
            [field]: value
        });
    }

    /** 更新商品资料 */
    const updateItem = async () => {
        setLoading(true);

        item.logistic_id = logisticId;

        const res = await ItemAction.update(props.item_id, { item: item, supply: supply, supply_more: supplyMore });
        res.code === '' && props.updated();

        setLoading(false);
    }

    const columns = [
        {
            title: __('Supply image.'),
            width: 60,
            dataIndex: 'supply_image',
            key: 'supply_image',
            className: 'align-middle',
            render: (text, record, index) => <Image src={record['supply_image']} style={{ width: 50 }} />,
        },
        {
            title: __('Supply name.'),
            width: 160,
            dataIndex: 'supply_name',
            key: 'supply_name',
            className: 'align-middle',
        },
        {
            title: __('Supply options.'),
            width: 100,
            dataIndex: 'supply_options',
            key: 'supply_options',
            className: 'align-middle',
            render: (text, record, index) => transformItemOption(record.supply_options)
        },
        {
            title: __('Number.'),
            width: 60,
            dataIndex: 'supply_unit',
            key: 'supply_unit',
            className: 'align-middle',
            render: (text, record, index) => <InputNumber size="small" min={1} defaultValue={record.supply_unit} style={{width: 60}} onChange={(e) => {resetSupplyMoreUnit(record.supply_opt, e)}} />,
        },
        {
            title: __('Operation.'),
            width: 80,
            key: 'operation',
            fixed: 'right',
            className: 'align-middle',
            render: (text, record, index) => {
                return (
                    <Space size={2} className="list-opt">
                        <Tag color="error" className="pointer" onClick={() => { setSupplyMore(supplyMore.filter(v => v.supply_opt !== record.supply_opt)); }}>{__('Delete.')}</Tag>
                    </Space>
                );
            },
        },
    ];

    return (
        <Spin spinning={loading}>
            <Descriptions
                bordered
                column={2}
                title={__('Basic Item info.')}
                size="small"
                items={itemData}
            />

            <Divider style={{ border: 'none' }} />
            <Descriptions
                bordered
                column={2}
                title={__('Supply Item info.')}
                size="small"
                items={supplyData}
            />
            <Divider orientation="left" style={{ fontSize: 14, color: 'rgba(0,0,0,0.65)', margin: '20px 0 10px 0' }}>{__('Additional supply item.')}</Divider>
            <Search size="small" placeholder={__('Please input item url.')} style={{marginBottom: 5}} onSearch={(e) => {openSupplyMoreSku(e)}} />
            <Table
                bordered
                size="small"
                columns={columns}
                dataSource={supplyMore}
                rowKey={record => record.supply_opt}
                pagination={false}
            />

            <Divider style={{ border: 'none' }} />
            <Descriptions
                bordered
                column={2}
                title={__('Logistic.')}
                size="small"
                items={logisticData}
            />

            <Divider style={{ border: 'none' }} />
            <Button type="primary" htmlType="submit" className="login-form-button" onClick={updateItem}>{__('submit.')}</Button>

            <Drawer
                title={drawOption.title}
                width={drawOption.width}
                onClose={closeDraw}
                open={drawStatus}
                bodyStyle={{padding: 12}}
            >{drawElement}</Drawer>
        </Spin>
    );
}

export default ItemEdit;