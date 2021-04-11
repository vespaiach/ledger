/**
 *
 * Ledger Web App Source Code.
 *
 * @license MIT
 * @copyright Toan Nguyen <nta.toan@gmail.com>
 *
 */
import { Box, Container, IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons/';
import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';

import { getMonthName } from '../../utils/format';
import Monthly from './Monthly';
import { AppRootState, Transaction } from '../../types.d';
import Yearly from './Yearly';
import { transactionRequestAction } from '../../actions/trans';

const useStyles = makeStyles((theme) => ({
    padding: {
        height: 48,
        background: theme.palette.primary.dark,
    },
    pageHead: {
        zIndex: 1002,
        position: 'sticky',
        top: -60,
    },
    pageHeadTitle: {
        background: theme.palette.primary.dark,
        color: theme.palette.common.white,
        padding: theme.spacing(2),
    },
    pageSubMenu: {
        background: theme.palette.primary.dark,
        color: theme.palette.common.white,
        padding: theme.spacing(0, 2, 0, 2),
        display: 'flex',
        '& .MuiTypography-body1': {
            display: 'flex',
            alignItems: 'center',
        },
    },
    grow: {
        flexGrow: 1,
        height: 48,
    },
    pageContainer: {
        marginTop: theme.spacing(4),
    },
}));

const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export default function Report() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const monthPopupState = usePopupState({ variant: 'popover', popupId: 'monthMenu' });
    const yearPopupState = usePopupState({ variant: 'popover', popupId: 'yearMenu' });

    const years = useSelector<AppRootState, number[]>((state) => state.transaction.years);
    const transactions = useSelector<AppRootState, Transaction[]>(
        (state) => state.transaction.list
    );

    const [month, setMonth] = useState(() => {
        return new Date().getMonth();
    });
    const [year, setYear] = useState(() => {
        return new Date().getFullYear();
    });

    /**
     * Load transactions by year
     */
    useEffect(() => {
        dispatch(transactionRequestAction(year));
    }, [year, dispatch]);

    let el = null;
    if (month !== -1) {
        el = <Monthly transactions={transactions} year={year} month={month} />;
    } else {
        el = <Yearly year={year} transactions={transactions} />;
    }

    console.log(month);

    return (
        <>
            <Box boxShadow={3} className={classes.pageHead}>
                <div className={classes.padding} />
                <div className={classes.pageHeadTitle}>
                    <Typography variant="h6" component="h1">
                        Reports
                    </Typography>
                </div>
                <div className={classes.pageSubMenu}>
                    <Typography {...bindTrigger(yearPopupState)} role="menu">
                        <span>{year}</span>
                        <ArrowDropDownIcon />
                    </Typography>
                    <Menu {...bindMenu(yearPopupState)}>
                        {years.map((y) => (
                            <MenuItem
                                key={y}
                                selected={year === y}
                                onClick={() => {
                                    setYear(y);
                                    yearPopupState.close();
                                }}>
                                {y}
                            </MenuItem>
                        ))}
                    </Menu>
                    <Typography {...bindTrigger(monthPopupState)} role="menu">
                        <span>{getMonthName(month)}</span>
                        <ArrowDropDownIcon />
                    </Typography>
                    <Menu {...bindMenu(monthPopupState)}>
                        <MenuItem
                            key={-1}
                            selected={month === -1}
                            onClick={() => {
                                setMonth(-1);
                                monthPopupState.close();
                            }}>
                            All months
                        </MenuItem>
                        {months.map((m) => (
                            <MenuItem
                                key={m}
                                selected={month === m}
                                onClick={() => {
                                    setMonth(m);
                                    monthPopupState.close();
                                }}>
                                {getMonthName(m)}
                            </MenuItem>
                        ))}
                    </Menu>
                    <div className={classes.grow} />
                </div>
            </Box>
            <Container classes={{ root: classes.pageContainer }}>{el}</Container>
        </>
    );
}
