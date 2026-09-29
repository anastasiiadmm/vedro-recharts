import { LayerConfig, LayerId, TimePoint, WeatherStation } from '../types/gis.types';

export const INITIAL_STATIONS: WeatherStation[] = [
  { id: 'st-munich', name: 'Munich Met Observatory', coordinates: [11.582, 48.135], elevation: 520, region: 'Bavaria' },
  { id: 'st-innsbruck', name: 'Innsbruck Alpine Station', coordinates: [11.404, 47.269], elevation: 1120, region: 'Tyrol' },
  { id: 'st-salzburg', name: 'Salzburg Valley Station', coordinates: [13.055, 47.809], elevation: 430, region: 'Salzburg' },
  { id: 'st-zurich', name: 'Zurich Lake Station', coordinates: [8.541, 47.376], elevation: 408, region: 'Zurich' },
  { id: 'st-garmisch', name: 'Zugspitze Peak Station', coordinates: [10.985, 47.421], elevation: 2962, region: 'Bavarian Alps' },
  { id: 'st-bolzano', name: 'Bolzano Solar Research', coordinates: [11.354, 46.498], elevation: 262, region: 'South Tyrol' },
  { id: 'st-konstanz', name: 'Bodensee Marine Weather', coordinates: [9.175, 47.677], elevation: 395, region: 'Baden-Württemberg' },
  { id: 'st-vaduz', name: 'Rhine Valley Monitoring', coordinates: [9.521, 47.141], elevation: 455, region: 'Liechtenstein' },
];

export const INITIAL_TIME_POINTS: TimePoint[] = Array.from({ length: 24 }, (_, hour) => {
  const date = new Date(2026, 8, 29, hour, 0, 0);
  const hourFormatted = hour.toString().padStart(2, '0') + ':00';
  return {
    index: hour,
    timestamp: date.getTime(),
    iso: date.toISOString(),
    label: hourFormatted,
    fullLabel: `Sep 29, 2026 ${hourFormatted}`,
  };
});

export const INITIAL_LAYERS_CONFIG: Record<LayerId, LayerConfig> = {
  temperature: {
    id: 'temperature',
    name: 'Air Temperature',
    description: 'Ambient surface temperature at 2m height (°C)',
    type: 'heatmap',
    visible: true,
    opacity: 0.75,
    unit: '°C',
    minValue: -5,
    maxValue: 35,
    iconName: 'Thermometer',
    colorScale: [
      { value: -5, color: '#313695', label: '< -5°C' },
      { value: 5, color: '#4575b4', label: '5°C' },
      { value: 12, color: '#74add1', label: '12°C' },
      { value: 18, color: '#e0f3f8', label: '18°C' },
      { value: 24, color: '#fee090', label: '24°C' },
      { value: 28, color: '#fdae61', label: '28°C' },
      { value: 35, color: '#d73027', label: '> 35°C' },
    ],
  },
  wind: {
    id: 'wind',
    name: 'Wind Velocity & Vectors',
    description: '10m wind speed (m/s) and aerodynamic directional flow',
    type: 'vectors',
    visible: true,
    opacity: 0.85,
    unit: 'm/s',
    minValue: 0,
    maxValue: 25,
    iconName: 'Wind',
    colorScale: [
      { value: 0, color: '#a8dadc', label: '0 m/s (Calm)' },
      { value: 5, color: '#457b9d', label: '5 m/s (Breeze)' },
      { value: 12, color: '#1d3557', label: '12 m/s (Moderate)' },
      { value: 18, color: '#e63946', label: '18 m/s (Strong)' },
      { value: 25, color: '#780000', label: '> 25 m/s (Gale)' },
    ],
  },
  solar: {
    id: 'solar',
    name: 'Solar Insolation',
    description: 'Direct & diffuse global surface irradiance (W/m²)',
    type: 'grid',
    visible: true,
    opacity: 0.65,
    unit: 'W/m²',
    minValue: 0,
    maxValue: 1000,
    iconName: 'Sun',
    colorScale: [
      { value: 0, color: '#2b2d42', label: '0 W/m² (Night)' },
      { value: 200, color: '#8d99ae', label: '200 W/m² (Low)' },
      { value: 450, color: '#ffb703', label: '450 W/m² (Moderate)' },
      { value: 750, color: '#fb8500', label: '750 W/m² (High)' },
      { value: 1000, color: '#e63946', label: '1000 W/m² (Peak)' },
    ],
  },
  radar_3d: {
    id: 'radar_3d',
    name: '3D Meteorological Radar & Facility',
    description: '3D Weather Doppler Radar Tower & Environmental Monitoring Node',
    type: '3d-model',
    visible: true,
    opacity: 1.0,
    unit: 'Structure',
    minValue: 0,
    maxValue: 1,
    iconName: 'RadioTower',
    colorScale: [
      { value: 0, color: '#38bdf8', label: 'Radar Active' },
      { value: 1, color: '#f43f5e', label: 'Telemetry Online' },
    ],
  },
};

export const DEFAULT_MAP_VIEW = {
  center: [11.0, 47.4] as [number, number],
  zoom: 7.6,
  pitch: 45,
  bearing: -15,
  is3D: true,
};
