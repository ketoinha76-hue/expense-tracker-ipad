import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { MonthlySummaryItem, DailySummaryItem } from '../types';
import { formatVnd } from '../utils/currency';
import { Theme } from '../constants/theme';

interface Props {
  monthlyData?: MonthlySummaryItem[];
  dailyData?: DailySummaryItem[];
  theme: Theme;
  type: 'MONTHLY' | 'DAILY';
}

export const BarChartTrend: React.FC<Props> = ({
  monthlyData,
  dailyData,
  theme,
  type,
}) => {
  const chartHeight = 160;

  if (type === 'MONTHLY' && monthlyData) {
    const maxVal = Math.max(
      ...monthlyData.map((d) => Math.max(d.income, d.expense)),
      1
    );

    const barWidth = 14;
    const gap = 12;
    const totalWidth = monthlyData.length * (barWidth * 2 + gap) + 20;

    return (
      <View style={styles.container}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: theme.income }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Thu nhập</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: theme.expense }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Chi tiêu</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Svg width={totalWidth} height={chartHeight + 35}>
            {/* Base line */}
            <Line
              x1="0"
              y1={chartHeight}
              x2={totalWidth}
              y2={chartHeight}
              stroke={theme.border}
              strokeWidth="1"
            />

            {monthlyData.map((item, index) => {
              const x = index * (barWidth * 2 + gap) + 10;
              const incomeHeight = (item.income / maxVal) * (chartHeight - 20);
              const expenseHeight = (item.expense / maxVal) * (chartHeight - 20);

              return (
                <React.Fragment key={index}>
                  {/* Income Bar */}
                  <Rect
                    x={x}
                    y={chartHeight - incomeHeight}
                    width={barWidth}
                    height={incomeHeight}
                    fill={theme.income}
                    rx="3"
                  />
                  {/* Expense Bar */}
                  <Rect
                    x={x + barWidth + 2}
                    y={chartHeight - expenseHeight}
                    width={barWidth}
                    height={expenseHeight}
                    fill={theme.expense}
                    rx="3"
                  />
                  {/* Label */}
                  <SvgText
                    x={x + barWidth}
                    y={chartHeight + 18}
                    fill={theme.textSecondary}
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {item.monthLabel}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        </ScrollView>
      </View>
    );
  }

  if (type === 'DAILY' && dailyData) {
    const maxVal = Math.max(...dailyData.map((d) => d.amount), 1);
    const barWidth = 10;
    const gap = 6;
    const totalWidth = dailyData.length * (barWidth + gap) + 20;

    return (
      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Svg width={totalWidth} height={chartHeight + 35}>
            <Line
              x1="0"
              y1={chartHeight}
              x2={totalWidth}
              y2={chartHeight}
              stroke={theme.border}
              strokeWidth="1"
            />
            {dailyData.map((item, index) => {
              const x = index * (barWidth + gap) + 10;
              const h = (item.amount / maxVal) * (chartHeight - 20);

              return (
                <React.Fragment key={index}>
                  <Rect
                    x={x}
                    y={chartHeight - h}
                    width={barWidth}
                    height={h}
                    fill={item.amount > 0 ? theme.expense : theme.border}
                    rx="2"
                  />
                  {/* Show label every few days */}
                  {(item.day === 1 || item.day % 5 === 0) && (
                    <SvgText
                      x={x + barWidth / 2}
                      y={chartHeight + 18}
                      fill={theme.textSecondary}
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {item.day}
                    </SvgText>
                  )}
                </React.Fragment>
              );
            })}
          </Svg>
        </ScrollView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  legendRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
  },
});
