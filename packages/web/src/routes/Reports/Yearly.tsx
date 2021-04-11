/**
 *
 * Ledger Web App Source Code.
 *
 * @license MIT
 * @copyright Toan Nguyen <nta.toan@gmail.com>
 *
 */
import { useMemo } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { scaleBand, scaleLinear } from 'd3-scale';
import truncate from 'truncate-zero';

import { Transaction } from '../../types.d';
import { use12Months } from './hooks';

const LEGEND_WIDTH = 50;
const CHART_WIDTH = 1500;
const COL_GAP = 2;
const INCOME_COLOR = '#499195';
const EXPENSE_COLOR = '#f1592a';

const useStyles = makeStyles((theme) => ({
    chart: {
        overflow: 'auto',
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: `calc(100% - ${LEGEND_WIDTH}px)`,
    },
    legend: {
        flexShrink: 0,
        flexGrow: 0,
        flexBasis: LEGEND_WIDTH,
    },
    row: {
        display: 'flex',
    },
    income: {
        height: 20,
        width: 30,
        marginBottom: 4,
        background: INCOME_COLOR,
        '&:after': {
            content: '"Income"',
            marginLeft: 35,
        },
    },
    expense: {
        height: 20,
        width: 30,
        background: EXPENSE_COLOR,
        '&:after': {
            content: '"Expense"',
            marginLeft: 35,
        },
    },
    titlePanel: {
        display: 'flex',
    },
}));

const margin = { top: 20, bottom: 20, left: 20, right: 20 };
const canvasSize = {
    width: CHART_WIDTH - margin.left - margin.right,
    height: 400,
};

export default function Yearly({
    transactions,
    year,
}: {
    year: number;
    transactions: Transaction[];
}) {
    const classes = useStyles();
    const chartData = use12Months(transactions);
    /**
     * Real size of chart.
     */
    const chartWidth = canvasSize.width - margin.left - margin.right;
    const chartHeight = canvasSize.height - margin.top - margin.bottom;

    /**
     * Calculate scales
     */
    const barBand = useMemo(
        () =>
            scaleBand()
                .paddingInner(0.35)
                .paddingOuter(0.2)
                .align(0.5)
                .domain(chartData.aggregation.map((a) => a.name))
                .range([0, chartWidth]),
        [chartData.aggregation, chartWidth]
    );
    const moneyRange = useMemo(
        () =>
            scaleLinear()
                .domain([Math.floor(chartData.min), Math.floor(chartData.max)])
                .range([chartHeight, 0]),
        [chartHeight, chartData.max, chartData.min]
    );

    return (
        <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12}>
                <Typography variant="h5" component="h2">
                    Transaction in {year}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <div className={classes.income} />
                <div className={classes.expense} />
            </Grid>
            <Grid item xs={12} sm={12} className={classes.row}>
                <svg
                    viewBox={`0 0 ${LEGEND_WIDTH} ${canvasSize.height}`}
                    height={canvasSize.height}
                    width={LEGEND_WIDTH}
                    className={classes.legend}>
                    <g transform={`translate(0, ${margin.top})`}>
                        {moneyRange.ticks().map((t) => (
                            <g transform={`translate(0, ${moneyRange(t)})`}>
                                <text>${truncate(t)}</text>
                            </g>
                        ))}
                    </g>
                </svg>
                <div className={classes.chart}>
                    <svg
                        viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
                        height={canvasSize.height}
                        width={canvasSize.width}>
                        <g transform={`translate(${margin.left}, ${margin.top})`}>
                            {moneyRange.ticks().map((t) => (
                                <g transform={`translate(0, ${moneyRange(t)})`} key={t}>
                                    <line
                                        x1={0}
                                        y1={0}
                                        x2={chartWidth}
                                        y2={0}
                                        stroke="currentColor"
                                        strokeOpacity={0.2}
                                    />
                                </g>
                            ))}
                            {chartData.aggregation.map((m) => {
                                const w = Math.floor(barBand.bandwidth() / 2);
                                return (
                                    <g key={m.name}>
                                        <rect
                                            fill={INCOME_COLOR}
                                            x={barBand(m.name)}
                                            y={moneyRange(m.totalIncome)}
                                            height={chartHeight - moneyRange(m.totalIncome)}
                                            width={w - COL_GAP / 2}
                                        />
                                        <rect
                                            fill={EXPENSE_COLOR}
                                            x={(barBand(m.name) || 0) + w + COL_GAP / 2}
                                            y={moneyRange(m.totalExpense)}
                                            height={chartHeight - moneyRange(m.totalExpense)}
                                            width={w - COL_GAP / 2}
                                        />
                                        <text
                                            x={(barBand(m.name) || 0) + w}
                                            y={chartHeight + 14}
                                            textAnchor="middle">
                                            {m.name}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>
            </Grid>
        </Grid>
    );
}
