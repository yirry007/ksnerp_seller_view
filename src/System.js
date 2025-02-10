import * as echarts from 'echarts';

/** Dashboard 折线图配置 */
export const lineChartOption = (xAxisData, yAxisData) => (
    {
        height: 95,
        grid: {
            top: 20,
            left: 36,
            right: 0
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xAxisData,
            show: false,
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: yAxisData,
                type: 'line',
                smooth: true,
                symbol: 'none',
                itemStyle: {
                    color: '#1677ff'
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: '#bae0ff'
                        },
                        {
                            offset: 1,
                            color: '#1677ff'
                        }
                    ])
                },
            }
        ]
    }
);

/** Dashboard 饼图配置 */
export const pieChartOption = (name, data) => (
    {
        legend: {
            top: '0%',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        series: [
            {
                name: name,
                type: 'pie',
                radius: ['30%', '70%'],
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    position: 'outer',
                    alignTo: 'edge',
                    margin: 20
                },
                data: data
            }
        ]
    }
);

/** 初始化入库商品的 SKU */
export const initSku = (defaultData = {keys: []}) => {
    const _keys = defaultData.keys && defaultData.keys.length > 0 ? defaultData.keys : [null, null];

    return _keys.map((v, k) => {
        return {
            key: v ? v : '',
            values: [
                {
                    val: "",
                    image: "",
                    isFirst: true,
                }
            ],
            hasImage: k === 0,
            enable: v === null,
        }
    });
};