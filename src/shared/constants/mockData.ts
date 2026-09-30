import { LayerConfig, LayerId, TimePoint, WeatherStation } from '@/shared/types/gis.types';

export const INITIAL_STATIONS: WeatherStation[] = [
  {
    id: 'st-munich',
    name: 'Munich Met Observatory',
    coordinates: [11.582, 48.135],
    elevation: 520,
    region: 'Bavaria',
  },
  {
    id: 'st-zugspitze',
    name: 'Zugspitze Peak Station',
    coordinates: [10.985, 47.421],
    elevation: 2962,
    region: 'Bavaria / Tyrol',
  },
  {
    id: 'st-innsbruck',
    name: 'Innsbruck Valley Station',
    coordinates: [11.404, 47.269],
    elevation: 574,
    region: 'Tyrol',
  },
  {
    id: 'st-salzburg',
    name: 'Salzburg Alpine Station',
    coordinates: [13.055, 47.809],
    elevation: 436,
    region: 'Salzburg',
  },
  {
    id: 'st-garmisch',
    name: 'Garmisch-Partenkirchen',
    coordinates: [11.095, 47.492],
    elevation: 708,
    region: 'Bavaria',
  },
  {
    id: 'st-sonnblick',
    name: 'Sonnblick Observatory',
    coordinates: [12.958, 47.054],
    elevation: 3106,
    region: 'High Alps',
  },
];

export const INITIAL_TIME_POINTS: TimePoint[] = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  const d = new Date(Date.UTC(2026, 8, 30, i, 0, 0));
  return {
    index: i,
    timestamp: d.getTime(),
    iso: d.toISOString(),
    label: `${hour}:00`,
  };
});

export const INITIAL_LAYERS_CONFIG: Record<LayerId, LayerConfig> = {
  temperature: {
    id: 'temperature',
    name: 'Air Temperature (2m)',
    type: 'heatmap',
    unit: '°C',
    visible: true,
    opacity: 0.8,
    minZoom: 3,
    maxZoom: 16,
    colorScale: [
      { value: -5, color: '#313695', label: '-5°C' },
      { value: 5, color: '#4575b4', label: '+5°C' },
      { value: 15, color: '#74add1', label: '+15°C' },
      { value: 25, color: '#fdae61', label: '+25°C' },
      { value: 35, color: '#d73027', label: '+35°C' },
    ],
    description: 'Ambient air temperature at 2 meters above ground with alpine lapse-rate modeling',
    iconName: 'Thermometer',
  },
  wind: {
    id: 'wind',
    name: 'Wind Velocity & Vectors',
    type: 'vector',
    unit: 'm/s',
    visible: true,
    opacity: 0.85,
    minZoom: 3,
    maxZoom: 16,
    colorScale: [
      { value: 0, color: '#a8dadc', label: '0 m/s' },
      { value: 5, color: '#457b9d', label: '5 m/s' },
      { value: 12, color: '#1d3557', label: '12 m/s' },
      { value: 18, color: '#e63946', label: '18 m/s' },
      { value: 25, color: '#780000', label: '25+ m/s' },
    ],
    description: 'Dynamic wind field vectors and animated Canvas streamline particles',
    iconName: 'Wind',
  },
  solar: {
    id: 'solar',
    name: 'Solar Insolation (GHI)',
    type: 'fill',
    unit: 'W/m²',
    visible: true,
    opacity: 0.65,
    minZoom: 3,
    maxZoom: 16,
    colorScale: [
      { value: 0, color: '#1e1b4b', label: '0 (Night)' },
      { value: 200, color: '#3b82f6', label: '200 W/m²' },
      { value: 500, color: '#ffb703', label: '500 W/m²' },
      { value: 800, color: '#fb8500', label: '800 W/m²' },
      { value: 1000, color: '#e63946', label: '1000 W/m²' },
    ],
    description: 'Global Horizontal Irradiance calculated from astronomical solar elevation angles',
    iconName: 'Sun',
  },
  radar_3d: {
    id: 'radar_3d',
    name: '3D Doppler Radar Tower',
    type: '3d-extrusion',
    unit: 'Structure',
    visible: true,
    opacity: 0.95,
    minZoom: 5,
    maxZoom: 18,
    description:
      'High-altitude Doppler radar tower and research observatory facility on Mount Zugspitze',
    iconName: 'RadioTower',
  },
};

export const DEFAULT_MAP_VIEW = {
  center: [11.0, 47.4] as [number, number],
  zoom: 7.6,
  pitch: 0,
  bearing: 0,
  is3D: false,
};
