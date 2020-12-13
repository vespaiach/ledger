import { call, debounce, all, put, select } from 'redux-saga/effects';
import axios from 'axios';

function* fetchTotalRecords() {
    const fetchedTotalRecords = yield select(
        (state) => state.incomes.fetchedTotalRecords
    );

    if (fetchedTotalRecords) {
        return;
    }

    const { search } = yield select((state) => state.incomes);

    const params = {};
    if (search.dateFrom) {
        params.from = search.dateFrom;
    }
    if (search.dateTo) {
        params.to = search.dateTo;
    }
    if (search.category) {
        params.cate = search.category;
    }

    const result = yield call(axios.get, '/incomes/count', { params });

    yield put({
        type: 'Reducer: save total records',
        payload: {
            totalRecords: result.data.total,
            totalPage: result.data.pages,
            perPage: result.data.perPage,
        },
    });
}

/**
 * Check in state to see which pages are fetched because we don't need to re-fetch them.
 */
function* getListofPageToFetch(startRecordIndex, endRecordIndex) {
    const { perPage, fetchedPages } = yield select((state) => state.incomes);

    let startPage = Math.floor((startRecordIndex + 1) / perPage);
    if ((startRecordIndex + 1) % perPage !== 0) {
        startPage += 1;
    }

    let endPage = Math.floor((endRecordIndex + 1) / perPage);
    if ((endRecordIndex + 1) % perPage !== 0) {
        endPage += 1;
    }

    const pageToFetch = [];
    for (let i = startPage; i <= endPage; i++) {
        if (!fetchedPages[i]) {
            pageToFetch.push(i);
        }
    }

    return pageToFetch;
}

function* fetchMoreIncomes(page) {
    const { order, search } = yield select((state) => state.incomes);

    const params = {
        pg: page,
        by: `${order.direction === 'desc' ? '-' : ''}${order.field}`,
    };
    if (search.dateFrom) {
        params.from = search.dateFrom;
    }
    if (search.dateTo) {
        params.to = search.dateTo;
    }
    if (search.category) {
        params.cate = search.category;
    }

    const result = yield call(axios.get, '/incomes', { params });
    yield put({
        type: 'Reducer: save income records',
        payload: {
            list: result.data,
            page,
        },
    });
}

export function* watchFetchMoreIncomesRequest() {
    yield debounce(
        500,
        'Saga: request more income records',
        function* ({ payload }) {
            yield put({ type: 'Reducer: set fetching on' });

            yield fetchTotalRecords();

            const pageToFetch = yield getListofPageToFetch(
                payload.startIndex,
                payload.stopIndex
            );

            if (pageToFetch.length) {
                yield all(pageToFetch.map((pg) => fetchMoreIncomes(pg)));
            }

            yield put({ type: 'Reducer: set fetching off' });
        }
    );
}
