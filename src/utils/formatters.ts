export function formatNumber(val: number, decimals: number = 2): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return val.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatScientific(val: number, decimals: number = 3): string {
  if (val === undefined || val === null || isNaN(val)) return '0.000e0';
  return val.toExponential(decimals);
}

export function formatDistanceKm(km: number): string {
  if (km >= 1e6) {
    return `${formatNumber(km / 1e6, 2)} × 10⁶ km`;
  }
  return `${formatNumber(km, 1)} km`;
}

export function formatSpeedKmS(speed: number): string {
  return `${formatNumber(speed, 2)} km/s`;
}
