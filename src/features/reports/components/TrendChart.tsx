import type { MarkerTrend } from '@sparshtomar/olive-shared';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { shortDate } from '@/lib/format';
import { colors, fonts } from '@/ui';

const HEIGHT = 180;
const PAD = { top: 16, bottom: 28, left: 8, right: 8 };

/** Marker history with the healthy range shaded, so direction and distance-to-range are both visible. */
export const TrendChart = ({ trend, width }: { trend: MarkerTrend; width: number }) => {
  const values = trend.history.map((h) => h.value);
  const { low, high } = trend.range;
  const lo = Math.min(...values, low ?? Infinity, high ?? Infinity);
  const hi = Math.max(...values, high ?? -Infinity, low ?? -Infinity);
  const span = hi - lo || hi || 1;
  const min = lo - span * 0.2;
  const max = hi + span * 0.2;

  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (trend.history.length === 1 ? innerW / 2 : (i / (trend.history.length - 1)) * innerW);
  const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * innerH;

  const bandTop = y(high ?? max);
  const bandBottom = y(low ?? min);

  return (
    <View
      accessible
      accessibilityLabel={trend.history.map((h) => `${shortDate(h.date)}: ${h.value} ${trend.unit}`).join(', ')}
    >
      <Svg width={width} height={HEIGHT}>
        <Rect
          x={PAD.left}
          y={bandTop}
          width={innerW}
          height={Math.max(bandBottom - bandTop, 0)}
          fill={colors.primarySoft}
          rx={6}
        />
        {high !== undefined ? (
          <Line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={y(high)}
            y2={y(high)}
            stroke={colors.primary}
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        ) : null}
        {low !== undefined ? (
          <Line
            x1={PAD.left}
            x2={width - PAD.right}
            y1={y(low)}
            y2={y(low)}
            stroke={colors.primary}
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        ) : null}
        <Polyline
          points={trend.history.map((h, i) => `${x(i)},${y(h.value)}`).join(' ')}
          stroke={colors.text}
          strokeWidth={2.5}
          fill="none"
          strokeLinejoin="round"
        />
        {trend.history.map((h, i) => {
          const inRange = (low === undefined || h.value >= low) && (high === undefined || h.value <= high);
          return (
            <Circle
              key={h.reportId + i}
              cx={x(i)}
              cy={y(h.value)}
              r={6}
              fill={inRange ? colors.primary : colors.warm}
              stroke={colors.surface}
              strokeWidth={2}
            />
          );
        })}
        {trend.history.map((h, i) => (
          <SvgText
            key={`l${h.reportId}${i}`}
            x={x(i)}
            y={HEIGHT - 8}
            fontSize={11}
            fontFamily={fonts.regular}
            fill={colors.textMuted}
            textAnchor={
              trend.history.length === 1
                ? 'middle'
                : i === 0
                  ? 'start'
                  : i === trend.history.length - 1
                    ? 'end'
                    : 'middle'
            }
          >
            {shortDate(h.date)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};

/** Compact version for marker cards. */
export const Sparkline = ({
  values,
  width = 72,
  height = 28,
  color = colors.text,
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) => {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * (width - 6) + 3},${height - 3 - ((v - min) / span) * (height - 6)}`)
    .join(' ');
  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
};
