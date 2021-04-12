/**
 *
 * Ledger Web App Source Code.
 *
 * @license MIT
 * @copyright Toan Nguyen <nta.toan@gmail.com>
 *
 */

import { all, select, call, put, take, fork } from 'redux-saga/effects';
import {
    appLoadingAction,
    appSavingAction,
    appIdleAction,
    showMessageAction,
} from '../actions/system';
import {
    transactionList,
    transactionRequestAction,
    yearList,
    GET_TRANSACTION,
    RECORD_TRANSACTION,
    UPDATE_TRANSACTION,
    DELETE_TRANSACTION,
    GET_LIST_YEAR,
} from '../actions/trans';
import {
    HTTPResult,
    Action,
    Transaction,
    APIError,
    RemoteRepository,
    AppMessageCode,
    AppRootState,
} from '../types.d';

type YieldReturn<T> = T extends Promise<infer U> ? U : T;

/**
 * Fetch a list of transaction records by year
 */
export function* fetchTransactionRequest(repo: RemoteRepository, year: number) {
    yield fork(fetchYearListRequest, repo);

    try {
        yield put(appLoadingAction());
        const response: YieldReturn<ReturnType<typeof repo.getTransactions>> = yield call(
            repo.getTransactions,
            {
                year,
            }
        );

        if (response.ok) {
            yield put(transactionList(response.data as Transaction[]));
            yield put(appIdleAction());
        } else {
            yield put(showMessageAction((response as HTTPResult<APIError>).data.code));
        }
    } catch (e) {
        console.error(e);
        yield put(showMessageAction(AppMessageCode.NetworkError));
    }
}

/**
 * Fetch a list of years
 */
export function* fetchYearListRequest(repo: RemoteRepository) {
    const refetch: YieldReturn<ReturnType<(state: AppRootState) => boolean>> = yield select(
        (state) => state.transaction.refetchListYears
    );

    if (refetch) {
        try {
            const response: YieldReturn<ReturnType<typeof repo.getYears>> = yield call(
                repo.getYears
            );
            if (response.ok) {
                yield put(yearList(response.data as number[]));
            }
        } catch (e) {
            console.error(e);
            yield put(showMessageAction(AppMessageCode.NetworkError));
        }
    }
}

/**
 * Create a transactions
 */
export function* createTransactionRequest(repo: RemoteRepository, data: Omit<Transaction, 'id'>) {
    yield put(appSavingAction());
    const response: YieldReturn<ReturnType<typeof repo.createTransaction>> = yield call(
        repo.createTransaction,
        data
    );
    yield put(appIdleAction());

    if (response.ok) {
        const year: YieldReturn<ReturnType<(state: AppRootState) => number>> = yield select(
            (state) => state.transaction.year
        );
        yield put(transactionRequestAction(year));
    } else {
        yield put(showMessageAction((response as HTTPResult<APIError>).data.code));
    }
}

/**
 * Update a transaction
 */
export function* updateTransactionRequest(repo: RemoteRepository, data: Transaction) {
    yield put(appSavingAction());
    const response: YieldReturn<ReturnType<typeof repo.updateTransaction>> = yield call(
        repo.updateTransaction,
        data
    );
    yield put(appIdleAction());

    if (response.ok) {
        const year: YieldReturn<number> = yield select((state) => state.transaction.year);
        yield put(transactionRequestAction(year));
    } else {
        yield put(showMessageAction((response as HTTPResult<APIError>).data.code));
    }
}

/**
 * Delete a transaction
 */
export function* deleteTransactionRequest(repo: RemoteRepository, data: number) {
    yield put(appSavingAction());
    const response: YieldReturn<Promise<HTTPResult<any> | HTTPResult<APIError>>> = yield call(
        repo.deleteTransaction,
        data
    );
    yield put(appIdleAction());

    if (response.ok) {
        const year: YieldReturn<number> = yield select((state) => state.transaction.year);
        yield put(transactionRequestAction(year));
    } else {
        yield put(showMessageAction((response as HTTPResult<APIError>).data.code));
    }
}

/**
 * Watch for transaction fetching request.
 */
export function watchFetchRequest(repository: RemoteRepository) {
    return function* () {
        while (true) {
            const { payload }: Action<string, number> = yield take(GET_TRANSACTION);
            if (payload) {
                yield fetchTransactionRequest(repository, payload);
            }
        }
    };
}

/**
 * Watch for transaction creating request.
 */
export function watchCreatingRequest(repository: RemoteRepository) {
    return function* () {
        while (true) {
            const { payload } = yield take(RECORD_TRANSACTION);
            yield createTransactionRequest(repository, payload);
        }
    };
}

/**
 * Watch for transaction updating request.
 */
export function watchUpdatingRequest(repository: RemoteRepository) {
    return function* () {
        while (true) {
            const { payload } = yield take(UPDATE_TRANSACTION);
            yield updateTransactionRequest(repository, payload);
        }
    };
}

/**
 * Watch for transaction deleting request.
 */
export function watchDeletingRequest(repository: RemoteRepository) {
    return function* () {
        while (true) {
            const { payload } = yield take(DELETE_TRANSACTION);
            yield deleteTransactionRequest(repository, payload);
        }
    };
}

/**
 * Watch for years list request.
 */
export function watchYearRequest(repository: RemoteRepository) {
    return function* () {
        while (true) {
            yield take(GET_LIST_YEAR);
            yield fetchYearListRequest(repository);
        }
    };
}

export default function rootSaga(repository: RemoteRepository) {
    return function* () {
        yield all(
            [
                watchFetchRequest(repository),
                watchCreatingRequest(repository),
                watchUpdatingRequest(repository),
                watchDeletingRequest(repository),
                watchYearRequest(repository),
            ].map(fork)
        );
    };
}
