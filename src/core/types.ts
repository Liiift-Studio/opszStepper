// opszStepper/src/core/types.ts — types for the optical-cut hot-swap tool

/**
 * A single optical size cut definition: a font-family string and the font-size
 * range in px over which it should be active.
 */
export interface OpszStepperCut {
	/**
	 * The CSS font-family string for this optical cut.
	 * e.g. 'Halyard Display, sans-serif' or '"Tiempos Display", serif'
	 */
	family: string
	/** Min font-size in px (inclusive) for this cut to apply. Default: 0 */
	minSize?: number
	/** Max font-size in px (exclusive) for this cut to apply. Default: Infinity */
	maxSize?: number
}

/** Options controlling the opszStepper effect */
export interface OpszStepperOptions {
	/**
	 * The optical size cuts, ordered from smallest to largest.
	 * Each cut defines a font-family string and the font-size range it applies to.
	 * Ranges should be contiguous and non-overlapping.
	 *
	 * @example
	 * cuts: [
	 *   { family: 'Halyard Micro, sans-serif', maxSize: 13 },
	 *   { family: 'Halyard Text, sans-serif', minSize: 13, maxSize: 28 },
	 *   { family: 'Halyard Display, sans-serif', minSize: 28 },
	 * ]
	 */
	cuts: OpszStepperCut[]

	/**
	 * Hysteresis dead zone in px per threshold. Prevents oscillation when
	 * font-size sits exactly at a cut boundary. Default: 1
	 */
	hysteresis?: number

	/**
	 * Callback fired each time the active cut changes.
	 * Receives the new cut that was applied.
	 */
	onCutChange?: (cut: OpszStepperCut) => void
}
