export function calculateSolarZenith(
  lat: number,
  lng: number,
  dayOfYear: number,
  hourUtc: number
): {
  elevation: number;
  zenith: number;
  irradiance: number;
  phase:
    | 'Night'
    | 'Astronomical Twilight'
    | 'Nautical Twilight'
    | 'Civil Twilight'
    | 'Daylight'
    | 'Golden Hour';
} {
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (hourUtc - 12) / 24);

  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma);

  const timeOffset = eqtime + 4 * lng;
  const trueSolarTime = hourUtc * 60 + timeOffset;
  const hourAngle = (trueSolarTime / 4 - 180) * (Math.PI / 180);

  const latRad = (lat * Math.PI) / 180;
  const cosZenith =
    Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngle);

  const zenith = Math.acos(Math.max(-1, Math.min(1, cosZenith))) * (180 / Math.PI);
  const elevation = 90 - zenith;

  let irradiance = 0;
  if (elevation > 0) {
    const airMass =
      1 /
      (Math.sin((elevation * Math.PI) / 180) + 0.50572 * Math.pow(elevation + 6.07995, -1.6364));
    irradiance = Math.max(
      0,
      Math.round(1100 * Math.pow(0.7, airMass) * Math.sin((elevation * Math.PI) / 180))
    );
  }

  let phase:
    | 'Night'
    | 'Astronomical Twilight'
    | 'Nautical Twilight'
    | 'Civil Twilight'
    | 'Daylight'
    | 'Golden Hour' = 'Night';
  if (elevation > 6) phase = 'Daylight';
  else if (elevation > 0 && elevation <= 6) phase = 'Golden Hour';
  else if (elevation > -6 && elevation <= 0) phase = 'Civil Twilight';
  else if (elevation > -12 && elevation <= -6) phase = 'Nautical Twilight';
  else if (elevation > -18 && elevation <= -12) phase = 'Astronomical Twilight';

  return { elevation, zenith, irradiance, phase };
}

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

  paths.push(`M ${center} ${center} L ${center} ${staffTop}`);

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

  while (remainingKnots >= 48) {
    paths.push(
      `M ${center} ${currentY} L ${center + barbLength} ${currentY + barbSpacing} L ${center} ${currentY + barbSpacing * 2} Z`
    );
    currentY += barbSpacing * 2;
    remainingKnots -= 50;
  }

  while (remainingKnots >= 8) {
    paths.push(`M ${center} ${currentY} L ${center + barbLength} ${currentY - barbSpacing * 0.6}`);
    currentY += barbSpacing;
    remainingKnots -= 10;
  }

  if (remainingKnots >= 3) {
    paths.push(
      `M ${center} ${currentY} L ${center + barbLength * 0.5} ${currentY - barbSpacing * 0.3}`
    );
  }

  let color = '#38bdf8';
  if (speedMs >= 18) color = '#ef4444';
  else if (speedMs >= 12) color = '#f97316';
  else if (speedMs >= 6) color = '#06b6d4';

  return {
    svgPath: paths.join(' '),
    rotation: (directionDeg + 180) % 360,
    knots,
    color,
  };
}

export function computeWindRoseData(samples: Array<{ speed: number; direction: number }>): Array<{
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
    const normalized = ((s.direction + 22.5) % 360) / 45;
    const secIdx = Math.floor(normalized) % 8;

    if (s.speed < 5) results[secIdx].calm += 1;
    else if (s.speed < 12) results[secIdx].moderate += 1;
    else if (s.speed < 18) results[secIdx].strong += 1;
    else results[secIdx].gale += 1;
  });

  return results;
}
