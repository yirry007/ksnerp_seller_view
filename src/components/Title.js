import { Breadcrumb } from 'antd';
import { useLocation } from 'react-router-dom';
import { __ } from '../utils/functions';

function Title(props) {
    const location = useLocation();
    const pathname = location.pathname;
    
    let menu;//菜单数据
    try {
        menu = JSON.parse(localStorage.getItem('menu'));
        menu = menu === null ? [] : menu;
    } catch (e) {
        console.log(e);
        menu = [];
    }
    let bread = [];
    let title = 'Dashboard';

    /** 根据路由获取菜单数据，并构建面包屑导航 */
    LOOP_BREAD: for (let i=0;i<menu.length;i++) {
        for (let j=0;j<menu[i]['children'].length;j++) {
            if (menu[i]['children'][j]['page_route'] === pathname) {
                /** 设置面包屑导航 */
                bread.push({title: __(menu[i]['page_route'])});
                bread.push({title: __(menu[i]['children'][j]['page_route'])});
                
                /** 设置标题 */
                title = __(menu[i]['children'][j]['page_route']);

                break LOOP_BREAD;
            }
        }
    }
    
    return (
        <div className="title">
            <Breadcrumb
                items={bread}
            />
            <h2 className="">{title}</h2>
        </div>
    );
}

export default Title;