import { legacy_createStore, combineReducers } from 'redux';
import { shopConnectionReducer } from './reducers/ShopConnectionReducer';
import { newVersionReducer } from './reducers/NewVersionReducer';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const persistConfig = {
    key: 'ksnerp_reducers',
    storage,
    whitelist: [
        'shopConnectionReducer',
        'newVersionReducer',
    ]
}

const reducer = combineReducers({
    shopConnectionReducer,
    newVersionReducer
});

//reducer进行持久化处理
const persistedReducer = persistReducer(persistConfig, reducer)

const store = legacy_createStore(persistedReducer);
const persistor = persistStore(store);

export { store, persistor };