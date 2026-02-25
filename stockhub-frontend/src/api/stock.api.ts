import client from './client'
import type {
  CurrentStockResponse,
  StockAdjustmentRequest,
  StockMovementResponse,
} from '../types'

export const stockApi = {
  adjust: async (data: StockAdjustmentRequest): Promise<StockMovementResponse> => {
    const res = await client.post<StockMovementResponse>('/stock/adjust', data)
    return res.data
  },

  getCurrent: async (productId: number): Promise<CurrentStockResponse> => {
    const res = await client.get<CurrentStockResponse>(`/stock/${productId}/current`)
    return res.data
  },

  getMovements: async (): Promise<StockMovementResponse[]> => {
    const res = await client.get<StockMovementResponse[]>('/stock/movements')
    return res.data
  },
}
