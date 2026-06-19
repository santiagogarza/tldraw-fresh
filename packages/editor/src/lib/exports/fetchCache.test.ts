import { fetch } from '@tldraw/utils'
import { describe, expect, it, vi } from 'vitest'
import { fetchCache } from './fetchCache'

vi.mock('@tldraw/utils', () => ({
	fetch: vi.fn(),
	assert: (condition: unknown) => {
		if (!condition) throw new Error('assertion failed')
	},
	FileHelpers: {
		blobToDataUrl: vi.fn(),
	},
}))

describe('fetchCache', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('retries after a failed request for the same url', async () => {
		const fetchSpy = vi.mocked(fetch)
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		const fetchCached = fetchCache(async () => 'ok')

		fetchSpy.mockRejectedValueOnce(new Error('network'))
		fetchSpy.mockResolvedValueOnce({ ok: true } as Response)

		await expect(fetchCached('https://example.com/resource')).resolves.toBeNull()
		await expect(fetchCached('https://example.com/resource')).resolves.toBe('ok')
		expect(fetchSpy).toHaveBeenCalledTimes(2)

		consoleSpy.mockRestore()
	})

	it('returns the same in-flight promise for repeated requests', async () => {
		const fetchSpy = vi.mocked(fetch)
		const cb = vi.fn(async () => 'value')
		const fetchCached = fetchCache(cb)

		let resolveFetch: (value: Response) => void
		const pendingFetch = new Promise<Response>((resolve) => {
			resolveFetch = resolve
		})
		fetchSpy.mockReturnValueOnce(pendingFetch)

		const first = fetchCached('https://example.com/resource')
		const second = fetchCached('https://example.com/resource')

		expect(fetchSpy).toHaveBeenCalledTimes(1)
		resolveFetch!({ ok: true } as Response)

		await expect(first).resolves.toBe('value')
		await expect(second).resolves.toBe('value')
		expect(cb).toHaveBeenCalledTimes(1)
	})
})
