import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { initDB } from './db'

// Mock IndexedDB
import 'fake-indexeddb/auto'

describe('App', () => {
  it('renders SubLink title', async () => {
    await initDB()
    render(<App />)
    expect(screen.getByText('SubLink')).toBeDefined()
  })
})
