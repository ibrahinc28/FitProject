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

export const getInsumos = async (): Promise<Insumo[]> => {
  const { data } = await api.get<Insumo[]>('/inventory/insumos')
  return data
}
