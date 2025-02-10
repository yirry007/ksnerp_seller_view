import { __ } from "./utils/functions";

export const API_HOST = (window.location.host).indexOf('localhost') > -1
    ? 'http://local.ksnerp.com'
    : window.location.protocol + '//' + window.location.host;

/** 平台与名称映射表 */
export const markets = [
    {key: 'Yahoo', name: __('Yahoo.')},
    {key: 'Rakuten', name: __('Rakuten.')},
    {key: 'Wowma', name: __('Wowma.')},
    {key: 'Qoo10', name: __('Qoo10.')}
];

/** Market图标 */
export const marketIcons = {
    'Yahoo': '../../assets/img/yahoo.png',
    'Rakuten': '../../assets/img/rakuten.png',
    'Wowma': '../../assets/img/wowma.png',
    'Qoo10': '../../assets/img/qoo10.png',
};

/** 手动重定向授权的平台列表 */
export const nonAutoCreateToken = ['Yahoo'];

/** 订单状态映射表 */
export const orderStatusMap = {
    '0': __('New Order.'),
    '1': __('Confirm Payment(before shipping).'),
    '2': __('Sourcing.'),
    '3': __('Sourced.'),
    '4': __('Shipping.'),
    '5': __('Shipped.'),
    '6': __('Confirm Payment(after shipping).'),
    '7': __('Finish.'),
    '98': __('Cancel.'),
    '99': __('Reserve.'),
    '100': __('Official Store.')
};

/** 可更新的订单状态，用于显示更新状态按钮 */
export const updatableOrderStatus = ['0', '1', '2', '3', '4', '6'];
/** 可导出Excel的订单状态，可更新的订单状态，用于显示更新状态按钮 */
export const excelExportableOrderStatus = ['0', '1', '2', '3', '4'];
/** 可导入Excel的订单状态，可更新的订单状态，用于显示更新状态按钮 */
export const excelImportableOrderStatus = ['2', '3'];

/** react-quill（富文本编辑器菜单设置） */
export const toolbar = [
    [{'header': [1, 2, false]}],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image'],
    ['clean']
];

/** 邮件中可添加的变量 */
export const emailAddableField = [
    {key: '{{name}}', name: '氏名'},
    {key: '{{shop_name}}', name: 'ストア名'},
    {key: '{{order_id}}', name: '注文番号'},
    {key: '{{order_time}}', name: '注文日時'},
    {key: '{{shipping}}', name: '配送信息'},
    {key: '{{address}}', name: '住所'},
    {key: '{{zipcode}}', name: '郵便番号'},
    {key: '{{phone}}', name: '電話番号'},
    {key: '{{items}}', name: '商品情報'},
    {key: '{{total_price}}', name: '請求金額'}
];

/** 邮件类型映射表 */
export const emailTypeMap = {0: __('Order Confirm.'), 4: __('Shipping Notification.')};

/** Excel模板类型映射表 */
export const excelTypeMap = {1: __('Order.'), 2: __('Product.')}

/** 采购平台列表 */
export const supplyMarkets = [
    {code: '1688', name: '1688', alias: 'alibaba'},
    {code: 'taobao', name: '淘宝', alias: 'taobao'},
    {code: 'tmall', name: '天猫', alias: 'tianmao'},
    {code: 'ksnshop', name: '科速诺', alias: 'ksnshop'},
];

/** 国内可用快递 */
export const deliveryCompany = [
    {code: 'yuantong', name: '圆通'},
    {code: 'zhongtong', name: '中通'},
    {code: 'shentong', name: '申通'},
    {code: 'yunda', name: '韵达'}
];

/** 国际物流 */
export const shippingCompany = [
    {id: '1', name: '佐川急便'},
    {id: '2', name: 'ヤマト運輸'},
    {id: '3', name: '日本郵便'}
];

/** 自定义物流选项（快件，慢件等） */
export const shippingOption = {
    '0': '默认',
    '1': '佐川普货120',
    '2': '佐川带电120',
    '3': '日邮带电3CM',
    '4': '日邮普货3CM',
};