// opszStepper/src/react/OpszStepperText.tsx — React component wrapper for optical-cut hot-swap
import React, { forwardRef, useCallback } from 'react'
import { useOpszStepper } from './useOpszStepper'
import type { OpszStepperOptions } from '../core/types'

/**
 * Props for the OpszStepperText component.
 * Extends OpszStepperOptions plus all standard HTML attributes (including ARIA)
 * so that aria-label, role, tabIndex, id, etc. are accepted and forwarded to the DOM.
 */
interface OpszStepperTextProps extends OpszStepperOptions, React.HTMLAttributes<HTMLElement> {
	/** HTML element to render. Default: 'p' */
	as?: React.ElementType
}

/**
 * Drop-in component that automatically swaps between optical size cuts
 * of a typeface family as the element's font-size changes.
 * Forwards the ref to the root element while also attaching the internal hook ref.
 * Accepts all standard HTML and ARIA attributes.
 */
export const OpszStepperText = forwardRef<HTMLElement, OpszStepperTextProps>(
	function OpszStepperText({ children, as: Tag = 'p', cuts, hysteresis, onCutChange, ...htmlProps }, ref) {
		// Reconstruct the options object for the hook from the named option props
		const options: OpszStepperOptions = { cuts, hysteresis, onCutChange }
		const innerRef = useOpszStepper(options)

		// Use a mutable ref internally so we can write .current in the callback ref,
		// without casting the readonly RefObject from useOpszStepper.
		const innerMutable = innerRef as React.MutableRefObject<HTMLElement | null>

		/** Callback ref that satisfies both the forwarded ref and the internal hook ref */
		const mergedRef = useCallback(
			(node: HTMLElement | null) => {
				innerMutable.current = node
				if (typeof ref === 'function') {
					ref(node)
				} else if (ref) {
					;(ref as React.MutableRefObject<HTMLElement | null>).current = node
				}
			},
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[ref],
		)

		return (
			<Tag ref={mergedRef} {...htmlProps}>
				{children}
			</Tag>
		)
	},
)

OpszStepperText.displayName = 'OpszStepperText'
