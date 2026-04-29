export function getRouteSample(route, timestamp) {
  if (!route?.points?.length) {
    return { x: 50, y: 50, angle: 0 };
  }

  if (route.points.length === 1) {
    return { ...route.points[0], angle: 0 };
  }

  const segments = route.points.slice(0, -1).map((point, index) => {
    const next = route.points[index + 1];
    const length = Math.hypot(next.x - point.x, next.y - point.y);
    return { from: point, to: next, length };
  });

  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
  const duration = route.durationMs || 18000;
  const progress = ((timestamp % duration) / duration) * totalLength;

  let traveled = 0;

  for (const segment of segments) {
    if (traveled + segment.length >= progress) {
      const local = segment.length === 0 ? 0 : (progress - traveled) / segment.length;
      const x = segment.from.x + (segment.to.x - segment.from.x) * local;
      const y = segment.from.y + (segment.to.y - segment.from.y) * local;
      const angle = Math.atan2(segment.to.y - segment.from.y, segment.to.x - segment.from.x) * (180 / Math.PI);
      return { x, y, angle };
    }

    traveled += segment.length;
  }

  const lastSegment = segments[segments.length - 1];
  return {
    x: lastSegment.to.x,
    y: lastSegment.to.y,
    angle: Math.atan2(lastSegment.to.y - lastSegment.from.y, lastSegment.to.x - lastSegment.from.x) * (180 / Math.PI)
  };
}

export function pointsToPath(points) {
  if (!points?.length) return "";

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}
