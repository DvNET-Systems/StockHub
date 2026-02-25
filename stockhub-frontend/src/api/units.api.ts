import client from './client'
import type { CreateUnitRequest, UnitResponse } from '../types'

export const unitsApi = {
  getAll: async (): Promise<UnitResponse[]> => {
    const res = await client.get<UnitResponse[]>('/units')
    return res.data
  },

  create: async (data: CreateUnitRequest): Promise<UnitResponse> => {
    const res = await client.post<UnitResponse>('/units', data)
    return res.data
  },
}
