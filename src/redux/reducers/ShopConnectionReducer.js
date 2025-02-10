export const shopConnectionReducer = (prevState={shop_connection:null}, action) => {
    // console.log(action);
    let {type, payload} = action;

    switch (type) {
        case 'set_shop_connection':
            let newState = {...prevState};
            newState.shop_connection = payload;
            return newState;
        default: 
            return prevState;
    }
}