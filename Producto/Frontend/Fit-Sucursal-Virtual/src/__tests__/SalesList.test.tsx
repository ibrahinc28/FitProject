import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SalesList from '../components/sales/SalesList'
import * as salesService from '../services/salesService'
import type { SaleDTO } from '../types/sales'

const mockSales: SaleDTO[] = [
  { saleId: 's1', unitId: 'u1', modelName: 'FitPro', buyerName: 'Juan', buyerEmail: 'juan@test.com', salePrice: 50000, status: 'CONFIRMED', createdAt: '2026-01-01T00:00:00Z' },
  { saleId: 's2', unitId: 'u2', modelName: 'FitMini', buyerName: 'Maria', buyerEmail: 'maria@test.com', salePrice: 25000, status: 'PENDING', createdAt: '2026-01-02T00:00:00Z' },
]

describe('SalesList', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('shows spinner initially', () => {
    vi.spyOn(salesService, 'getAllSales').mockReturnValue(new Promise(() => {}))
    render(<MemoryRouter><SalesList /></MemoryRouter>)
    expect(document.querySelector('.animate-spin')).toBeTruthy()
  })

  it('renders sales table after loading', async () => {
    vi.spyOn(salesService, 'getAllSales').mockResolvedValue(mockSales)
    render(<MemoryRouter><SalesList /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Juan')).toBeDefined())
    expect(screen.getByText('Maria')).toBeDefined()
    expect(screen.getByText('FitPro')).toBeDefined()
  })

  it('shows empty message when no sales', async () => {
    vi.spyOn(salesService, 'getAllSales').mockResolvedValue([])
    render(<MemoryRouter><SalesList /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Sin ventas registradas todavía.')).toBeDefined())
  })

  it('shows error message on failure', async () => {
    vi.spyOn(salesService, 'getAllSales').mockRejectedValue(new Error('fail'))
    render(<MemoryRouter><SalesList /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('No se pudieron cargar las ventas')).toBeDefined())
  })
})