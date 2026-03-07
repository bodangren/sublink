import { describe, it, expect, vi } from 'vitest'

vi.stubGlobal('Image', class {
  onload: (() => void) | null = null
  src = ''
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
})

vi.stubGlobal('document', {
  ...document,
  createElement: vi.fn((tag: string) => {
    if (tag === 'canvas') {
      return {
        width: 100,
        height: 100,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
          font: '',
          textBaseline: '',
          measureText: vi.fn(() => ({ width: 50 })),
          fillStyle: '',
          fillRect: vi.fn(),
          fillText: vi.fn(),
        })),
        toDataURL: vi.fn(() => 'data:image/jpeg;base64,test'),
      }
    }
    return document.createElement(tag)
  }),
})

import { applyWatermark } from './watermark'

describe('watermark utilities', () => {
  describe('applyWatermark', () => {
    it('returns a data URL string', async () => {
      const result = await applyWatermark('data:image/jpeg;base64,test', 'Test Watermark')
      expect(result).toMatch(/^data:image\/jpeg;base64,/)
    })

    it('handles empty watermark text', async () => {
      const result = await applyWatermark('data:image/jpeg;base64,test', '')
      expect(result).toMatch(/^data:image\/jpeg;base64,/)
    })
  })
})
