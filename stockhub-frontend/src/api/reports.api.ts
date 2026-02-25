import client from './client'

export const reportsApi = {
  // Downloads the stock summary PDF and triggers browser download
  downloadStockSummary: async (): Promise<void> => {
    const res = await client.get('/reports/stock-summary', {
      responseType: 'blob',
    })

    // Create a temporary URL and click it to trigger download
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `stock-summary-${new Date().toISOString().slice(0, 10)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  // Downloads the sales summary PDF and triggers browser download
  downloadSalesReport: async (): Promise<void> => {
    const res = await client.get('/reports/sales-summary', {
      responseType: 'blob',
    })

    // Create a temporary URL and click it to trigger download
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `sales-report-${new Date().toISOString().slice(0, 10)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },
}
