const API_BASE =
  'https://zerofilas-fpfwckceggbxfpcs.brazilsouth-01.azurewebsites.net/api'

/**
 * Busca a lista de unidades de saúde com o status atual da fila.
 * GET /fila — retorna [{ id, nome, tipo, tamanhoFila, tempoMedioEsperaMin }].
 */
export async function listarUnidadesComFila(signal) {
  const res = await fetch(`${API_BASE}/fila`, { signal })
  if (!res.ok) {
    throw new Error(`Falha ao consultar a fila (HTTP ${res.status})`)
  }
  const data = await res.json()
  if (!Array.isArray(data)) {
    throw new Error('Resposta inesperada da API de fila.')
  }
  return data
}
