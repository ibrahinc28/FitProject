import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import * as AuthContext from '../context/AuthContext'

const mockLogout = vi.fn()

describe('Navbar', () => {
  it('displays user fullName', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { userId: '1', email: 'sup@test.com', fullName: 'Juan Perez', role: 'SUPERVISOR_OBRA' },
      token: 'tok',
      isAuthenticated: true,
      logout: mockLogout,
      setUserAndToken: vi.fn(),
    })
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByText('Juan Perez')).toBeDefined()
  })

  it('calls logout and redirects on Salir click', () => {
    const mockAssign = vi.fn()
    Object.defineProperty(window, 'location', { value: { href: '' }, writable: true })
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { userId: '1', email: 'sup@test.com', fullName: 'Juan Perez', role: 'SUPERVISOR_OBRA' },
      token: 'tok',
      isAuthenticated: true,
      logout: mockLogout,
      setUserAndToken: vi.fn(),
    })
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    fireEvent.click(screen.getByText('Salir'))
    expect(mockLogout).toHaveBeenCalled()
  })

  it('shows FitProject brand', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null, token: null, isAuthenticated: false,
      logout: vi.fn(), setUserAndToken: vi.fn(),
    })
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    expect(screen.getByText('FitProject')).toBeDefined()
    expect(screen.getByText('Supervisor')).toBeDefined()
  })
})
