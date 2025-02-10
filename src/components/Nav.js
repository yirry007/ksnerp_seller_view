import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import { AppstoreOutlined } from '@ant-design/icons';
import { __ } from '../utils/functions';

function Nav(props) {
    let menu;//菜单数据
    try {
        menu = JSON.parse(localStorage.getItem('menu'));
    } catch (e) {
        console.log(e);
        menu = [];
    }
    const getLink = v1 => <Link to={v1.page_route}>{__(v1.page_route === '/' ? 'Dashboard.' : v1.page_route)}</Link>;//菜单路由
    const getIcon = icon => <i className="icon iconfont" dangerouslySetInnerHTML={{__html: icon}}></i>;//菜单图标

    /** 菜单列表 */
    const menuItems = menu.map((v)=>(
        {
            label: __(v.page_route),
            key: v.key,
            type: v.type,
            children: v.children.map((v1)=>(
                {
                    label: getLink(v1),
                    key: v1.key,
                    icon: getIcon(v1.icon)
                }
            ))
        }
    ));

    /** 菜单列表中添加 dashboard */
    menuItems.unshift(
        {
            label: getLink({page_route:'/', label:__('Dashboard.')}),
            key: 'main',
            icon: <AppstoreOutlined />
        }
    );

    return (
        <div className="C-Nav">
            <Menu
                style={{
                    width: "100%",
                }}
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                items={menuItems}
            />
        </div>
    );
}

export default Nav;