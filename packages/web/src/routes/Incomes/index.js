import { useMemo, useEffect, useRef, useState } from 'react';
import { ButtonGroup, Button } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';

import Setting from '../../components/Icons/Setting';
import Plus from '../../components/Icons/Plus';
import BlockHeader from '../../components/BlockHeader';
import VirtualTable from '../../components/VirtualTable';
import SettingDialog from '../../components/SettingDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatLongDate, formatCurrency } from '../../utils/format';
import FormDialog from './Form';

const headerHeight = 60;
const rowHeight = 60;
const templateCols = [
    {
        label: 'Date',
        dataKey: 'date',
        align: 'left',
        rowHeight,
        headerHeight,
        width: 20, // percent
        format: formatLongDate,
    },
    {
        label: 'Amount',
        dataKey: 'amount',
        align: 'right',
        rowHeight,
        headerHeight,
        width: 18, // percent
        format: formatCurrency,
    },
    {
        label: 'Description',
        dataKey: 'description',
        align: 'left',
        rowHeight,
        headerHeight,
        width: 30, // percent
    },
    {
        label: 'Category',
        dataKey: 'category',
        align: 'left',
        rowHeight,
        headerHeight,
        width: 20, // percent
    },
    {
        label: '',
        dataKey: '2_buttons',
        align: 'right',
        rowHeight,
        headerHeight,
        width: 12, // percent
    },
];

export default function IncomeList() {
    const openSettingDialog = useSelector((state) => state.inTrans.openSettingForm);
    const openFormDialog = useSelector((state) => state.inTrans.openDialog);
    const imcomeList = useSelector((state) => state.ins.list);
    const fetching = useSelector((state) => state.ins.loading);
    const totalRecords = useSelector((state) => state.ins.totalRecords);
    const categories = useSelector((state) => state.inCates.list);
    const searchByDateFrom = useSelector((state) => state.ins.lookup.dateFrom);
    const searchByDateTo = useSelector((state) => state.ins.lookup.dateTo);
    const searchByCategory = useSelector((state) => state.ins.lookup.category);
    const orderField = useSelector((state) => state.ins.sort.field);
    const orderDirection = useSelector((state) => state.ins.sort.direction);
    const fetchedTotalRecords = useSelector((state) => state.ins.fetchedTotalRecords);

    const dispatch = useDispatch();

    const loaderRef = useRef(null);
    const resolver = useRef(null);
    const [deletingIncomeId, setDeletingIncomeId] = useState(0);

    const columns = useMemo(() => {
        return templateCols.map((c) => {
            if (c.dataKey === orderField) {
                return {
                    ...c,
                    direction: orderDirection,
                };
            }
            return c;
        });
    }, [orderField, orderDirection]);

    /**
     * After fetched income rows, call resolver to trigger table's render
     */
    useEffect(() => {
        if (fetching) {
            resolver.current();
        }
    }, [fetching]);

    useEffect(() => {
        if (!fetchedTotalRecords && loaderRef.current !== null) {
            loaderRef.current.resetLoadMoreRowsCache(true);
        }
        dispatch({ type: 'Saga: fetch incomes categories' });
    }, [fetchedTotalRecords, dispatch]);

    useEffect(() => {
        dispatch({ type: 'Saga: fetch incomes categories' });
    }, [dispatch]);

    const handleLoadMore = ({ startIndex, stopIndex }) => {
        dispatch({
            type: 'Saga: request more income records',
            payload: { startIndex, stopIndex },
        });
        return new Promise((resolve) => {
            resolver.current = resolve;
        });
    };

    return (
        <>
            <BlockHeader title="Incomes Transactions" totalRecords={fetchedTotalRecords ? totalRecords : 0}>
                <ButtonGroup variant="text" disableElevation>
                    <Button
                        onClick={() => {
                            dispatch({ type: 'Reducer - inTrans: open form dialog' });
                        }}
                    >
                        <Plus />
                    </Button>
                    <Button
                        onClick={() => {
                            dispatch({ type: 'Reducer - inTrans: open setting form' });
                        }}
                    >
                        <Setting />
                    </Button>
                </ButtonGroup>
            </BlockHeader>
            <VirtualTable
                loaderRef={loaderRef}
                totalRows={totalRecords}
                onLoadMore={handleLoadMore}
                rows={imcomeList}
                columns={columns}
                headerHeight={headerHeight}
                rowHeight={rowHeight}
                onDelete={({ rowData }) => {
                    setDeletingIncomeId(rowData.id);
                }}
                onEdit={({ rowData: vals }) => {
                    dispatch({ type: 'Reducer - inTrans: set amount of income', payload: vals.amount });
                    dispatch({ type: 'Reducer - inTrans: set date of income', payload: vals.date });
                    dispatch({ type: 'Reducer - inTrans: set description of income', payload: vals.description });
                    dispatch({ type: 'Reducer - inTrans: set category of income', payload: vals.category });
                    dispatch({ type: 'Reducer - inTrans: open form dialog' });
                }}
            />
            <SettingDialog
                categories={categories}
                category={searchByCategory}
                from={searchByDateFrom}
                to={searchByDateTo}
                orderField={orderField}
                orderDirection={orderDirection}
                open={openSettingDialog}
                onClose={() => {
                    dispatch({ type: 'Reducer - inTrans: close setting form' });
                }}
                onSubmit={(payload) => {
                    dispatch({
                        type: 'Saga: update sort and lookup of incomes',
                        payload,
                    });
                    dispatch({ type: 'Reducer - inTrans: close setting form' });
                }}
            />
            <FormDialog open={openFormDialog} />
            <ConfirmDialog
                title="Deleting Confirmation"
                text="You are deleting income transaction. Do you want it?"
                open={deletingIncomeId > 0}
                onYes={() => {
                    dispatch({ type: 'Saga - ins: delete income transation', payload: deletingIncomeId });
                    setDeletingIncomeId(0);
                }}
                onClose={() => {
                    setDeletingIncomeId(0);
                }}
            />
        </>
    );
}