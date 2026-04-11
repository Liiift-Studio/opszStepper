// opszStepper/src/react/useOpszStepper.ts — React hook for optical-cut hot-swap
import { useLayoutEffect, useRef } from 'react'
import { startOpszStepper } from '../core/adjust'
import type { OpszStepperOptions } from '../core/types'

/**
 * React hook that starts an opszStepper observer on the returned ref'd element.
 * Calls startOpszStepper in useLayoutEffect and stores the returned stop function.
 * Stops and restarts when cuts length or hysteresis changes.
 * Cleans up on unmount.
 *
 * @param options - OpszStepperOptions
 * @returns         A ref to attach to the target element
 */
export function useOpszStepper(options: OpszStepperOptions) {
	const ref = useRef<HTMLElement>(null)
	const optionsRef = useRef(options)
	optionsRef.current = options
	const stopRef = useRef<(() => void) | null>(null)

	// Use cuts.length and hysteresis as re-run triggers (shallow deps that indicate config change)
	const cutsLength = options.cuts.length
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
	}, [cutsLength, hysteresis])

	return ref
}
