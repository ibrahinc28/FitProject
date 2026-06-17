import api from './api'

export interface Insumo {
  insumoId: string
  nombre: string
  descripcion?: string
  cantidadDisponible: number
  unidadMedida: string
  createdAt?: string
  updatedAt?: string
}

export interface Transaccion {
  transaccionId: string
  insumoId: string
  insumoNombre: string
  tipo: 'ENTRADA' | 'SALIDA'
  cantidad: number
  stockResultante: number
  referencia?: string
  realizadoPor?: string
  createdAt: string
}

export const getInsumos = async (): Promise<Insumo[]> => {
  const { data } = await api.get<Insumo[]>('/api/v1/inventory/insumos')
  return data
}

export const createInsumo = async (body: {
  nombre: string
  descripcion?: string
  cantidadDisponible: number
  unidadMedida: string
}): Promise<Insumo> => {
  const { data } = await api.post<Insumo>('/api/v1/inventory/insumos', body)
  return data
}

export const addStock = async (insumoId: string, cantidad: number): Promise<Insumo> => {
  const { data } = await api.patch<Insumo>(`/api/v1/inventory/insumos/${insumoId}/stock`, { cantidad })
  return data
}

export const getTransacciones = async (insumoId: string): Promise<Transaccion[]> => {
  const { data } = await api.get<Transaccion[]>(`/api/v1/inventory/insumos/${insumoId}/transacciones`)
  return data
}
