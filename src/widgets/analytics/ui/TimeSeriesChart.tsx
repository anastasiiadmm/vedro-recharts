import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { useAppDispatch, useAppSelector, useAppStoreInstance, AppStoreActions } from '@/app/store';
import { StationTimeSeriesPoint } from '@/shared/types';
import './Analytics.scss';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isCurrent?: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__header">Hour: {label}</div>

      <div className="chart-tooltip__list">
        {payload.map((item: any, index: number) => (
          <div key={index} className="chart-tooltip__row">
            <span className="chart-tooltip__row-label">
              <span className="chart-tooltip__dot" style={{ backgroundColor: item.color }} />
              <span style={{ color: item.color }}>{item.name}:</span>
            </span>
            <span className="chart-tooltip__row-val">
              {item.value} {item.unit || ''}
            </span>
          </div>
        ))}
      </div>
      <div className="chart-tooltip__hint">👆 Click anywhere to jump timeline</div>
    </div>
  );
};

export const TimeSeriesChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const store = useAppStoreInstance();

  const {
    timePoints,
    currentTimeIndex,
    selectedStationId,
    stationTimeSeries,
    regionTimeSeries,
    activeChartMetric,
    activeLayerIds,
  } = useAppSelector((state) => ({
    timePoints: state.timePoints,
    currentTimeIndex: state.currentTimeIndex,
    selectedStationId: state.selectedStationId,
    stationTimeSeries: state.stationTimeSeries,
    regionTimeSeries: state.regionTimeSeries,
    activeChartMetric: state.activeChartMetric,
    activeLayerIds: state.activeLayerIds,
  }));

  const chartData: StationTimeSeriesPoint[] =
    selectedStationId && stationTimeSeries[selectedStationId]
      ? stationTimeSeries[selectedStationId]
      : regionTimeSeries;

  const currentPoint = timePoints[currentTimeIndex] || timePoints[0];
  const currentSnapshot = chartData[currentTimeIndex] || chartData[0];

  const handleChartClick = (e: any) => {
    if (e && typeof e.activeTooltipIndex === 'number') {
      AppStoreActions.setTimeIndex(dispatch, store, e.activeTooltipIndex);
    }
  };

  const showTemp =
    (activeChartMetric === 'all' || activeChartMetric === 'temperature') &&
    activeLayerIds.includes('temperature');

  const showWind =
    (activeChartMetric === 'all' || activeChartMetric === 'wind') &&
    activeLayerIds.includes('wind');

  const showSolar =
    (activeChartMetric === 'all' || activeChartMetric === 'solar') &&
    activeLayerIds.includes('solar');

  return (
    <div className="timeseries-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          onClick={handleChartClick}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          style={{ cursor: 'pointer' }}
        >
          <defs>
            <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="label"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            interval={2}
            fontFamily="JetBrains Mono, monospace"
          />

          <YAxis
            yAxisId="left"
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
            domain={[-5, 35]}
            fontFamily="JetBrains Mono, monospace"
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            domain={[0, 1000]}
            fontFamily="JetBrains Mono, monospace"
            hide={!showSolar}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: 11, paddingBottom: 6 }}
          />

          {showSolar && (
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="solarRadiation"
              name="Solar (W/m²)"
              fill="url(#solarGrad)"
              stroke="#fbbf24"
              strokeWidth={2}
              unit=" W/m²"
            />
          )}

          {showTemp && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              name="Temp (°C)"
              stroke="#f43f5e"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#f43f5e', stroke: '#ffffff', strokeWidth: 2 }}
              unit=" °C"
            />
          )}

          {showWind && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="windSpeed"
              name="Wind (m/s)"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
              unit=" m/s"
            />
          )}

          <ReferenceLine
            yAxisId="left"
            x={currentPoint.label}
            stroke="#06b6d4"
            strokeWidth={2}
            strokeDasharray="3 3"
            label={{
              value: `NOW ${currentPoint.label}`,
              fill: '#06b6d4',
              fontSize: 10,
              position: 'top',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />

          {showTemp && currentSnapshot && (
            <ReferenceDot
              yAxisId="left"
              x={currentPoint.label}
              y={currentSnapshot.temperature}
              r={5}
              fill="#f43f5e"
              stroke="#ffffff"
              strokeWidth={2}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
