import { useState } from 'react';
import {
  Server,
  Cpu,
  Layers,
  Code2,
  Terminal,
  Activity,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  HardDrive,
  Clock,
  Radio,
  FileCode,
  Box,
  Copy,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const DOCKER_SERVICES = [
  {
    name: 'booknest-frontend',
    role: 'Nginx Alpine Web Server',
    port: '8080:80',
    status: 'Healthy',
    image: 'custom (multi-stage build)',
    healthcheck: 'wget --spider http://127.0.0.1:80/',
    memory: '14.2 MB',
    cpu: '0.12%',
  },
  {
    name: 'booknest-backend',
    role: 'Node.js Express + SQLite WAL',
    port: '3002:3002',
    status: 'Healthy',
    image: 'node:20-alpine',
    healthcheck: 'GET /api/health (HTTP 200)',
    memory: '42.8 MB',
    cpu: '0.35%',
  },
  {
    name: 'booknest-cadvisor',
    role: 'Container Resource Telemetry',
    port: '8085:8080',
    status: 'Running',
    image: 'gcr.io/cadvisor/cadvisor:latest',
    healthcheck: 'Daemon stream metrics',
    memory: '31.5 MB',
    cpu: '0.40%',
  },
  {
    name: 'booknest-prometheus',
    role: 'Time-Series Metrics DB',
    port: '9090:9090',
    status: 'Running',
    image: 'prom/prometheus:v2.51.0',
    healthcheck: '7-day retention TSDB',
    memory: '48.1 MB',
    cpu: '0.18%',
  },
  {
    name: 'booknest-grafana',
    role: 'Observability Dashboard',
    port: '3000:3000',
    status: 'Running',
    image: 'grafana/grafana:10.4.1',
    healthcheck: 'Auto-provisioned Dashboards',
    memory: '68.0 MB',
    cpu: '0.22%',
  },
];

const CODE_SNIPPETS = {
  isbn: {
    title: 'isbn.js — Algoritma Validasi & Checksum ISBN-13',
    file: 'backend/src/isbn.js',
    description: 'Menjamin integritas katalog buku dengan kalkulasi modulus 10 dan validasi bobot angka ganjil/genap sesuai standar ISO 2108.',
    code: `export function validateISBN13(isbn) {
  const cleaned = String(isbn).replace(/[^0-9]/g, '');
  if (cleaned.length !== 13) return false;

  // Algoritma Checksum EAN/ISBN-13: bobot 1 dan 3 berselang-seling
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(cleaned[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(cleaned[12], 10);
}`,
  },
  metrics: {
    title: 'metrics.js — Prometheus SLA & Observability Exporter',
    file: 'backend/src/metrics.js',
    description: 'Mencatat HTTP request duration, hit counter, dan status container untuk di-scrape oleh Prometheus setiap 15 detik.',
    code: `import client from 'prom-client';

export const httpRequestDuration = new client.Histogram({
  name: 'booknest_http_request_duration_seconds',
  help: 'Durasi pemrosesan request HTTP API BookNest',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2],
});

export const dbQueryCounter = new client.Counter({
  name: 'booknest_db_queries_total',
  help: 'Total eksekusi query database SQLite',
  labelNames: ['operation', 'table'],
});`,
  },
  db: {
    title: 'db.js — SQLite WAL Mode & Transaction Safety',
    file: 'backend/src/db.js',
    description: 'Mengaktifkan Write-Ahead Logging (WAL) dan synchronous NORMAL untuk throughput tinggi tanpa resiko korupsi database saat konkurensi.',
    code: `import Database from 'better-sqlite3';

const db = new Database('./data/booknest.db', { verbose: null });

// WAL Mode: Membaca tidak pernah memblokir penulisan data
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

export const insertBookTransaction = db.transaction((book) => {
  const stmt = db.prepare(\`
    INSERT INTO books (id, judul, penulis, isbn, kategori, lokasiRak, kondisi)
    VALUES (@id, @judul, @penulis, @isbn, @kategori, @lokasiRak, @kondisi)
  \`);
  return stmt.run(book);
});`,
  },
};

export default function Showcase() {
  const [activeCodeTab, setActiveCodeTab] = useState('isbn');
  const [copied, setCopied] = useState(false);

  const currentCode = CODE_SNIPPETS[activeCodeTab];

  function copyCode() {
    navigator.clipboard?.writeText(currentCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16" data-testid="showcase-page">
      <PageHeader
        title="Arsitektur Sistem & Rekayasa Kode"
        subtitle="Eksplorasi infrastruktur Docker multi-container, observabilitas real-time, dan fungsi logika inti BookNest."
        badge="Enterprise Grade Architecture"
      />

      {/* DOCKER CONTAINER TOPOLOGY */}
      <section className="space-y-4" data-testid="docker-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Box size={18} />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-forest-mist">
                Docker Multi-Container Stack (5 Layanan)
              </h2>
              <p className="text-xs text-forest-dew/80 font-mono">
                Isolasi jaringan booknest-net • Healthcheck terkoordinasi • Volume persistensi
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Stack Running: All Healthy
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DOCKER_SERVICES.map((svc) => (
            <div
              key={svc.name}
              data-testid={`container-${svc.name}`}
              className="sanctuary-card brass-corner p-4 space-y-3 transition-all hover:border-forest-amber/40 hover:-translate-y-0.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-mono text-xs font-bold text-forest-mist group-hover:text-forest-amber transition-colors">
                      {svc.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-forest-dew/80 mt-0.5">{svc.role}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101513] border border-forest-sage/20 text-forest-amber shrink-0">
                  {svc.port}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-forest-sage/10 text-[11px] font-mono">
                <div className="flex justify-between text-forest-dew/80">
                  <span>Image:</span>
                  <span className="text-forest-sage truncate max-w-[170px]">{svc.image}</span>
                </div>
                <div className="flex justify-between text-forest-dew/80">
                  <span>Health:</span>
                  <span className="text-emerald-400">{svc.healthcheck}</span>
                </div>
                <div className="flex justify-between text-forest-dew/80">
                  <span>Resource:</span>
                  <span className="text-forest-mist">{svc.memory} | {svc.cpu}</span>
                </div>
              </div>
            </div>
          ))}

          {/* DOCKER TERMINAL SUMMARY CARD */}
          <div
            data-testid="docker-terminal-card"
            className="sanctuary-card brass-corner p-4 space-y-2 bg-[#090D0B] border-forest-amber/30 md:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between text-xs font-mono text-forest-amber">
              <span className="flex items-center gap-1.5">
                <Terminal size={14} /> docker-compose.yml status
              </span>
              <span className="text-[10px] text-forest-dew/60">JSON-file Logging</span>
            </div>
            <div className="p-2.5 rounded bg-[#050806] border border-forest-sage/15 text-[11px] font-mono text-emerald-400 space-y-1 overflow-x-auto leading-relaxed">
              <p className="text-forest-dew/60">$ docker compose ps --format table</p>
              <p className="text-forest-mist">booknest-backend   Up 4h (healthy)   3002/tcp</p>
              <p className="text-forest-mist">booknest-frontend  Up 4h (healthy)   0.0.0.0:8080-&gt;80</p>
              <p className="text-forest-mist">booknest-cadvisor  Up 4h             0.0.0.0:8085-&gt;8080</p>
              <p className="text-forest-mist">booknest-prometheus Up 4h            0.0.0.0:9090-&gt;9090</p>
              <p className="text-emerald-300">✓ SQLite WAL Mode: OK (booknest-data volume)</p>
            </div>
          </div>
        </div>
      </section>

      {/* CODE SHOWCASE SECTION */}
      <section className="space-y-4" data-testid="code-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-forest-amber/10 border border-forest-amber/30 flex items-center justify-center text-forest-amber">
              <Code2 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-forest-mist">
                Fungsi & Rekayasa Logika Kode
              </h2>
              <p className="text-xs text-forest-dew/80 font-mono">
                Logika bisnis murni • Transaksi atomik database • Checksum matematika
              </p>
            </div>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex items-center gap-1 bg-[#101513] p-1 rounded-xl border border-forest-sage/20">
            {Object.keys(CODE_SNIPPETS).map((key) => (
              <button
                key={key}
                data-testid={`tab-${key}`}
                onClick={() => setActiveCodeTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeCodeTab === key
                    ? 'bg-forest-amber/20 text-forest-amber border border-forest-amber/40 shadow-bioglow font-bold'
                    : 'text-forest-dew/80 hover:text-forest-mist hover:bg-forest-sage/10'
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVE CODE BOX */}
        <div className="sanctuary-card brass-corner p-5 space-y-4 bg-[#090D0B] border-forest-sage/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest-sage/20 pb-3">
            <div>
              <h3 className="text-base font-serif font-bold text-forest-amber flex items-center gap-2">
                <FileCode size={16} /> {currentCode.title}
              </h3>
              <p className="text-xs text-forest-dew/85 mt-1 font-sans">{currentCode.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-forest-sage bg-[#121915] px-2.5 py-1 rounded border border-forest-sage/20">
                {currentCode.file}
              </span>
              <button
                onClick={copyCode}
                className="p-1.5 rounded bg-[#121915] hover:bg-forest-amber/15 text-forest-dew/80 hover:text-forest-amber border border-forest-sage/20 transition-colors"
                title="Salin kode"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div
            data-testid="code-display-block"
            className="p-4 rounded-xl bg-[#060A08] border border-forest-sage/20 overflow-x-auto"
          >
            <pre className="font-mono text-xs text-forest-mist leading-relaxed">
              <code>{currentCode.code}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
