/**
 * @file Tipo de cambio USD→VES.
 */

let cached = { rate: null, ts: 0 };

/**
 * Devuelve una tasa fake (de ENV o por defecto).
 * @returns {number}
 */
function providerFake() {
  const v = Number(process.env.FX_FAKE);
  return Number.isFinite(v) && v > 0 ? v : 150.5; // valor por defecto
}

/**
 * Obtiene la tasa VES por 1 USD.
 * Modo actual: SIEMPRE FAKE con caché de 1h.
 * @returns {Promise<number>}
 */
export async function getUsdToVesRate() {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();

  if (cached.rate && now - cached.ts < ONE_HOUR) return cached.rate;

  const rate = providerFake();
  cached = { rate, ts: now };
  return rate;
}

/* ----------------------------------------------------------------------
 * Modo con fetch y fallback (necesitamos una url valida)
 * ----------------------------------------------------------------------
 */
/*
async function fetchJsonWithTimeout(url, timeoutMs = 5000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      const e = new Error('exchange_rate_unavailable'); e.status = 503;
      throw e;
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      const e = new Error('exchange_rate_timeout'); e.status = 504;
      throw e;
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

async function providerConvert() {
  const data = await fetchJsonWithTimeout(
    'https://api.exchangerate.host/convert?from=USD&to=VES'
  );
  const rate = typeof data?.result === 'number' ? data.result : null;
  if (!rate) {
    const e = new Error('exchange_rate_invalid_response'); e.details = data;
    throw e;
  }
  return rate;
}

async function providerLatest() {
  const data = await fetchJsonWithTimeout(
    'https://api.exchangerate.host/latest?base=USD&symbols=VES'
  );
  const rate = typeof data?.rates?.VES === 'number' ? data.rates.VES : null;
  if (!rate) {
    const e = new Error('exchange_rate_invalid_response'); e.details = data;
    throw e;
  }
  return rate;
}

export async function getUsdToVesRateReal() {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();
  if (cached.rate && now - cached.ts < ONE_HOUR) return cached.rate;

  try {
    const rate = await providerConvert(); // 1er intento
    cached = { rate, ts: now };
    return rate;
  } catch (e1) {
    console.warn('[fx] providerConvert failed:', e1?.message);
  }
  try {
    const rate = await providerLatest(); // 2do intento
    cached = { rate, ts: now };
    return rate;
  } catch (e2) {
    console.warn('[fx] providerLatest failed:', e2?.message);
  }

  // Fallback final (fake) para no romper el flujo de reservas
  const rate = providerFake();
  cached = { rate, ts: now };
  return rate;
}
*/
