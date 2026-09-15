/**
 * benchmark.js — Pruebas de rendimiento con autocannon
 *
 * Prerequisito: el backend debe estar arriba (npm run start:dev o start:prod)
 *               y la BD debe tener el seed cargado (usuario 821011 / password 1234)
 *
 * Uso:
 *   node test/benchmark.js
 */

const autocannon = require('autocannon');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// ─── 1. Obtener token JWT ────────────────────────────────────────────────────
function login() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ id: 821011, password: '1234' });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.accessToken) {
              reject(new Error('Login failed: ' + data));
            } else {
              resolve(parsed.accessToken);
            }
          } catch (e) {
            reject(e);
          }
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── 2. Ejecutar un escenario autocannon y devolver resultados ───────────────
function runBenchmark(title, options) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🔥  ${title}`);
    console.log(`${'─'.repeat(60)}`);

    const instance = autocannon(
      {
        duration: 10,        // segundos de carga
        connections: 50,     // conexiones concurrentes
        pipelining: 1,
        ...options,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ title, result });
      },
    );

    autocannon.track(instance, { renderProgressBar: true });
  });
}

// ─── 3. Imprimir tabla resumen ───────────────────────────────────────────────
function printSummary(results) {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log('  RESUMEN DE RENDIMIENTO');
  console.log('═'.repeat(80));
  console.log(
    `${'Escenario'.padEnd(40)} ${'Req/s'.padStart(8)} ${'P99 (ms)'.padStart(10)} ${'Errores'.padStart(8)}`,
  );
  console.log('─'.repeat(80));

  for (const { title, result } of results) {
    const rps = result.requests.average.toFixed(1);
    const p99 = result.latency.p99.toFixed(1);
    const errors = result.errors;
    console.log(
      `${title.padEnd(40)} ${rps.padStart(8)} ${p99.padStart(10)} ${String(errors).padStart(8)}`,
    );
  }
  console.log('═'.repeat(80));
  console.log('\nLeyenda:');
  console.log('  Req/s   → Peticiones completadas por segundo (mayor = mejor)');
  console.log('  P99     → Latencia del percentil 99 en ms (menor = mejor)');
  console.log('  Errores → Respuestas con código HTTP >= 400\n');
}

// ─── 4. Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('Obteniendo token JWT...');
  let token;
  try {
    token = await login();
    console.log('✅ Login correcto\n');
  } catch (e) {
    console.error('❌ No se pudo hacer login. ¿Está el backend corriendo en localhost:3000?');
    console.error(e.message);
    process.exit(1);
  }

  const authHeader = { Authorization: `Bearer ${token}` };

  const results = [];

  // ── Escenario A: endpoint ligero — perfil de usuario ─────────────────────
  results.push(
    await runBenchmark('GET /user/profile  (endpoint ligero)', {
      url: `${BASE_URL}/user/profile`,
      headers: authHeader,
    }),
  );

  // ── Escenario B: endpoint medio — detalles de una rutina ──────────────────
  results.push(
    await runBenchmark('GET /routine/Cardio Suave  (endpoint medio)', {
      url: `${BASE_URL}/routine/${encodeURIComponent('Cardio Suave')}/edit-view`,
      headers: authHeader,
    }),
  );

  // ── Escenario C: endpoint pesado — algoritmo de recomendación ─────────────
  results.push(
    await runBenchmark('GET /routine/recommend  (algoritmo de recomendación)', {
      url: `${BASE_URL}/routine/recommend?hasEquipment=false`,
      headers: authHeader,
    }),
  );

  // ── Escenario D: dashboard clínico (múltiples cálculos agregados) ─────────
  results.push(
    await runBenchmark('GET /clinical-profile/dashboard  (dashboard parental)', {
      url: `${BASE_URL}/clinical-profile/dashboard`,
      headers: authHeader,
    }),
  );

  // ── Escenario E: consulta OMOP con Between sobre measurement_datetime ──────
  // 4 consultas paralelas (HR, steps, SpO2, resp_rate) en el rango de la sesión
  const omopStart = '2026-06-20T10:00:00.000Z';
  const omopEnd = '2026-06-20T10:30:00.000Z';
  results.push(
    await runBenchmark('GET /sensors/session  (Between measurement_datetime x4)', {
      url: `${BASE_URL}/sensors/session?start=${encodeURIComponent(omopStart)}&end=${encodeURIComponent(omopEnd)}`,
      headers: authHeader,
    }),
  );

  // ── Escenario F: resumen OMOP por sesiones recientes (AVG/MAX/MIN agregados) ─
  results.push(
    await runBenchmark('GET /sensors/recent-sessions-summary  (agregados OMOP)', {
      url: `${BASE_URL}/sensors/recent-sessions-summary?limit=5`,
      headers: authHeader,
    }),
  );

  printSummary(results);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
