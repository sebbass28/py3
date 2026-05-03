/** Normaliza payloads de error de Django REST Framework / SimpleJWT a texto legible. */

const KNOWN = [
  [/No active account found with the given credentials/i, 'Usuario o contraseña incorrectos (o cuenta inactiva).'],
  [/given token not valid/i, 'Sesión caducada. Vuelve a iniciar sesión.'],
];

function translateDetail(str) {
  if (typeof str !== 'string') return str;
  for (const [re, es] of KNOWN) {
    if (re.test(str)) return es;
  }
  return str;
}

/** @param {unknown} detail */
export function normalizeDetail(detail) {
  if (detail == null) return '';

  if (typeof detail === 'string') return translateDetail(detail);

  if (Array.isArray(detail)) {
    const parts = detail.map((item) => {
      if (typeof item === 'string') return translateDetail(item);
      if (item && typeof item === 'object') {
        if (typeof item.msg === 'string') return translateDetail(item.msg);
        if (typeof item.message === 'string') return translateDetail(item.message);
      }
      return typeof item === 'object' ? JSON.stringify(item) : String(item);
    });
    return parts.filter(Boolean).join(' ');
  }

  return '';
}

/** @param {Record<string, unknown> | unknown} payload */
export function formatApiErrorPayload(payload) {
  if (payload == null) return 'Error sin detalle.';
  if (typeof payload === 'string') return translateDetail(payload);
  if (typeof payload !== 'object') return String(payload);

  const obj = payload;
  let out = '';

  if ('detail' in obj) {
    out = normalizeDetail(obj.detail);
    if (out) return out;
  }

  if ('error' in obj && typeof obj.error === 'string') {
    out = translateDetail(obj.error);
    if (out) return out;
  }

  const fieldParts = [];
  for (const [key, raw] of Object.entries(obj)) {
    if (key === 'detail' || key === 'error') continue;
    if (Array.isArray(raw)) fieldParts.push(`${key}: ${raw.join('; ')}`);
    else if (typeof raw === 'string') fieldParts.push(`${key}: ${raw}`);
    else fieldParts.push(`${key}: ${JSON.stringify(raw)}`);
  }

  const joined = fieldParts.join(' ');
  return joined || 'No se pudo completar la operación.';
}

/** @param {import('axios').AxiosError} error */
export function formatAxiosError(error) {
  if (!error.response) {
    return 'No hay respuesta del servidor (¿Está Django en marcha en :8000 mientras pruebas con Vite en :5173?).';
  }

  const { data, status } = error.response;

  if (typeof data === 'string') {
    return translateDetail(data) || `Respuesta HTTP ${status}.`;
  }

  if (data instanceof Blob) {
    return `Error HTTP ${status} (${data.type || 'binario'}). ¿Sesión válida o permiso para exportar?`;
  }

  if (typeof data === 'object' && data !== null) {
    return formatApiErrorPayload(data);
  }

  return `Error HTTP ${status}.`;
}
