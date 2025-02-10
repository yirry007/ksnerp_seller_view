// 把对象转换为url参数
export const jsonToUrlParam = json => Object.keys(json).map(key => key + '=' + json[key]).join('&');

/**
* 小于10数字前补0
* @param {*} num 
* @returns 
*/
export const fillZero = (num) => {
    return num < 10 ? '0' + num : num + '';
}

/**
 * 数字添加千位分隔符
 * @param {*} num 
 * @returns 
 */
export const addComma = (num) => {
    let symbol = num >= 0 ? 1 : -1;
    num = Math.abs(num);

    let initNum = (num || 0).toString(), result = '', formatNum = '';
    if (initNum.indexOf('.') > -1) formatNum = (num || 0).toString().split('.')
    let _num = formatNum ? formatNum[0] : initNum;
    while (_num.length > 3) {
        result = ',' + _num.slice(-3) + result;
        _num = _num.slice(0, _num.length - 3);
    }
    if (_num) { result = formatNum ? _num + result + '.' + formatNum[1] : _num + result; }

    return symbol === -1 ? '-' + result : result;
}

/**
 * 根据时间戳返回日期
 * @param int timestamp 
 * @param int mode 返回数据模式
 * @returns 
 */
export const timeFormat = (timestamp, mode = 1) => {
    if (!timestamp) return '-';

    let _timestamp = timestamp < 9999999999 ? timestamp * 1000 : timestamp;
    let time = new Date(_timestamp);

    let y = time.getFullYear();
    let m = time.getMonth() + 1;
    let d = time.getDate();
    let h = time.getHours();
    let mm = time.getMinutes();
    let s = time.getSeconds();

    let datas;
    if (mode === 1) {
        datas = y + '-' + fillZero(m) + '-' + fillZero(d);
    } else if (mode === 2) {
        datas = y + '-' + fillZero(m) + '-' + fillZero(d) + ' ' + fillZero(h) + ':' + fillZero(mm) + ':' + fillZero(s);
    } else if (mode === 3) {
        datas = y + fillZero(m) + fillZero(d) + fillZero(h) + fillZero(mm) + fillZero(s);
    }

    return datas;
}

/**
 * 构建详细地址字符串
 * @param obj order object data 
 * @returns 
 */
export const buildFullAddress = (obj) => {
    let delivery = '';

    if (obj.prefecture) delivery += obj.prefecture;
    if (obj.city) delivery += ' ' + obj.city;
    if (obj.address_1) delivery += ' ' + obj.address_1;
    if (obj.address_2) delivery += ' ' + obj.address_2;
    if (obj.name_1) delivery += ' ' + obj.name_1;
    if (obj.name_2) delivery += ' ' + obj.name_2;
    if (obj.phone_1) delivery += ' ' + obj.phone_1;
    if (obj.phone_2) delivery += ' ' + obj.phone_2;

    return delivery;
}

/**
 * 订单商品原始选项转换
 * @param opt item option json string
 * @returns 
 */
export const buildItemOption = (opt) => {
    let option;

    try {
        option = JSON.parse(opt);
    } catch (e) {
        return '';
    }

    if (!option || !option.data) return '';

    let optionData = '';
    Object.keys(option.data).forEach((v, k) => {
        if (k > 0) optionData += ' | ';

        optionData += v + ':' + option.data[v];
    });


    return optionData;
}

/**
 * 普通 JSON 字符串转普通字符串
 * {a:'1', b:'2'} => a: 1 b: 2
 * @param {*} opt
 * @param {*} type 
 * @returns 
 */
export const transformItemOption = (opt, type = 'text') => {
    let option;

    try {
        option = JSON.parse(opt);
    } catch (e) {
        return '';
    }

    if (!option) return '';

    let optionData = '';
    Object.keys(option).forEach((v, k) => {
        if (k > 0) optionData += type === 'text' ? '\n' : '<br/>';

        let _key = type === 'text' ? v : '<span style="font-weight:bold;color:rgba(0,0,0,0.6);text-decoration:underline;">' + v + '</span>';
        optionData += _key + ': ' + option[v];
    });

    return optionData;
}

/**
 * 订单其他信息列表
 * @param opt item option json string
 * @returns []
 */
export const buildItemInfos = (opt) => {
    try {
        return JSON.parse(opt);
    } catch (e) {
        return [];
    }
}

/**
 * 数组拆分
 * @param arr array
 * @param size int
 * @returns 
 */
export const sliceArray = (arr, size) => {
    const arrNum = Math.ceil(arr.length / size, 10); // Math.ceil()向上取整的方法，用来计算拆分后数组的长度
    let index = 0; // 定义初始索引
    let resIndex = 0; // 用来保存每次拆分的长度
    const result = [];
    while (index < arrNum) {
        result[index] = arr.slice(resIndex, size + resIndex);
        resIndex += size;
        index++;
    }
    return result;
}

/**
 * 根据 url 获取采购平台名称，商品id
 * @param {*} url 
 * @returns 
 */
export const analysisSupplyUrl = (url) => {
    let market;//采购平台
    let marketAlias;//采购平台别名
    let itemId;//商品id

    if (url.indexOf('detail.1688.com') > -1) {//获取1688商品id
        market = 'alibaba';
        marketAlias = '1688';
        itemId = url.split('/offer/')[1].split('.html')[0];

    } else if (url.indexOf('www.ksnshop.com/') > -1) {//获取独立站商品id
        market = 'ksnshop';
        marketAlias = 'ksnshop';
        itemId = url.split('/').pop();

    } else if (url.indexOf('item.taobao.com') > -1) {//获取淘宝商品id
        market = '';
        marketAlias = '';
        itemId = 0;

    } else if (url.indexOf('SG_') > -1) {
        market = 'store';
        marketAlias = 'store';
        itemId = url;
    }

    return { market, marketAlias, itemId };
}

/**
 * 获取字符串字节数
 * @param {*} str 
 * @returns 
 */
export const getByteSize = (str) => {
    let size = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code <= 0x7f) {
            size += 1;
        } else if (code <= 0x7ff) {
            size += 2;
        } else if (code >= 0xd800 && code <= 0xdfff) {
            // surrogate pair
            size += 4;
            i++; // 跳过配对的代理项
        } else {
            size += 3;
        }
    }
    return size;
}

/**
 * 语言切换
 * @param {*} key 
 * @returns 
 */
export const __ = (key) => {
    const lang = JSON.parse(localStorage.getItem('lang'));
    const locale = localStorage.getItem('locale');
    return lang && lang[locale] && lang[locale][key] ? lang[locale][key] : 'NO TEXT';
}
