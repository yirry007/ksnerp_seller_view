import { API_HOST } from "../Constants";

export const Api = {
    /** Dashboard */
    version_info: API_HOST + '/api/v1/main/version_info',//get
    version_update: API_HOST + '/api/v1/main/version_update',//post
    version_update_logs: API_HOST + '/api/v1/main/version_update_logs',//get

    order_num_last_month: API_HOST + '/api/v1/main/order_num_last_month',//get
    order_price_last_month: API_HOST + '/api/v1/main/order_price_last_month',//get
    order_num_percent: API_HOST + '/api/v1/main/order_num_percent',//get
    order_price_percent: API_HOST + '/api/v1/main/order_price_percent',//get
    exchange_rate: 'https://m.search.naver.com/p/csearch/content/qapirender.nhn?key=calculator&pkid=141&q=%ED%99%98%EC%9C%A8&where=m&u1=keb&u6=standardUnit&u7=0&u3=CNY&u4=JPY&u8=up&u2=1000',//get


    /** auth | 用户登录（授权） */
    auth: API_HOST + '/api/v1/auth',//post
    refresh_token: API_HOST + '/api/v1/refresh_token',//post
    logout: API_HOST + '/api/v1/logout',//post
    get_language_package: API_HOST + '/api/v1/get_language_package',//get


    /** user | 用户管理 */
    admin_list: API_HOST + '/api/v1/admin/admin',//get
    admin_store: API_HOST + '/api/v1/admin/admin',//post
    admin_update: admin_id => API_HOST + `/api/v1/admin/admin/${admin_id}`,//put
    get_language_data: API_HOST + '/api/v1/admin/get_language_data',//get
    update_language_data: API_HOST + '/api/v1/admin/update_language_data',//post
    language_add: API_HOST + '/api/v1/admin/language_add',//post


    /** order | 订单管理 */
    order_list: API_HOST + '/api/v1/order/order',//get
    orders_update: API_HOST + '/api/v1/order/orders_update',//post
    check_order_process: API_HOST + '/api/v1/order/check_order_process',//get
    order_show: order_id => API_HOST + `/api/v1/order/order/${order_id}`,//get
    order_update_confirm: API_HOST + '/api/v1/order/order_update_confirm',//get
    order_update: API_HOST + '/api/v1/order/order',//put (批量修改，不遵守RESTful)
    order_reserve: order_id => API_HOST + `/api/v1/order/order_reserve/${order_id}`,//post
    order_cancel: order_id => API_HOST + `/api/v1/order/order_cancel/${order_id}`,//post
    email_send_logs_with_templates: (order_id, type) => API_HOST + `/api/v1/order/email_send_logs_with_templates/${order_id}/${type}`,//get
    resend_email: (order_id, template_id) => API_HOST + `/api/v1/order/resend_email/${order_id}/${template_id}`,//post
    update_order_item: order_item_id => API_HOST + `/api/v1/order/update_order_item/${order_item_id}`,//post
    update_shipping_data: order_item_id => API_HOST + `/api/v1/order/update_shipping_data/${order_item_id}`,//post
    order_item_more: order_item_id => API_HOST + `/api/v1/order/order_item_more/${order_item_id}`,//get
    update_order_item_more: order_item_id => API_HOST + `/api/v1/order/update_order_item_more/${order_item_id}`,//post
    histories: API_HOST + '/api/v1/order/histories',//get
    history_view: order_id => API_HOST + `/api/v1/order/history_view/${order_id}`,//get
    unity_update_order_item: API_HOST + '/api/v1/order/unity_update_order_item',//post
    shipping_info: order_item_id => API_HOST + `/api/v1/order/shipping_info/${order_item_id}`,//get

    email_template_list: API_HOST + '/api/v1/order/email_template',//get
    email_template_store: API_HOST + '/api/v1/order/email_template',//post
    email_template_update: template_id => API_HOST + `/api/v1/order/email_template/${template_id}`,//put
    email_template_delete: template_id => API_HOST + `/api/v1/order/email_template/${template_id}`,//delete
    email_templates: market => API_HOST + `/api/v1/order/email_templates/${market}`,//get
    shop_email_templates: shop_id => API_HOST + `/api/v1/order/shop_email_templates/${shop_id}`,//get


    /** item | 商品资料映射 */
    item_list: API_HOST + '/api/v1/item/item',//get
    discover: API_HOST + '/api/v1/item/discover',//post
    item_show: item_id => API_HOST + `/api/v1/item/item/${item_id}`,//get
    item_update: item_id => API_HOST + `/api/v1/item/item/${item_id}`,//put
    update_item_image: item_id => API_HOST + `/api/v1/item/update_item_image/${item_id}`,//post
    update_item_supply_id: API_HOST + '/api/v1/item/update_item_supply_id',//post
    change_status: item_id => API_HOST + `/api/v1/item/change_status/${item_id}`,//post
    item_merge: API_HOST + '/api/v1/item/merge',//post
    supply_more: supply_id => API_HOST + `/api/v1/item/supply_more/${supply_id}`,//get
    update_supply_more: (supply_id, mode='') => API_HOST + `/api/v1/item/update_supply_more/${supply_id}/${mode}`,//post
    delete_supply_more: (supply_id, mode='') => API_HOST + `/api/v1/item/delete_supply_more/${supply_id}/${mode}`,//post
    item_sourcing: API_HOST + '/api/v1/item/sourcing',//get
    map_item: API_HOST + '/api/v1/item/map_item',//post
    supply_url: item_id => API_HOST + `/api/v1/item/get_supply_url/${item_id}`,//get
    remap_item: API_HOST + '/api/v1/item/remap_item',//post
    add_supply_more: API_HOST + '/api/v1/item/add_supply_more',//post
    update_supply_memo: API_HOST + '/api/v1/item/update_supply_memo',//post
    update_logistic: API_HOST + '/api/v1/item/update_logistic',//post
    update_shipping_option: API_HOST + '/api/v1/item/update_shipping_option',//post
    item_sourcing_view: API_HOST + '/api/v1/item/sourcing_view',//get


    /** supplier | 采购平台（1688，淘宝等） */
    supplier_infos: API_HOST + '/api/v1/supplier/get_supplier_infos',//get
    supplier_encrypted: API_HOST + '/api/v1/supplier/get_supplier_encrypted',//get
    supplier_account_auth: API_HOST + '/api/v1/supplier/supplier_account_auth',//post
    supplier_cancel_auth: API_HOST + '/api/v1/supplier/supplier_cancel_auth',//post
    supplier_item: item_id => API_HOST + `/api/v1/supplier/get_item/${item_id}`,//get
    get_address: API_HOST + '/api/v1/supplier/get_address',//get
    order_items: API_HOST + '/api/v1/supplier/get_order_items',//get
    create_orders: API_HOST + '/api/v1/supplier/create_orders',//post


    /** store | 商品库存管理 */
    store_info: API_HOST + '/api/v1/store/store_info',//get
    get_sku_keys: API_HOST + '/api/v1/store/get_sku_keys',//get
    get_logistics: API_HOST + '/api/v1/store/get_logistics',//get
    store_requesting: API_HOST + '/api/v1/store/store_requesting',//get
    store_request: API_HOST + '/api/v1/store/store_request',//post
    update_requesting: API_HOST + '/api/v1/store/update_requesting',//post
    cancel_requesting: API_HOST + '/api/v1/store/cancel_requesting',//post
    get_goods_items: item_id => API_HOST + `/api/v1/store/get_goods_items/${item_id}`,//get
    store_goods_delete: id => API_HOST + `/api/v1/store/store_goods_delete/${id}`,//post
    add_store_out_list: API_HOST + '/api/v1/store/add_store_out_list',//post
    store_out_requesting: API_HOST + '/api/v1/store/store_out_requesting',//get
    store_out_list: API_HOST + '/api/v1/store/store_out_list',//get
    cancel_out_requesting: id => API_HOST + `/api/v1/store/cancel_out_requesting/${id}`,//post
    delete_out_list: id => API_HOST + `/api/v1/store/delete_out_list/${id}`,//post
    store_out_request: API_HOST + '/api/v1/store/store_out_request',//post
    get_goods_item_by_sku: sku => API_HOST + `/api/v1/store/get_goods_item_by_sku/${sku}`,//get
    store_transfer: API_HOST + '/api/v1/store/store_transfer',//post
    store_in_logs: API_HOST + '/api/v1/store/store_in_logs',//get
    store_out_logs: API_HOST + '/api/v1/store/store_out_logs',//get


    /** shop | 基本设定 */
    shop_list: API_HOST + '/api/v1/shop/shop',//get
    shop_store: API_HOST + '/api/v1/shop/shop',//post
    shop_update: shop_id => API_HOST + `/api/v1/shop/shop/${shop_id}`,//put
    shop_delete: shop_id => API_HOST + `/api/v1/shop/shop/${shop_id}`,//delete
    check_connection: shop_id => API_HOST + `/api/v1/shop/check_connection/${shop_id}`,//post
    check_all_connection: API_HOST + '/api/v1/shop/check_all_connection',//pos

    menu: API_HOST + '/api/v1/shop/menu',//get
    shops: API_HOST + '/api/v1/shop/shops',//get
    user_list: API_HOST + '/api/v1/shop/user',//get
    user_store: API_HOST + '/api/v1/shop/user',//post
    user_menu: user_id => API_HOST + `/api/v1/shop/user_menu/${user_id}`,//get
    user_shops: user_id => API_HOST + `/api/v1/shop/user_shops/${user_id}`,//get
    user_update: user_id => API_HOST + `/api/v1/shop/user/${user_id}`,//put
    user_delete: user_id => API_HOST + `/api/v1/shop/user/${user_id}`,//delete

    excel_template_list: API_HOST + '/api/v1/shop/excel_template',//get
    excel_template_store: API_HOST + '/api/v1/shop/excel_template',//post
    excel_template_update: template_id => API_HOST + `/api/v1/shop/excel_template/${template_id}`,//put
    excel_template_delete: template_id => API_HOST + `/api/v1/shop/excel_template/${template_id}`,//delete
    export_fields: type => API_HOST + `/api/v1/shop/get_export_fields/${type}`,//get
    export_data: template_id => API_HOST + `/api/v1/shop/get_export_data/${template_id}`,//get
    import_excel: API_HOST + '/api/v1/shop/import_excel',//post
};