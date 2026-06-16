import api from './api'

export interface Worker {
  userId: string
  fullName: string
  email: string
  role: string
  specialty: string | null
  active: boolean
}

export const getWorkers = async (): Promise<Worker[]> => {
  const { data } = await api.get<Worker[]>('/admin/users/workers')
  return data
}
