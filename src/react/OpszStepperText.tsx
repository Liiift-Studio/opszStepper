// opszStepper/src/react/OpszStepperText.tsx — React component wrapper for optical-cut hot-swap
import React, { forwardRef, useCallback } from 'react'
import { useOpszStepper } from './useOpszStepper'
import type { OpszStepperOptions } from '../core/types'

/** Props for the OpszStepperText component */
interface OpszStepperTextProps extends OpszStepperOptions {
	children: React.ReactNode
	/** HTML element to render. Default: 'p' */
	as?: React.ElementType
	className?: string
	style?: React.CSSProperties
}

/**
 * Drop-in component that automatically swaps between optical size cuts
 * of a typeface family as the element's font-size changes.
 * Forwards the ref to the root element while also attaching the internal hook ref.
 */
export const OpszStepperText = forwardRef<HTMLElement, OpszStepperTextProps>(
	function OpszStepperText({ children, as: Tag = 'p', className, style, ...options }, ref) {
		const innerRef = useOpszStepper(options)

		/** Callback ref that satisfies both the forwarded ref and the internal hook ref */
		const mergedRef = useCallback(
			(node: HTMLElement | null) => {
				;(innerRef as React.MutableRefObject<HTMLElement | null>).current = node
				if (typeof ref === 'function') {
					ref(node)
				} else if (ref) {
					ref.current = node
				}
			},
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[ref],
		)

		return (
			<Tag ref={mergedRef} className={className} style={style}>
				{children}
			</Tag>
		)
	},
)

OpszStepperText.displayName = 'OpszStepperText'
