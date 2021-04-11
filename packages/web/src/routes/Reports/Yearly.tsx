/**
 *
 * Ledger Web App Source Code.
 *
 * @license MIT
 * @copyright Toan Nguyen <nta.toan@gmail.com>
 *
 */
import { useMemo, useState } from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { scaleBand, scaleLinear } from 'd3-scale';
import truncate from 'truncate-zero';

import { Transaction } from '../../types.d';
import { use12Months } from './hooks';

const LEGEND_WIDTH = 50;

const useStyles = makeStyles((theme) => ({
    chart: {
        overflow: 'auto',
        flexGrow: 1,
        flexShrink: 0,
    },
    legend: {
        flexShrink: 0,
        flexGrow: 0,
        flexBasis: LEGEND_WIDTH,
    },
    row: {
        display: 'flex',
    },
}));

export default function Yearly({ transactions }: { transactions: Transaction[] }) {
    const classes = useStyles();
    const [margin, setMargin] = useState({ top: 20, bottom: 20, left: 20, right: 20 });
    const [canvasSize, setCanvasSize] = useState({
        width: 1256 - margin.left - margin.right,
        height: 400,
    });
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
                .paddingInner(0.2)
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
                            <g>
                                {moneyRange.ticks().map((t) => (
                                    <g transform={`translate(0, ${moneyRange(t)})`}>
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
                            </g>
                            {chartData.aggregation.map((m) => (
                                <g key={m.name}>
                                    <rect
                                        fill="#499195"
                                        x={barBand(m.name)}
                                        y={moneyRange(m.totalIncome)}
                                        height={chartHeight - moneyRange(m.totalIncome)}
                                        width={Math.floor(barBand.bandwidth() / 2)}
                                    />
                                    <rect
                                        fill="#f1592a"
                                        x={
                                            (barBand(m.name) || 0) +
                                            Math.floor(barBand.bandwidth() / 2)
                                        }
                                        y={moneyRange(m.totalExpense)}
                                        height={chartHeight - moneyRange(m.totalExpense)}
                                        width={Math.floor(barBand.bandwidth() / 2)}
                                    />
                                </g>
                            ))}
                        </g>
                    </svg>
                </div>
            </Grid>
        </Grid>
    );
}
