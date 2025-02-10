import { __ } from "../../utils/functions";

function Delivery(props) {
    return (
        <iframe
            title={__('Express tracking.')}
            src={`https://m.kuaidi.com/queryresults.html?nu=${props.deliveryNumber}`}
            border="0"
            style={{width: '100%', height: '900px'}}
        />
    );
}

export default Delivery;