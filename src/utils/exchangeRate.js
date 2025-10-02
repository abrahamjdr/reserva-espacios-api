/**
 * @file Tipo de cambio USD↔VES con caché en memoria (1h).
 */

let cached = { rate: null, ts: 0 };

/**
 * Obtiene la tasa VES por 1 USD y cachea por 1 hora.
 * @returns {Promise<number>} rate - VES por USD
 * @throws Error si la consulta falla
 */
export async function getUsdToVesRate() {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();
  if (cached.rate && now - cached.ts < ONE_HOUR) return cached.rate;

  // Con Node 22 tenemos fetch global.
  const res = await fetch(
    "https://api.exchangerate.host/latest?base=USD&symbols=VES"
  );
  if (!res.ok) throw new Error("exchange_rate_unavailable");
  const data = await res.json();
  const rate = data?.rates?.VES;
  if (!rate) throw new Error("exchange_rate_invalid_response");

  cached = { rate, ts: now };
  return rate;
}
