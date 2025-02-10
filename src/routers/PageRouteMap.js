import Admin from "../pages/admin";
import Dashboard from "../pages/dashboard";
import EmailTemplate from "../pages/email_template";
import ExcelTemplate from "../pages/excel_template";
import Item from "../pages/item";
import SupplierInfos from "../pages/item/SupplierInfos";
import Sourcing from "../pages/item/Sourcing";
import Order from "../pages/order";
import History from "../pages/order/History";
import Shop from "../pages/shop";
import User from "../pages/user";
import StoreInfo from "../pages/store/StoreInfo";
import Languages from "../pages/admin/languages";

export const PageRouteMap = {
    '/': <Dashboard />,

    // '/discovery': (
    //     <div style={{textAlign: 'center', width: '100%', paddingTop: '300px'}}>
    //         <h2 style={{fontSize: '48px', marginBottom: '20px', color: '#cf1322'}}>供应链入住者，火热招募中！</h2>
    //         <p style={{fontSize: '20px'}}>您有库存尾货吗?加入我们，让大家一起帮您清库存</p>
    //     </div>
    // ),
    // '/product': <div>Developing...</div>,

    '/order': <Order />,
    '/history': <History />,
    '/email_template': <EmailTemplate />,

    '/item': <Item />,
    '/sourcing': <Sourcing />,
    '/store_info': <StoreInfo />,
    '/supplier_infos': <SupplierInfos />,
    
    '/user': <User />,
    '/shop': <Shop />,
    '/excel_template': <ExcelTemplate />,
    '/admin': <Admin />,
    '/languages': <Languages />,
}