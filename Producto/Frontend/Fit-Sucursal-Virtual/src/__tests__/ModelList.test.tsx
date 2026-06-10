import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ModelList from '../components/models/ModelList'
import * as salesService from '../services/salesService'
import type { GymModel } from '../types/sales'

const mockModels: GymModel[] = [
  { modelId: 'm1', name: 'FitPro', description: 'Gym completo', price: 50000, areaM2: 100, capacity: 30, imageUrl: '', available: true },
  { modelId: 'm2', name: 'FitMini', description: 'Gym compacto', price: 25000, areaM2: 50, capacity: 15, imageUrl: '', available: false },
]

describe('ModelList', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('shows spinner while loading', () => {
    vi.spyOn(salesService, 'getModels').mockReturnValue(new Promise(() => {}))
    render(<MemoryRouter><ModelList onSelectModel={vi.fn()} /></MemoryRouter>)
    expect(document.querySelector('.animate-spin')).toBeTruthy()
  })

  it('renders models after loading', async () => {
    vi.spyOn(salesService, 'getModels').mockResolvedValue(mockModels)
    render(<MemoryRouter><ModelList onSelectModel={vi.fn()} /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('FitPro')).toBeDefined())
    expect(screen.getByText('FitMini')).toBeDefined()
  })

  it('shows error on failure', async () => {
    vi.spyOn(salesService, 'getModels').mockRejectedValue(new Error('fail'))
    render(<MemoryRouter><ModelList onSelectModel={vi.fn()} /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('No se pudieron cargar los modelos')).toBeDefined())
  })

  it('calls onSelectModel when a model is clicked', async () => {
    const onSelect = vi.fn()
    vi.spyOn(salesService, 'getModels').mockResolvedValue(mockModels)
    render(<MemoryRouter><ModelList onSelectModel={onSelect} /></MemoryRouter>)
    await waitFor(() => screen.getByText('FitPro'))
    fireEvent.click(screen.getByText('FitPro').closest('div')!)
    expect(onSelect).toHaveBeenCalledWith(mockModels[0])
  })

  it('shows No disponible badge for unavailable model', async () => {
    vi.spyOn(salesService, 'getModels').mockResolvedValue(mockModels)
    render(<MemoryRouter><ModelList onSelectModel={vi.fn()} /></MemoryRouter>)
    await waitFor(() => screen.getByText('No disponible'))
    expect(screen.getByText('No disponible')).toBeDefined()
  })
})