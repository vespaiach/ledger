import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all, fork } from 'redux-saga/effects';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';

import { watchSubmitSignupForm } from '../routes/Signup/saga';
import { watchSubmitSigninForm } from '../routes/Signin/saga';
import { watchSubmitRecoveryForm } from '../routes/Recovery/saga';
import { watchFetchIncomeListRequest } from '../routes/IncomeList/saga';
import {
    watchSaveIncomesRequest,
    watchFetchIncomeDetailRequest,
    watchEditIncomeRequest,
    watchAddIncomeRequest,
} from '../routes/IncomeForm/saga';
import { watchDeleteIncomeRequest } from '../routes/IncomeList/saga';
import { watchFetchMeRequest } from '../App/saga';
import app from '../App/store';
import signup from '../routes/Signup/store';
import signin from '../routes/Signin/store';
import recovery from '../routes/Recovery/store';
import ins from '../routes/IncomeList/store';
import inForm from '../routes/IncomeForm/store';

const history = createBrowserHistory();
const sagaMiddleware = createSagaMiddleware({
    onError: (e) => {
        console.error(e);
    },
});
const typedWindow = typeof window !== 'undefined' && window;
const composeEnhancers =
    (process.env.NODE_ENV === 'development' &&
        typeof typedWindow !== 'undefined' &&
        typedWindow.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
        typedWindow.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            trace: true,
            traceLimit: 25,
        })) ||
    compose;

const store = createStore(
    combineReducers({
        router: connectRouter(history),
        app,
        signup,
        signin,
        recovery,
        ins,
        inForm,
    }),
    composeEnhancers(applyMiddleware(sagaMiddleware, routerMiddleware(history)))
);

const saga = function* rootSaga() {
    yield all(
        [
            watchSubmitSignupForm,
            watchSubmitSigninForm,
            watchSubmitRecoveryForm,
            watchFetchIncomeListRequest,
            watchFetchMeRequest,
            watchSaveIncomesRequest,
            watchDeleteIncomeRequest,
            watchFetchIncomeDetailRequest,
            watchEditIncomeRequest,
            watchAddIncomeRequest,
        ].map(fork)
    );
};
sagaMiddleware.run(saga);

export { history };
export default store;
