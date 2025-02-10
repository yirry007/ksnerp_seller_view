import { Button, Col, Form, Input, Row, Select, Table, Transfer, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Loading from '../../components/loading';
import { ExcelTemplateAction } from '../../actions/ExcelTemplateAction';
import { excelTypeMap } from '../../Constants';
import { __ } from '../../utils/functions';

function ExcelTemplateEdit(props) {
    const [exportFields, setExportFields] = useState([]);//Excel字段列表
    const [targetFields, setTargetFields] = useState([]);//已被选择的字段（右侧）
    const [loading, setLoading] = useState('none');
    const [form] = Form.useForm();

    useEffect(() => {
        getExportFields(props.template.type);
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    /** 获取Excel输出字段列表 */
    const getExportFields = async (type) => {
        setLoading('block');

        const res = await ExcelTemplateAction.exportFields(type);

        let propsFields = [];
        try {
            propsFields = JSON.parse(props.template.fields);
        } catch (e) {
            console.log(e);
        }

        if (res.code === '') {
            const _exportFields = res.result;//所有字段
            const _targetFields = [];//已选的右侧Table字段
            
            /** 以 propsFields 的字段顺序为基准生成列表 */
            propsFields.forEach(v=>{
                _exportFields.forEach((v1, k1)=>{
                    if (v === v1.column) {
                        _targetFields.push({
                            key: v1.index.toString(),
                            field: v1.name,
                            column: v1.column
                        });

                        _exportFields.splice(k1, 1);
                    }
                });
            });

            /** 设置Excel所有输出字段列表（放入右侧Table的字段和剩余的字段合并） */
            setExportFields([
                ..._exportFields.map(v=>(
                    {
                        key: v.index.toString(),
                        field: v.name,
                        column: v.column
                    }
                )),
                ..._targetFields
            ]);

            /** 设置Excel已选（右侧Table）输出字段列表 */
            setTargetFields(_targetFields);
        }

        setLoading('none');
    }

    const initValue = props.template;//表单初始值

    /**
     * 字段列表拖拽释放时触发事件
     * 通过 arrayMove 方法修改改变字段元素在数组中的位置
     * @param {*} param0 
     */
    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            if (targetFields.find(v=>v.key === active.id)) {
                /** 拖拽右侧列表项目 */
                setTargetFields((previous) => {
                    const activeIndex = previous.findIndex((i) => i.key === active.id);
                    const overIndex = previous.findIndex((i) => i.key === over?.id);
                    return arrayMove(previous, activeIndex, overIndex);
                });
            }

            setExportFields((previous) => {
                const activeIndex = previous.findIndex((i) => i.key === active.id);
                const overIndex = previous.findIndex((i) => i.key === over?.id);
                return arrayMove(previous, activeIndex, overIndex);
            });
        }
    };

    /** Excel输出字段表格行元素tr，因为点击 MenuOutlined 图标拖拽，只能这样重写后渲染 */
    const TableRow = ({ children, ...props }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            setActivatorNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({
            id: props['data-row-key'],
        });
        const style = {
            ...props.style,
            transform: CSS.Transform.toString(
                transform && {
                    ...transform,
                    scaleY: 1,
                },
            ),
            transition,
            ...(isDragging
                ? {
                    position: 'relative',
                    zIndex: 9999,
                }
                : {}),
        };
        return (
            <tr {...props} ref={setNodeRef} style={style} {...attributes}>
                {React.Children.map(children, (child) => {
                    if (child.key === 'sort') {
                        return React.cloneElement(child, {
                            children: (
                                <MenuOutlined
                                    ref={setActivatorNodeRef}
                                    style={{
                                        touchAction: 'none',
                                        cursor: 'move',
                                    }}
                                    {...listeners}
                                />
                            ),
                        });
                    }
                    return child;
                })}
            </tr>
        );
    };

    /** 穿梭框的 Table */
    const TableTransfer = ({ ...restProps }) => (
        <Transfer {...restProps}>
            {({
                filteredItems,
                onItemSelect,
                selectedKeys: listSelectedKeys
            }) => {
                const rowSelection = {
                    onSelect({ key }, selected) {//点击行 checkbox
                        onItemSelect(key, selected);
                    },
                    selectedRowKeys: listSelectedKeys,//点击 table row 勾选行
                };
                return (
                    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                        <SortableContext
                            // rowKey array
                            items={exportFields.map((i) => i.key)}
                            strategy={verticalListSortingStrategy}
                        >
                            <Table
                                components={{
                                    body: {
                                        row: TableRow,
                                    },
                                }}
                                rowSelection={rowSelection}
                                columns={orderColumns}
                                dataSource={filteredItems}
                                size="small"
                                showHeader={false}
                                pagination={false}
                                onRow={({ key }) => ({
                                    onClick: () => {
                                        onItemSelect(key, !listSelectedKeys.includes(key));
                                    },
                                })}
                            />
                        </SortableContext>
                    </DndContext>
                );
            }}
        </Transfer>
    );

    /** 穿梭框 Table column */
    const orderColumns = [
        {
            key: 'sort',
        },
        {
            dataIndex: 'field',
            title: 'Export Fields',
        },
    ];

    /** 穿梭框左移右移操作 */
    const onChange = (nextTargetKeys) => {
        /** 设置穿梭框移动到右侧的项目（该数据用于渲染与拖拽排序） */
        setTargetFields(exportFields.filter(v=>nextTargetKeys.includes(v.key)));
    };

    const onSubmit = async (values) => {
        setLoading('block');

        if (targetFields.length === 0) {
            setLoading('none');
            message.error(__('Please select export fields.'));
            return false;
        }

        const fieldsList = targetFields.map(v=>v.column);

        const res = await ExcelTemplateAction.update(props.template.id, {...values, fields: fieldsList});
        res && props.updated();

        setLoading('none');
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={initValue}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="type"
                        label={__('Template type.')}
                        rules={[{ required: true, message: __('Please select template type.') }]}
                    >
                        <Select placeholder={__('Please select template type.')} onChange={(v)=>{getExportFields(v)}}>
                            {Object.keys(excelTypeMap).map(v => <Select.Option value={v} key={v}>{excelTypeMap[v]}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="title"
                        label={__('Template title.')}
                        rules={[{ required: true, message: __('Please input template title.') }]}
                    >
                        <Input placeholder={__('Please input template title.')} />
                    </Form.Item>
                </Col>
            </Row>

            <TableTransfer
                dataSource={exportFields}
                targetKeys={targetFields.map(v=>v.key)}
                onChange={onChange}
                style={{ marginBottom: 16 }}
                titles={[__('Fields selection.'), __('Fields selected.')]}
            />

            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">{__('submit.')}</Button>
            </Form.Item>

            <Loading loading={loading} />
        </Form>
    );
}

export default ExcelTemplateEdit;