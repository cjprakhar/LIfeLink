const INDIA_BOUNDS = {
  minLat: Number(process.env.INDIA_MIN_LAT || 8),
  maxLat: Number(process.env.INDIA_MAX_LAT || 35),
  minLng: Number(process.env.INDIA_MIN_LNG || 68),
  maxLng: Number(process.env.INDIA_MAX_LNG || 90)
};

function isSupportedCoordinate(latitude, longitude) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= INDIA_BOUNDS.minLat &&
    latitude <= INDIA_BOUNDS.maxLat &&
    longitude >= INDIA_BOUNDS.minLng &&
    longitude <= INDIA_BOUNDS.maxLng
  );
}

function supportedCoordinateError(label) {
  return `${label} must be within the supported India development region (${INDIA_BOUNDS.minLat}-${INDIA_BOUNDS.maxLat} latitude, ${INDIA_BOUNDS.minLng}-${INDIA_BOUNDS.maxLng} longitude).`;
}

module.exports = { INDIA_BOUNDS, isSupportedCoordinate, supportedCoordinateError };