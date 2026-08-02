/**
 * Calculates great-circle distance between two lat/lng points using the
 * Haversine formula. Returns distance in kilometers.
 */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some((v) => v === undefined || v === null)) return null;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((R * c).toFixed(2));
}

/**
 * Normalizes a raw distance into a 0-1 "closeness" score for scoring/ranking.
 * Closer distances score nearer to 1. Anything beyond maxKm scores 0.
 */
function distanceScore(distanceKm, maxKm = 500) {
  if (distanceKm === null || distanceKm === undefined) return 0;
  if (distanceKm >= maxKm) return 0;
  return Number((1 - distanceKm / maxKm).toFixed(3));
}

module.exports = { getDistanceKm, distanceScore };
