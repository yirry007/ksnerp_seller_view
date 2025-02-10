import { useNavigate } from 'react-router-dom';
import styles from './login.module.scss';
import { useEffect, useState } from 'react';
import { LoginAction } from '../../actions/LoginAction';
import Loading from '../../components/loading';

function Login(props) {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');//用户名
    const [password, setPassword] = useState('');//密码
    const [loading, setLoading] = useState('none');//加载转圈圈

    useEffect(() => {
        //打开页面后如果有登录信息，则跳转到首页
        const token = localStorage.getItem('token');
        if (token) {
            props.set_auth(token);
            navigate('/');
        } else {
            props.set_auth(null);
        }

        localStorage.setItem('locale', 'cn');
        getLanguagePackage();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const getLanguagePackage = async () => {
        await LoginAction.getLanguagePackage();
    }

    /** 用户登录 */
    const userLogin = async () => {
        setLoading('block');
        let res = await LoginAction.auth({username, password});
        
        if (res) {
            props.set_auth(res.result.token);
            navigate('/');
        } else {
            setLoading('none');
        }
    }

    /** 键盘回车执行用户登录 */
    const _handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            userLogin();
        }
    }

    return (
        <div className={styles['P-Login']}>
            <div className={styles['main-agileits']}>
                <div className={styles['form-w3-agile']}>
                    <h2>KSNERP Administrator</h2>
                    <form action="#" method="post">
                        <div className={styles['form-sub-w3']}>
                            <input type="text" name="username" placeholder="username " required="" autoComplete="off" onKeyDown={_handleKeyDown} onChange={(e)=>{setUsername(e.target.value)}} />
                            <div className={styles['icon-w3']}>
                                <i className={styles['fa fa-user" aria-hidden="true']}></i>
                            </div>
                        </div>
                        <div className={styles['form-sub-w3']}>
                            <input type="password" name="password" placeholder="password" required="" autoComplete="off" onKeyDown={_handleKeyDown} onChange={(e)=>{setPassword(e.target.value)}} />
                            <div className={styles['icon-w3']}>
                                <i className={`${styles['fa fa-unlock-alt']} ${styles['aria-hidden="true']}`}></i>
                            </div>
                        </div>
                        {/* <p className={styles['p-bottom-w3ls']}>Are you new to eBanking?<a className={styles['w3_play_icon1']} href="#small-dialog1">  Register here</a></p> */}

                        <div className={styles['submit-w3l']}>
                            <input type="button" value="Login" onClick={()=>{userLogin()}} />
                        </div>
                    </form>
                </div>
            </div>
            {/* <div className={`${styles['copyright']} ${styles['w3-agile']}`}>
                <p> © 2019 Credit Login / Register Form . All rights reserved | Design by <a href="http://www.bootstrapmb.com/">bootstrapmb</a></p>
            </div> */}
            <Loading loading={loading} tip="Logging in..." />
        </div >
    );
}

export default Login;