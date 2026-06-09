const DEFAULT_MESSAGES = {
  400: 'Solicitud inválida.',
  401: 'Sesión inválida o expirada. Vuelve a iniciar sesión.',
  404: 'Recurso no encontrado.',
  409: 'Conflicto con el estado actual.',
  503: 'El robot o el SDK no están disponibles.',
  default: 'Ocurrió un error inesperado.',
};

function extractDetail(data) {
  if (!data) {
    return null;
  }
  if (typeof data === 'string') {
    return data;
  }
  if (typeof data.detail === 'string') {
    return data.detail;
  }
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg ?? JSON.stringify(item)).join(', ');
  }
  if (typeof data.message === 'string') {
    return data.message;
  }
  return null;
}

export function normalizeApiError(error) {
  if (error?.isApiError) {
    return error;
  }

  const status = error?.response?.status ?? null;
  const data = error?.response?.data;
  const detail = extractDetail(data);
  const message =
    detail ??
    (status ? DEFAULT_MESSAGES[status] : null) ??
    error?.message ??
    DEFAULT_MESSAGES.default;

  const normalized = new Error(message);
  normalized.status = status;
  normalized.data = data;
  normalized.isApiError = true;
  normalized.original = error;
  return normalized;
}

export function getErrorMessage(error) {
  return normalizeApiError(error).message;
}
