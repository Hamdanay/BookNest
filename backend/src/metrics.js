import client from 'prom-client';

export const register = new client.Registry();
register.setDefaultLabels({ app: 'booknest-backend' });

// Kumpulkan metrics standar Node.js (CPU, Memory, Event Loop, GC)
client.collectDefaultMetrics({ register, prefix: 'booknest_' });

// Histogram durasi respon HTTP
export const httpRequestDuration = new client.Histogram({
  name: 'booknest_http_request_duration_seconds',
  help: 'Durasi request HTTP dalam detik',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});
register.registerMetric(httpRequestDuration);

// Counter total request
export const httpRequestsTotal = new client.Counter({
  name: 'booknest_http_requests_total',
  help: 'Total jumlah request HTTP yang diterima',
  labelNames: ['method', 'route', 'code'],
});
register.registerMetric(httpRequestsTotal);

// Middleware pencatat metrik HTTP otomatis
export function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    const route = req.route ? req.baseUrl + req.route.path : req.baseUrl || req.path;
    const code = String(res.statusCode);

    httpRequestDuration.labels(req.method, route, code).observe(durationInSeconds);
    httpRequestsTotal.labels(req.method, route, code).inc();
  });
  next();
}
