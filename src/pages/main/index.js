import styles from './main.module.scss';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import { useLocation } from 'react-router-dom';
import { PageRouteMap } from '../../routers/PageRouteMap';

function Main(props) {
    const location = useLocation();
    const pathname = location['pathname'];
    const renderPage = PageRouteMap[pathname];

    return (
        <div className={styles['P-Layout']}>
            <Header />
            <div className={styles['main']}>
                <Nav />
                {renderPage}
            </div>
        </div>
    );
}

export default Main;