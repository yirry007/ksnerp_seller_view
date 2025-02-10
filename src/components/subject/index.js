import { Space, Tooltip } from "antd";
import { QuestionCircleOutlined } from '@ant-design/icons';

function Subject(props) {
    return (
        <Tooltip placement="top" title={props.content}>
            <Space onClick={props.click} style={{cursor: 'pointer'}}>
                {props.title}
                <QuestionCircleOutlined />
            </Space>
        </Tooltip>

    );
}

export default Subject;