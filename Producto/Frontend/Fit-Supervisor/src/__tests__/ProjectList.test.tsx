import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjectList from '../components/projects/ProjectList'
import * as projectService from '../services/projectService'
import type { Project } from '../types/project'

const mockProjects: Project[] = [
  {
    projectId: 'p1',
    modelName: 'FitPro',
    clientName: 'Cliente A',
    location: 'Lima',
    overallProgress: 60,
    status: 'ACTIVE',
    constructionSteps: [],
    startDate: '2026-01-01',
  },
  {
    projectId: 'p2',
    modelName: 'FitMini',
    clientName: 'Cliente B',
    location: 'Cusco',
    overallProgress: 100,
    status: 'COMPLETED',
    constructionSteps: [],
    startDate: '2025-12-01',
  },
]

describe('ProjectList', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('shows loading spinner initially', () => {
    vi.spyOn(projectService, 'getProjects').mockReturnValue(new Promise(() => {}))
    render(<MemoryRouter><ProjectList /></MemoryRouter>)
    expect(document.querySelector('.animate-spin')).toBeTruthy()
  })

  it('renders projects after loading', async () => {
    vi.spyOn(projectService, 'getProjects').mockResolvedValue(mockProjects)
    render(<MemoryRouter><ProjectList /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('FitPro')).toBeDefined())
    expect(screen.getByText('FitMini')).toBeDefined()
    expect(screen.getByText('60%')).toBeDefined()
  })

  it('shows error message on failure', async () => {
    vi.spyOn(projectService, 'getProjects').mockRejectedValue(new Error('fail'))
    render(<MemoryRouter><ProjectList /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('No se pudieron cargar los proyectos')).toBeDefined())
  })

  it('renders project links', async () => {
    vi.spyOn(projectService, 'getProjects').mockResolvedValue(mockProjects)
    render(<MemoryRouter><ProjectList /></MemoryRouter>)
    await waitFor(() => screen.getByText('FitPro'))
    const links = document.querySelectorAll('a[href*="/projects/"]')
    expect(links.length).toBe(2)
  })
})
