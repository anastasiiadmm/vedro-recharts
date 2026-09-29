/**
 * Spatial Mathematics & Meteorological Calculation Engine
 * Hand-crafted spatial interpolation (Inverse Distance Weighting - IDW),
 * NOAA Solar Zenith Angle equations, and WMO standard wind barb geometry.
 */

export interface Point2D {
  x: number;
  y: number;
  value: number;
}

/**
 * 1. Inverse Distance Weighting (IDW) Spatial Interpolator
 * Calculates continuous scalar field value at target coordinate [lng, lat]
 * from a discrete set of spatial observation stations.
 *
 * Formula: Z(x) = SUM(w_i * z_i) / SUM(w_i), where w_i = 1 / d(x, x_i)^p
 */
export function calculateIDW(
  targetLng: number,
  targetLat: number,
  samples: Array<{ lng: number; lat: number; value: number }>,
  power: number = 2.0,
  smoothing: number = 0.001
): number {
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const dx = targetLng - s.lng;
    const dy = targetLat - s.lat;
    const distSq = dx * dx + dy * dy;

    // Exact hit
    if (distSq < 0.000001) {
      return s.value;
    }

    const weight = 1 / Math.pow(Math.sqrt(distSq) + smoothing, power);
    numerator += weight * s.value;
    denominator += weight;
  }

  return denominator > 0 ? numerator / denominator : 0;
}

/**
 * 2. NOAA Solar Position & Twilight Calculation
 * Calculates true solar elevation angle (degrees) and extraterrestrial solar irradiance
 * based on latitude, day of year, and local solar time.
 */
export function calculateSolarZenith(
  lat: number,
  _lng: number,
  dayOfYear: number, // 1 to 365 (e.g. Sep 29 is ~272)
  hourUtc: number
): {
  elevation: number; // in degrees (-90 to +90)
  zenith: number; // 90 - elevation
  irradiance: number; // W/m² (GHI - Global Horizontal Irradiance)
  phase: 'Night' | 'Astronomical Twilight' | 'Nautical Twilight' | 'Civil Twilight' | 'Daylight' | 'Golden Hour';
} {
  // Fractional year in radians
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (hourUtc - 12) / 24);

  // Equation of time (minutes)
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination (radians)
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma);

  // True solar time
  const timeOffset = eqtime + 4 * _lng;
  const trueSolarTime = hourUtc * 60 + timeOffset;
  const hourAngle = ((trueSolarTime / 4) - 180) * (Math.PI / 180);

  const latRad = (lat * Math.PI) / 180;
  const cosZenith =
    Math.sin(latRad) * Math.sin(decl) +
    Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngle);

  const zenith = Math.acos(Math.max(-1, Math.min(1, cosZenith))) * (180 / Math.PI);
  const elevation = 90 - zenith;

  // Extraterrestrial Irradiance ~ 1361 W/m² with atmospheric attenuation
  let irradiance = 0;
  if (elevation > 0) {
    const airMass = 1 / (Math.sin((elevation * Math.PI) / 180) + 0.50572 * Math.pow(elevation + 6.07995, -1.6364));
    irradiance = Math.max(0, Math.round(1100 * Math.pow(0.7, airMass) * Math.sin((elevation * Math.PI) / 180)));
  }

  let phase: 'Night' | 'Astronomical Twilight' | 'Nautical Twilight' | 'Civil Twilight' | 'Daylight' | 'Golden Hour' = 'Night';
  if (elevation > 6) phase = 'Daylight';
  else if (elevation > 0 && elevation <= 6) phase = 'Golden Hour';
  else if (elevation > -6 && elevation <= 0) phase = 'Civil Twilight';
  else if (elevation > -12 && elevation <= -6) phase = 'Nautical Twilight';
  else if (elevation > -18 && elevation <= -12) phase = 'Astronomical Twilight';

  return { elevation, zenith, irradiance, phase };
}

/**
 * 3. WMO Meteorological Wind Barb Geometry Generator
 * Generates exact SVG path segments according to World Meteorological Organization standards:
 * - Staff (stem line) pointing into the wind
 * - Pennant triangle (50 knots ~ 25.7 m/s)
 * - Long barb (10 knots ~ 5.1 m/s)
 * - Short barb (5 knots ~ 2.6 m/s)
 */
export function generateWindBarbSvg(
  speedMs: number,
  directionDeg: number,
  size: number = 28
): { svgPath: string; rotation: number; knots: number; color: string } {
  const knots = Math.round(speedMs * 1.94384);
  let remainingKnots = knots;
  const paths: string[] = [];

  const center = size / 2;
  const staffLength = size * 0.45;
  const staffTop = center - staffLength;

  // Main staff (center up)
  paths.push(`M ${center} ${center} L ${center} ${staffTop}`);

  // Calm wind (circle)
  if (knots < 3) {
    return {
      svgPath: `M ${center} ${center} m -4,0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0`,
      rotation: 0,
      knots,
      color: '#a8dadc',
    };
  }

  let currentY = staffTop;
  const barbSpacing = size * 0.08;
  const barbLength = size * 0.22;

  // 50-knot pennants
  while (remainingKnots >= 48) {
    paths.push(
      `M ${center} ${currentY} L ${center + barbLength} ${currentY + barbSpacing} L ${center} ${currentY + barbSpacing * 2} Z`
    );
    currentY += barbSpacing * 2;
    remainingKnots -= 50;
  }

  // 10-knot barbs
  while (remainingKnots >= 8) {
    paths.push(`M ${center} ${currentY} L ${center + barbLength} ${currentY - barbSpacing * 0.6}`);
    currentY += barbSpacing;
    remainingKnots -= 10;
  }

  // 5-knot half barb
  if (remainingKnots >= 3) {
    paths.push(`M ${center} ${currentY} L ${center + barbLength * 0.5} ${currentY - barbSpacing * 0.3}`);
  }

  // Color mapping based on Beaufort scale
  let color = '#38bdf8';
  if (speedMs >= 18) color = '#ef4444';
  else if (speedMs >= 12) color = '#f97316';
  else if (speedMs >= 6) color = '#06b6d4';

  return {
    svgPath: paths.join(' '),
    rotation: (directionDeg + 180) % 360, // Wind barbs point towards origin
    knots,
    color,
  };
}

/**
 * 4. Wind Rose Frequency Matrix Generator
 * Computes 8-sector directional distribution of wind velocity categories
 */
export function computeWindRoseData(
  samples: Array<{ speed: number; direction: number }>
): Array<{
  sector: string;
  calm: number;
  moderate: number;
  strong: number;
  gale: number;
}> {
  const sectors = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const results = sectors.map((sec) => ({
    sector: sec,
    calm: 0,
    moderate: 0,
    strong: 0,
    gale: 0,
  }));

  samples.forEach((s) => {
    // Determine sector index (0 to 7)
    const normalized = ((s.direction + 22.5) % 360) / 45;
    const secIdx = Math.floor(normalized) % 8;

    if (s.speed < 5) results[secIdx].calm += 1;
    else if (s.speed < 12) results[secIdx].moderate += 1;
    else if (s.speed < 18) results[secIdx].strong += 1;
    else results[secIdx].gale += 1;
  });

  return results;
}
