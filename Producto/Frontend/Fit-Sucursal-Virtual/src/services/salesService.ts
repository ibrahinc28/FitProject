import api from './api'
import type { GymModel, SaleDTO, SaleRequest } from '../types/sales'

export const getModels = (): Promise<GymModel[]> =>
  api.get<GymModel[]>('/models').then((r) => r.data)

export const getAllSales = (): Promise<SaleDTO[]> =>
  api.get<SaleDTO[]>('/sales').then((r) => r.data)

export const createSale = (req: SaleRequest): Promise<SaleDTO> =>
  api.post<SaleDTO>('/sales', req).then((r) => r.data)

export const getSalesByBuyer = (buyerId: string): Promise<SaleDTO[]> =>
  api.get<SaleDTO[]>(`/sales/buyer/${buyerId}`).then((r) => r.data)