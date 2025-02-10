import { Badge, Dropdown } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../assets/css/header.module.scss'
import { LoginAction } from '../actions/LoginAction';
import { connect, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { API_HOST } from '../Constants';
import { __ } from '../utils/functions';

function Header(props) {
    const [updatable, setUpdatable] = useState(props.new_version);// 版本更新提示

    const navigate = useNavigate();
    const newVersion = useSelector(state => state.newVersionReducer.new_version);// 监听 redux 变化

    let token;
    try {
        token = JSON.parse(localStorage.getItem('token'));
    } catch (e) {
        console.log(e);
        token = null;
    }
    const username = token ? token.username : '-';

    useEffect(() => {
        if (newVersion !== updatable) {
            setUpdatable(newVersion);
        }
    }, [newVersion]);// eslint-disable-line react-hooks/exhaustive-deps

    /** 设置语言 */
    const setLanguage = (locale) => {
        localStorage.setItem('locale', locale);
        window.location.reload();
    }

    /** 退出登录 */
    const logout = async () => {
        await LoginAction.logout();
        navigate('/login');
    }

    const languages = [
        {
            key: '1',
            label: <span onClick={() => setLanguage('cn')}>中文简体 Chinese Simple</span>,
        },
        {
            key: '2',
            label: <span onClick={() => setLanguage('jp')}>日本語 Japanese</span>,
        }
    ];

    const iconMenu = [
        {
            key: '1',
            label: <span onClick={logout}>{__('Log out.')}</span>,
        }
    ];

    return (
        <div className={styles['C-Header']}>
            <a href="/" className={styles['logo']}>
                <img src={require('../assets/img/logo.png')} alt="LOGO" />
                <h1>KSNERP</h1>
            </a>
            <div className={styles['actions']}>
                <Dropdown
                    menu={{
                        items: languages,
                    }}
                    placement="bottomLeft"
                    className={styles['user']}
                >
                    <i className="icon iconfont">&#xe61b;</i>
                </Dropdown>
                <div className={styles['icons']}>
                    <Link to="/" title={updatable ? __('Found new version.') : __('New version now.')}>
                        <Badge dot={updatable}>
                            <i className="icon iconfont" style={{ color: '#ffffff' }}>&#xe694;</i>
                        </Badge>
                    </Link>
                    <a title={__('Download sourcing item helper.')} href={API_HOST + '/ksn_sourcing_helper@1.1.9.zip'} target="_blank" rel="noreferrer" style={{ marginLeft: 16 }}>
                        <i className="icon iconfont">&#xe601;</i>
                    </a>
                </div>
                <Dropdown
                    menu={{
                        items: iconMenu,
                    }}
                    placement="bottomLeft"
                    className={styles['user']}
                >
                    <span>{username}</span>
                </Dropdown>
            </div>
        </div>
    );
}

const mapStateToProps = ({
    newVersionReducer: { new_version },
}) => {
    return {
        new_version,
    }
}

export default connect(mapStateToProps)(Header);