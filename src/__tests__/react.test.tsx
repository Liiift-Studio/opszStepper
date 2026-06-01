// opszStepper/src/__tests__/react.test.tsx — @testing-library/react hook and component tests
import React from 'react'
import { render, renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useOpszStepper } from '../react/useOpszStepper'
import { OpszStepperText } from '../react/OpszStepperText'
import type { OpszStepperOptions } from '../core/types'

// ─── Shared mocks ─────────────────────────────────────────────────────────────

/** Sample cuts used across tests */
const SAMPLE_CUTS: OpszStepperOptions['cuts'] = [
	{ family: 'Halyard Micro, sans-serif', maxSize: 13 },
	{ family: 'Halyard Text, sans-serif', minSize: 13, maxSize: 28 },
	{ family: 'Halyard Display, sans-serif', minSize: 28 },
]

/** Stub getComputedStyle to return a fixed font-size */
function stubFontSize(px: number): void {
	vi.stubGlobal('getComputedStyle', (_el: Element) => ({
		fontSize: `${px}px`,
	}))
}

/** Stub ResizeObserver with a no-op implementation */
function stubResizeObserver(): void {
	vi.stubGlobal('ResizeObserver', class {
		constructor(_cb: ResizeObserverCallback) {}
		observe() {}
		disconnect() {}
	})
}

// ─── useOpszStepper ───────────────────────────────────────────────────────────

describe('useOpszStepper', () => {
	beforeEach(() => {
		document.body.innerHTML = ''
		stubFontSize(20)
		stubResizeObserver()
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	// 1. Hook mounts without throwing
	it('mounts without throwing', () => {
		expect(() => {
			renderHook(() => useOpszStepper({ cuts: SAMPLE_CUTS }))
		}).not.toThrow()
	})

	// 2. Hook unmounts without throwing
	it('unmounts without throwing', () => {
		const { unmount } = renderHook(() => useOpszStepper({ cuts: SAMPLE_CUTS }))
		expect(() => unmount()).not.toThrow()
	})

	// 3. Hook returns a ref object
	it('returns a ref object', () => {
		const { result } = renderHook(() => useOpszStepper({ cuts: SAMPLE_CUTS }))
		expect(result.current).toBeDefined()
		expect(typeof result.current).toBe('object')
		expect('current' in result.current).toBe(true)
	})

	// 4. Re-runs without throwing when cuts change
	it('re-runs without throwing when cuts option changes', () => {
		const initialCuts = SAMPLE_CUTS
		const newCuts = [
			{ family: 'Halyard Display, sans-serif', minSize: 0 },
		]

		const { rerender } = renderHook(
			({ cuts }) => useOpszStepper({ cuts }),
			{ initialProps: { cuts: initialCuts } },
		)

		expect(() => {
			act(() => {
				rerender({ cuts: newCuts })
			})
		}).not.toThrow()
	})

	// 5. Re-runs without throwing when hysteresis changes
	it('re-runs without throwing when hysteresis option changes', () => {
		const { rerender } = renderHook(
			({ hysteresis }) => useOpszStepper({ cuts: SAMPLE_CUTS, hysteresis }),
			{ initialProps: { hysteresis: 1 } },
		)

		expect(() => {
			act(() => {
				rerender({ hysteresis: 3 })
			})
		}).not.toThrow()
	})

	// 6. Hook works with empty cuts array
	it('mounts without throwing when cuts is empty', () => {
		expect(() => {
			renderHook(() => useOpszStepper({ cuts: [] }))
		}).not.toThrow()
	})
})

// ─── OpszStepperText ──────────────────────────────────────────────────────────

describe('OpszStepperText', () => {
	beforeEach(() => {
		document.body.innerHTML = ''
		stubFontSize(20)
		stubResizeObserver()
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	// 7. Renders children
	it('renders children', () => {
		const { container } = render(
			<OpszStepperText cuts={SAMPLE_CUTS}>Hello world</OpszStepperText>,
		)
		expect(container.textContent).toContain('Hello world')
	})

	// 8. Renders a <p> by default
	it('renders a <p> element by default', () => {
		const { container } = render(
			<OpszStepperText cuts={SAMPLE_CUTS}>Text</OpszStepperText>,
		)
		expect(container.querySelector('p')).not.toBeNull()
	})

	// 9. Renders custom element via "as" prop
	it('renders the element specified by the "as" prop', () => {
		const { container } = render(
			<OpszStepperText cuts={SAMPLE_CUTS} as="h2">Heading</OpszStepperText>,
		)
		expect(container.querySelector('h2')).not.toBeNull()
		expect(container.querySelector('p')).toBeNull()
	})

	// 10. Forwards className
	it('forwards className to the root element', () => {
		const { container } = render(
			<OpszStepperText cuts={SAMPLE_CUTS} className="my-class">Text</OpszStepperText>,
		)
		const el = container.firstElementChild as HTMLElement
		expect(el.classList.contains('my-class')).toBe(true)
	})

	// 11. Forwards aria-label
	it('forwards aria-label to the root element', () => {
		const { container } = render(
			<OpszStepperText cuts={SAMPLE_CUTS} aria-label="optical text">Text</OpszStepperText>,
		)
		const el = container.firstElementChild as HTMLElement
		expect(el.getAttribute('aria-label')).toBe('optical text')
	})

	// 12. Forwards data attributes
	it('forwards arbitrary data attributes to the root element', () => {
		const { container } = render(
			<OpszStepperText cuts={SAMPLE_CUTS} data-testid="opsz-el">Text</OpszStepperText>,
		)
		const el = container.firstElementChild as HTMLElement
		expect(el.getAttribute('data-testid')).toBe('opsz-el')
	})

	// 13. Mounts and unmounts without throwing
	it('unmounts without throwing', () => {
		const { unmount } = render(
			<OpszStepperText cuts={SAMPLE_CUTS}>Text</OpszStepperText>,
		)
		expect(() => unmount()).not.toThrow()
	})

	// 14. Accepts and forwards ref
	it('accepts a forwarded ref pointing to the root element', () => {
		const ref = React.createRef<HTMLElement>()
		render(
			<OpszStepperText cuts={SAMPLE_CUTS} ref={ref}>Text</OpszStepperText>,
		)
		expect(ref.current).not.toBeNull()
		expect(ref.current?.tagName.toLowerCase()).toBe('p')
	})

	// 15. Re-renders without throwing when cuts change
	it('re-renders without throwing when cuts prop changes', () => {
		const { rerender } = render(
			<OpszStepperText cuts={SAMPLE_CUTS}>Text</OpszStepperText>,
		)
		expect(() => {
			rerender(
				<OpszStepperText cuts={[{ family: 'Halyard Display, sans-serif', minSize: 0 }]}>
					Text
				</OpszStepperText>,
			)
		}).not.toThrow()
	})
})
