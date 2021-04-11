/**
 *
 * Ledger Web App Source Code.
 *
 * @license MIT
 * @copyright Toan Nguyen <nta.toan@gmail.com>
 *
 */
import { useMemo } from 'react';
import { Transaction, TransactionType } from '../../types.d';
import { getMonthName } from '../../utils/format';

/**
 * Aggregate transaction records by transaction type, transaction category and transction month
 */
export function useMonthlyReport({
    transactions,
    year,
    month,
}: {
    transactions: Transaction[];
    year: number;
    month: number;
}) {
    return useMemo(() => {
        const aggregateMonthlyIncome: { [key: string]: number } = {};
        const aggregateMonthlyExpense: { [key: string]: number } = {};
        let totalMonthlyIncome = 0;
        let totalMonthlyExpense = 0;
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month, 1);
        lastDayOfMonth.setMonth(month + 1);

        transactions.forEach((tran) => {
            if (tran.date >= firstDayOfMonth && tran.date < lastDayOfMonth) {
                if (tran.transactionType === 'in') {
                    aggregateMonthlyIncome[tran.category] =
                        aggregateMonthlyIncome[tran.category] || 0;
                    aggregateMonthlyIncome[tran.category] += tran.amount;
                    totalMonthlyIncome += tran.amount;
                } else {
                    aggregateMonthlyExpense[tran.category] =
                        aggregateMonthlyExpense[tran.category] || 0;
                    aggregateMonthlyExpense[tran.category] += tran.amount;
                    totalMonthlyExpense += tran.amount;
                }
            }
        });

        return {
            income: {
                list: Object.entries(aggregateMonthlyIncome).map(([k, v]) => ({
                    name: k,
                    total: v,
                })),
                total: totalMonthlyIncome,
            },
            expense: {
                list: Object.entries(aggregateMonthlyExpense).map(([k, v]) => ({
                    name: k,
                    total: v,
                })),
                total: totalMonthlyExpense,
            },
        };
    }, [transactions, year, month]);
}

export interface MonthAggregation {
    name: string;
    totalIncome: number;
    totalExpense: number;
}

/**
 * Aggregate income and expense by months.
 */
export function use12Months(
    transactions: Transaction[]
): { aggregation: MonthAggregation[]; min: number; max: number } {
    return useMemo<{ aggregation: MonthAggregation[]; min: number; max: number }>(() => {
        let min = 0;
        let max = 0;
        const months: MonthAggregation[] = [];
        for (let i = 0; i < 12; i++) {
            months[i] = {
                name: getMonthName(i),
                totalIncome: 0,
                totalExpense: 0,
            };
        }

        if (!transactions.length) {
            return { aggregation: months, min, max };
        }

        transactions.forEach((t: Transaction) => {
            const month = t.date.getMonth();
            if (t.transactionType === TransactionType.Expense) {
                months[month].totalExpense += t.amount;
            } else {
                months[month].totalIncome += t.amount;
            }
        });

        min = months[0].totalIncome;
        max = months[0].totalIncome;

        months.forEach((m) => {
            const totalMin = Math.min(m.totalIncome, m.totalExpense);
            const totalMax = Math.max(m.totalIncome, m.totalExpense);
            if (min > totalMin) {
                min = totalMin;
            }
            if (max < totalMax) {
                max = totalMax;
            }
        });

        return { aggregation: months, min, max };
    }, [transactions]);
}
