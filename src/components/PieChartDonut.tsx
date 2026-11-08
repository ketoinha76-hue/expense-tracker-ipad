import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { CategorySummaryItem } from '../types';
import { formatVnd } from '../utils/currency';
import { Theme } from '../constants/theme';

interface Props {
  data: CategorySummaryItem[];
  totalAmount: number;
  theme: Theme;
  size?: number;
}

export const PieChartDonut: React.FC<Props> = ({
  data,
  totalAmount,
  theme,
  size = 200,
}) => {
  if (!data || data.length === 0 || totalAmount <= 0) {
    return (
      <View style={[styles.emptyContainer, { height: size }]}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Chưa có dữ liệu giao dịch
        </Text>
      </View>
    );
  }

  const radius = size / 2;
  const strokeWidth = 28;
  const innerRadius = radius - strokeWidth;
  const center = radius;

  // Polar to Cartesian
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const createArc = (startAngle: number, endAngle: number, r: number) => {
    const start = polarToCartesian(center, center, r, endAngle);
    const end = polarToCartesian(center, center, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ');
  };

  let currentAngle = 0;
  const arcs = data.map((item) => {
    const sweepAngle = (item.percentage / 100) * 360;
    const start = currentAngle;
    const end = currentAngle + Math.max(sweepAngle, 1);
    currentAngle += sweepAngle;
    return {
      ...item,
      startAngle: start,
      endAngle: end,
      path: createArc(start, end, innerRadius + strokeWidth / 2),
    };
  });

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <G rotation={0} origin={`${center}, ${center}`}>
            {arcs.map((arc, index) => (
              <Path
                key={index}
                d={arc.path}
                stroke={arc.category.colorHex || theme.primary}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="butt"
              />
            ))}
          </G>
        </Svg>
        <View style={[styles.centerLabel, { width: innerRadius * 2, height: innerRadius * 2 }]}>
          <Text style={[styles.centerSubText, { color: theme.textSecondary }]}>Tổng cộng</Text>
          <Text style={[styles.centerTotalText, { color: theme.text }]} numberOfLines={1}>
            {formatVnd(totalAmount)}
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {data.slice(0, 6).map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: item.category.colorHex || theme.primary },
              ]}
            />
            <View style={styles.legendInfo}>
              <Text style={[styles.legendName, { color: theme.text }]} numberOfLines={1}>
                {item.category.name}
              </Text>
              <Text style={[styles.legendDetail, { color: theme.textSecondary }]}>
                {formatVnd(item.totalAmount)} ({item.percentage.toFixed(1)}%)
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  centerSubText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerTotalText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  legendContainer: {
    width: '100%',
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendInfo: {
    flex: 1,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '600',
  },
  legendDetail: {
    fontSize: 11,
    marginTop: 1,
  },
});
