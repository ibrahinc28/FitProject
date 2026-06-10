import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AuthCallbackPage from '../components/auth/AuthCallbackPage'
import { AuthProvider } from '../context/AuthContext'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('AuthCallbackPage', () => {
  beforeEach(() => { mockNavigate.mockClear() })

  it('redirects to / when valid SUPERVISOR_OBRA token is provided', () => {
    const user = { userId: '1', email: 'sup@test.com', fullName: 'Sup', role: 'SUPERVISOR_OBRA' }
    const params = `?token=tok123&user=${encodeURIComponent(JSON.stringify(user))}`

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[`/auth${params}`]}>
          <Routes>
            <Route path="/auth" element={<AuthCallbackPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('redirects to /unauthorized when role is not SUPERVISOR_OBRA', () => {
    const user = { userId: '2', email: 'inv@test.com', fullName: 'Inv', role: 'INVERSIONISTA' }
    const params = `?token=tok456&user=${encodeURIComponent(JSON.stringify(user))}`

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[`/auth${params}`]}>
          <Routes>
            <Route path="/auth" element={<AuthCallbackPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/unauthorized')
  })

  it('shows loading indicator while processing', () => {
    const user = { userId: '1', email: 'sup@test.com', fullName: 'Sup', role: 'SUPERVISOR_OBRA' }
    const params = `?token=tok&user=${encodeURIComponent(JSON.stringify(user))}`

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[`/auth${params}`]}>
          <Routes>
            <Route path="/auth" element={<AuthCallbackPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    )

    expect(screen.getByText('Autenticando...')).toBeDefined()
  })
})
