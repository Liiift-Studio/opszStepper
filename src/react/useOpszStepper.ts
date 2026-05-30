// opszStepper/src/react/useOpszStepper.ts — React hook for optical-cut hot-swap
import { useLayoutEffect, useRef } from 'react'
import { startOpszStepper } from '../core/adjust'
import type { OpszStepperOptions, OpszStepperStop } from '../core/types'

/**
 * React hook that starts an opszStepper observer on the returned ref'd element.
 * Calls startOpszStepper in useLayoutEffect and stores the returned stop function.
 *
 * Re-runs (stops and restarts the observer) whenever any cut's family, minSize, or
 * maxSize changes, or when cuts are added/removed, or when hysteresis changes.
 * A stable JSON serialisation of the cuts array is used as the dependency key so
 * that same-length arrays with different content also trigger a restart.
 *
 * Note: onCutChange is kept in a ref and never used as a dependency — it is always
 * read fresh from optionsRef on each observer callback, so it does not need to be
 * stable across renders.
 *
 * Cleans up on unmount.
 *
 * @param options - OpszStepperOptions
 * @returns         A ref to attach to the target element
 */
export function useOpszStepper(options: OpszStepperOptions) {
	const ref = useRef<HTMLElement>(null)
	const optionsRef = useRef(options)
	optionsRef.current = options
	const stopRef = useRef<OpszStepperStop | null>(null)

	// Serialize the cuts array to a string so that same-length arrays with different
	// content still trigger a restart. hysteresis is included directly.
	const cutsKey = JSON.stringify(options.cuts)
	const { hysteresis } = options

	useLayoutEffect(() => {
		const el = ref.current
		if (!el) return

		// Stop any prior observer before starting a fresh one
		stopRef.current?.()
		stopRef.current = startOpszStepper(el, optionsRef.current)

		return () => {
			stopRef.current?.()
			stopRef.current = null
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cutsKey, hysteresis])

	return ref
}
