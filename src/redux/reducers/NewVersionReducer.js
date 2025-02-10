export const newVersionReducer = (prevState={new_version:false}, action) => {
    // console.log(action);
    let {type, payload} = action;

    switch (type) {
        case 'set_new_version':
            let newState = {...prevState};
            newState.new_version = payload;
            return newState;
        default: 
            return prevState;
    }
}