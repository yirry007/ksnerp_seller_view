import React, { useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/login';
import Main from '../pages/main';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../redux/store';

function Router(props) {
    const [auth, setAuth] = useState(localStorage.getItem('token'));

    return (
        <HashRouter>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <Routes>
                        <Route exact path="/login" element={<Login set_auth={setAuth} />} />
                        <Route path="*" element={
                            auth
                                ? <Main />
                                : <Navigate to="/login" />}
                        />
                    </Routes>
                </PersistGate>
            </Provider>
        </HashRouter>
    );
}

export default Router;