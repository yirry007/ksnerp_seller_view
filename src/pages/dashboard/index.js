import styles from './dashboard.module.scss';
import { Badge, Button, Col, Collapse, Modal, Row, Statistic, Steps } from 'antd';
import { InfoCircleOutlined, DoubleRightOutlined } from '@ant-design/icons';
import Title from '../../components/Title';
import { DashboardAction } from '../../actions/DashboardAction';
import { useEffect, useRef, useState } from 'react';
import { ShopAction } from '../../actions/ShopAction';
import * as echarts from 'echarts';
import { lineChartOption, pieChartOption } from '../../System';
import { connect } from 'react-redux';
import { __ } from '../../utils/functions';
import { LoginAction } from '../../actions/LoginAction';

function Dashboard(props) {
    const [versions, setVersions] = useState({
        "current_version": "-",
        "last_version": "-",
        "current_update_time": "-",
        "last_update_time": "-",
        "updatable": false
    });//版本信息
    const [versionUpdating, serVersionUpdating] = useState(false);
    const [versionLogOpen, setVersionLogOpen] = useState(false);
    const [versionUpdateLogs, setVersionUpdateLogs] = useState([]);

    const [rate, setRate] = useState(0);//日元汇率
    const [Cny2Jpy, setCny2Jpy] = useState(0);//人民币1元可兑换的日元
    const [Jpy2Cny, setJpy2Cny] = useState(0);//100日元可兑换的人民币
    const [shops, setShops] = useState([]);//当前登录用户可操作的店铺列表
    const [shopConn, setShopConn] = useState(() => {
        const shopConnection = props.shop_connection;

        //没有保存的联动的数据或已保存的店铺联动状态过期了，则联动状态 state 设置为 空对象{}
        if (!shopConnection || shopConnection.expired < Date.now()) return {};

        return shopConnection.conn;
    });//店铺联动状态

    const orderNumLastMonth = useRef(null);
    const orderPriceLastMonth = useRef(null);
    const orderNumPercent = useRef(null);
    const orderPricePercent = useRef(null);

    useEffect(() => {
        getVersionInfo();
        exchangeRate();
        getShops();

        setOrderNumLastMonth();
        setOrderPriceLastMonth();
        setOrderNumPercent();
        setOrderPricePercent();
        updateLanguagePackage();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 店铺加载后检测店铺联动状态 */
    useEffect(() => {
        checkAllConnection();
    }, [shops]);// eslint-disable-line react-hooks/exhaustive-deps

    /** 更新语言包 */
    const updateLanguagePackage = async () => {
        // const expiredTime = 60 * 60 * 24 * 7 * 1000;//语言包更新周期为7天（毫秒表示）
        const expiredTime = 60 * 1000;//语言包更新周期为1分钟（毫秒表示）
        const langUpdateTime = parseInt(localStorage.getItem('lang_update_timestamp'));

        if (langUpdateTime + expiredTime < Date.now()) {
            await LoginAction.getLanguagePackage();
        }
    }

    /** 获取日元汇率 */
    const exchangeRate = async () => {
        const res = await DashboardAction.exchangeRate();

        if (!res.cny || !res.jpy) return false;

        setRate((res.jpy / res.cny).toFixed(4));
        setCny2Jpy((res.jpy / res.cny).toFixed(2));
        setJpy2Cny((res.cny / 10).toFixed(2));
    }

    /** 获取版本信息 */
    const getVersionInfo = async () => {
        const res = await DashboardAction.versionInfo();

        if (res.code === '') {
            setVersions(res.result);
            props.setNewVersion(res.result.updatable);
        }
    }

    /** 更新ERP版本 */
    const versionUpdate = async () => {
        serVersionUpdating(true);

        await DashboardAction.versionUpdate();

        /** 更新后直接刷新页面 */
        window.location.reload();
    }

    /** 获取店铺信息 */
    const getShops = async () => {
        const res = await ShopAction.list({});

        res.code === '' && setShops(res.result);
    }

    /** 近一月订单数量折线图 */
    const setOrderNumLastMonth = async () => {
        const res = await DashboardAction.orderNumLastMonth();

        const chart = echarts.init(orderNumLastMonth.current);
        const xAxisData = res.result.dates;
        const yAxisData = res.result.order_numbers;

        chart.setOption(lineChartOption(xAxisData, yAxisData));
    }

    /** 近一月订单金额折线图 */
    const setOrderPriceLastMonth = async () => {
        const res = await DashboardAction.orderPriceLastMonth();

        const chart = echarts.init(orderPriceLastMonth.current);
        const xAxisData = res.result.dates;
        const yAxisData = res.result.order_price;

        chart.setOption(lineChartOption(xAxisData, yAxisData.map(v => (v / 10000).toFixed(2))));
    }

    /** 近一月各店铺订单数量占比饼图 */
    const setOrderNumPercent = async () => {
        const res = await DashboardAction.orderNumPercent();

        const chart = echarts.init(orderNumPercent.current);
        const data = res.result;

        chart.setOption(pieChartOption(__('Order Number.'), data));
    }

    /** 近一月订单金额占比饼图 */
    const setOrderPricePercent = async () => {
        const res = await DashboardAction.orderPricePercent();

        const chart = echarts.init(orderPricePercent.current);
        const data = res.result;

        chart.setOption(pieChartOption(__('Order Price.'), data));
    }

    /** 获取所有店铺联动状态 */
    const checkAllConnection = async () => {
        //未加载店铺列表数组，不检测联动状态
        if (shops.length === 0) return;

        //保存的联动的数据未过期，则不检测联动状态
        const shopConnection = props.shop_connection;
        if (shopConnection && shopConnection.expired > Date.now()) return;

        const res = await ShopAction.checkAllConnection();

        if (res) {
            const expiredTime = Date.now() + 3600 * 1000;
            props.setShopConnection({ conn: res.result, expired: expiredTime });// redux 中写入联动状态数据，保存一个小时
            setShopConn(res.result);
        }
    }

    /** 获取版本 */
    const getVersionUpdateLog = async () => {
        const res = await DashboardAction.versionUpdateLogs();
        const collapseContent = (title, content) => <Collapse ghost items={[{label: title, children: <div dangerouslySetInnerHTML={{__html: content}} />,}]} />

        setVersionUpdateLogs(res.result.map(v => (
            {
                title: (
                    <div>
                        <strong style={{ fontSize: 20, color: '#389e0d', marginRight: 10 }}>{v.version}</strong>
                        <em style={{fontSize: 14, color: 'rgba(0,0,0,0.45)'}}>{v.update_time}</em>
                    </div>
                ),
                description: collapseContent(v.title, v.content),
            }
        )));

        setVersionLogOpen(true);
    }

    return (
        <div className="P-Content">
            <Title />
            <div className="content">
                <div className={styles['dashboard']}>
                    <Row gutter={[12, 20]} style={{ marginBottom: 30 }}>
                        <Col span={6}>
                            <div className={styles['dashboard-card']}>
                                <h2>
                                    <b>{__('JPY Price.')}</b>
                                    <InfoCircleOutlined style={{ color: "#595959", fontSize: 14 }} />
                                </h2>
                                <Statistic value={rate} valueStyle={{ color: "#ff4d4f", fontSize: 40, paddingTop: 12, paddingBottom: 12 }} />
                                <ul className={styles['subject']}>
                                    <li>1 RMB = {Cny2Jpy} JPY</li>
                                    <li>100 JPY = {Jpy2Cny} RMB</li>
                                </ul>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className={styles['dashboard-card']}>
                                <h2>
                                    <b>{__('Order number past month.')}</b>
                                    <InfoCircleOutlined style={{ color: "#595959", fontSize: 14 }} />
                                </h2>
                                <div ref={orderNumLastMonth} className={styles['line-chart']}></div>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className={styles['dashboard-card']}>
                                <h2>
                                    <b>{__('Order price past month.')}</b>
                                    <InfoCircleOutlined style={{ color: "#595959", fontSize: 14 }} />
                                </h2>
                                <div ref={orderPriceLastMonth} className={styles['line-chart']}></div>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className={styles['dashboard-card']}>
                                <h2>
                                    <b>{__('ERP system version.')}</b>
                                    {
                                        versions.updatable
                                            ? <Button
                                                type="primary"
                                                size="small"
                                                danger
                                                onClick={versionUpdate}
                                                loading={versionUpdating}
                                            >{__('Click and update.')}</Button>
                                            : <Button
                                                type="primary"
                                                size="small"
                                                disabled
                                                style={{ color: '#ffffff', borderColor: '#52c41a', backgroundColor: '#52c41a' }}
                                            >{__('New version.')}</Button>
                                    }
                                </h2>
                                <Steps
                                    progressDot
                                    current={1}
                                    direction="vertical"
                                    size="small"
                                    style={{ marginTop: '12px' }}
                                    items={[
                                        {
                                            title: (
                                                <div className={styles['dashboard-version']}>
                                                    <em>{__('New version.')} [ {versions.last_update_time} ]</em>
                                                    <strong style={{ color: '#389e0d' }}>{versions.last_version}</strong>
                                                </div>
                                            ),
                                            description: (
                                                <Button
                                                    type="text"
                                                    icon={<DoubleRightOutlined />}
                                                    style={{ marginTop: 4, color: 'rgba(0,0,0,0.45)', fontSize: 13 }}
                                                    size="small"
                                                    onClick={getVersionUpdateLog}
                                                >{__('View version update logs.')}</Button>
                                            ),
                                        },
                                        {
                                            title: (
                                                <div className={styles['dashboard-version']}>
                                                    <em>{__('Current version.')} [ {versions.current_update_time} ]</em>
                                                    <strong style={{ color: versions.updatable ? '#ff4d4f' : '#389e0d' }}>{versions.current_version}</strong>
                                                </div>
                                            )
                                        }
                                    ]}
                                />
                            </div>
                        </Col>
                    </Row>

                    {shops.length > 0 &&
                        <Row gutter={[12, 20]} style={{ marginBottom: 30 }}>
                            {shops.map(v => (
                                <Col span={6} key={v.id}>
                                    <div className={styles['dashboard-card']}>
                                        <h2>
                                            <span>{v.shop_name}</span>
                                            <Badge
                                                status={shopConn[v.id] === 'success' ? 'success' : (shopConn[v.id] === 'failed' ? 'error' : 'default')}
                                                text={<em style={{ fontSize: 12, color: '#595959' }}>
                                                    {shopConn[v.id] === 'success' ? __('Connected.') : (shopConn[v.id] === 'failed' ? __('Connect failed.') : __('Connecting.'))}
                                                </em>}
                                            />
                                        </h2>
                                        <div className={styles['shop-img']}>
                                            <img src={require('../../assets/img/' + v.market.toLowerCase() + '.png')} alt="" />
                                        </div>
                                        <ul className={styles['subject']}>
                                            <li>{__('Shop ID.')}: {v.shop_id}</li>
                                        </ul>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    }


                    <Row gutter={[12, 20]}>
                        <Col span={12}>
                            <div className={styles['dashboard-card']}>
                                <h2>
                                    <b>{__('Order number rate.')}</b>
                                    <InfoCircleOutlined style={{ color: "#595959", fontSize: 14 }} />
                                </h2>
                                <div ref={orderNumPercent} className={styles['pie-chart']}></div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className={styles['dashboard-card']}>
                                <h2>
                                    <b>{__('Order price rate.')}</b>
                                    <InfoCircleOutlined style={{ color: "#595959", fontSize: 14 }} />
                                </h2>
                                <div ref={orderPricePercent} className={styles['pie-chart']}></div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
            <Modal
                title={__('ERP version update logs.')}
                open={versionLogOpen}
                width={800}
                onCancel={() => { setVersionLogOpen(false) }}
                footer={[]}
                forceRender
            >
                <Steps
                    progressDot
                    current={0}
                    direction="vertical"
                    items={versionUpdateLogs}
                />
            </Modal>
        </div>
    );
}

/**
 connect(
    //mapStateToProps //使组件监听某个状态的改变
    //mapDispatchToProps //组件改变某个状态
    //以上两个connect参数会分配到props属性中
 )(被包装的组件)
 */

const mapStateToProps = ({
    shopConnectionReducer: { shop_connection },
    newVersionReducer: { new_version },
}) => {
    /** 以下属性挂载到 props 参数 */
    return {
        shop_connection,
        new_version,
    }
}

const mapDispatchToProps = {
    setShopConnection(conn) {
        return {
            type: 'set_shop_connection',
            payload: conn
        }
    },
    setNewVersion(updatable) {
        return {
            type: 'set_new_version',
            payload: updatable
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);