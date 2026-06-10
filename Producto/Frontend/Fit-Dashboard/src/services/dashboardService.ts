import api from './api'
import type { DashboardKpiDTO } from '../types/dashboard'

export async function getKpis(): Promise<DashboardKpiDTO> {
  const res = await api.get<DashboardKpiDTO>('/api/v1/dashboard/kpis')
  return res.data
}