// opszStepper/src/core/adjust.ts — framework-agnostic optical-cut hot-swap algorithm
import type { OpszStepperCut, OpszStepperOptions, OpszStepperStop } from './types'

// ─── WeakMap stores ───────────────────────────────────────────────────────────

/**
 * Stores the original fontFamily for each element that opszStepper has touched,
 * so it can be restored on removal.
 */
const originalFamilyMap = new WeakMap<HTMLElement, string>()

/**
 * Stores the stop function for each element's active ResizeObserver loop,
 * so removeOpszStepper can disconnect it cleanly.
 */
const stopFnMap = new WeakMap<HTMLElement, () => void>()

/**
 * Tracks which cut is currently active on each element, to enable hysteresis.
 * Stores the index into the cuts array.
 */
const activeCutIndexMap = new WeakMap<HTMLElement, number>()

// ─── Defaults ─────────────────────────────────────────────────────────────────

/** Default hysteresis dead zone in px */
const DEFAULT_HYSTERESIS = 1

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Find the cut index that matches a given font-size.
 * Returns the first cut where minSize <= fontSize < maxSize,
 * using 0 and Infinity as defaults for missing bounds.
 * Returns -1 if no cut matches.
 */
function findCutIndex(cuts: OpszStepperCut[], fontSize: number): number {
	for (let i = 0; i < cuts.length; i++) {
		const cut = cuts[i]
		const min = cut.minSize ?? 0
		const max = cut.maxSize ?? Infinity
		if (fontSize >= min && fontSize < max) {
			return i
		}
	}
	return -1
}

/**
 * Determine whether font-size has moved far enough past a cut boundary to
 * trigger a switch, applying hysteresis to prevent oscillation at thresholds.
 *
 * Returns the new cut index if a switch should happen, or the currentIndex if not.
 *
 * Hysteresis logic:
 * - We are in cut A (currentIndex). Font-size has moved to cut B's range.
 * - Moving UP (fontSize into a higher cut): only switch if fontSize > cutB.minSize + hysteresis
 * - Moving DOWN (fontSize into a lower cut): only switch if fontSize < cutA.minSize - hysteresis
 */
function resolveHysteresisCutIndex(
	cuts: OpszStepperCut[],
	fontSize: number,
	currentIndex: number,
	hysteresis: number,
): number {
	const rawIndex = findCutIndex(cuts, fontSize)

	// No matching cut found — keep current if valid, else use rawIndex
	if (rawIndex === -1) return currentIndex === -1 ? rawIndex : currentIndex

	// No current cut set yet — accept the raw match immediately
	if (currentIndex === -1) return rawIndex

	// Already in the correct cut — no change needed
	if (rawIndex === currentIndex) return currentIndex

	const currentCut = cuts[currentIndex]
	const targetCut = cuts[rawIndex]

	if (rawIndex > currentIndex) {
		// Moving to a higher cut (larger font-size).
		// Only switch if fontSize is clearly above the target cut's lower boundary.
		const threshold = (targetCut.minSize ?? 0) + hysteresis
		return fontSize > threshold ? rawIndex : currentIndex
	} else {
		// Moving to a lower cut (smaller font-size).
		// Only switch if fontSize is clearly below the current cut's lower boundary.
		const threshold = (currentCut.minSize ?? 0) - hysteresis
		return fontSize < threshold ? rawIndex : currentIndex
	}
}

// ─── Cut application helper ───────────────────────────────────────────────────

/**
 * Write a cut's styles to an element.
 * Sets font-family, and — when the cut carries an opszValue — also writes
 * font-variation-settings to drive the opsz axis of a single variable font.
 * The opszValue is clamped between cut.opszMin and cut.opszMax when provided.
 *
 * Also saves window.scrollY before the write and restores it in a
 * requestAnimationFrame, matching the project-wide scroll-restore convention
 * (iOS Safari ignores overflow-anchor: none).
 */
function applyCut(el: HTMLElement, cut: OpszStepperCut): void {
	const scrollY = window.scrollY

	el.style.fontFamily = cut.family

	if (cut.opszValue !== undefined) {
		// Clamp the axis value against declared fvar bounds when supplied
		const min = cut.opszMin ?? -Infinity
		const max = cut.opszMax ?? Infinity
		const clamped = Math.min(max, Math.max(min, cut.opszValue))
		// Reset inherited axis values first, then set the opsz axis
		el.style.fontVariationSettings = `"opsz" ${clamped}`
	} else {
		// When doing multi-family hot-swap, clear any inline font-variation-settings
		// that may have been set by a prior opszValue cut or inherited from a stylesheet,
		// to avoid orphaned axis values on the new family.
		if (el.style.fontVariationSettings) {
			el.style.fontVariationSettings = ''
		}
	}

	requestAnimationFrame(() => {
		if (Math.abs(window.scrollY - scrollY) > 2) {
			window.scrollTo({ top: scrollY, behavior: 'instant' })
		}
	})
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * One-shot application of the correct optical cut for the element's current
 * computed font-size. No ResizeObserver — use when you want manual control.
 * Note: hysteresis is not applied here; use startOpszStepper for hysteresis support.
 *
 * @param el      - Target element
 * @param options - OpszStepperOptions
 */
export function applyOpszStepper(el: HTMLElement, options: OpszStepperOptions): void {
	if (typeof window === 'undefined') return

	const { cuts, onCutChange } = options

	// Guard: nothing to do with an empty cuts array
	if (!cuts || cuts.length === 0) return

	const rawSize = parseFloat(getComputedStyle(el).fontSize)
	// NaN guard: skip if element is detached or returns a non-px value
	if (isNaN(rawSize)) return

	const cutIndex = findCutIndex(cuts, rawSize)

	if (cutIndex === -1) return

	const cut = cuts[cutIndex]

	// Save original fontFamily before first modification
	if (!originalFamilyMap.has(el)) {
		originalFamilyMap.set(el, el.style.fontFamily)
	}

	applyCut(el, cut)
	activeCutIndexMap.set(el, cutIndex)
	onCutChange?.(cut)
}

/**
 * Start a ResizeObserver-backed optical cut watcher on an element.
 * Re-evaluates the correct cut each time the element's size changes
 * (which can cause font-size to change in responsive designs).
 *
 * Applies the correct cut immediately on first call.
 * If called a second time on the same element, the prior observer is stopped
 * first to avoid orphaned observers.
 *
 * @param el      - Target element
 * @param options - OpszStepperOptions
 * @returns         A stop function that disconnects the observer and restores the original fontFamily
 */
export function startOpszStepper(el: HTMLElement, options: OpszStepperOptions): OpszStepperStop {
	if (typeof window === 'undefined') return () => {}

	const { cuts, onCutChange } = options
	const hysteresis = options.hysteresis ?? DEFAULT_HYSTERESIS

	// Guard: nothing to observe with an empty cuts array
	if (!cuts || cuts.length === 0) return () => {}

	// If a prior observer is already running on this element, stop it cleanly
	// before attaching a new one to avoid orphaned observers.
	const existingStop = stopFnMap.get(el)
	if (existingStop) {
		existingStop()
	}

	// Save original fontFamily before any modifications (after stopping prior
	// observer, which may have already restored it)
	if (!originalFamilyMap.has(el)) {
		originalFamilyMap.set(el, el.style.fontFamily)
	}

	// Apply the correct cut immediately, delegating to applyOpszStepper
	// to avoid duplicating the read→find→write→callback sequence.
	applyOpszStepper(el, options)

	// Watch for element resize — font-size may change as a result of responsive layout
	const ro = new ResizeObserver(() => {
		const rawSize = parseFloat(getComputedStyle(el).fontSize)
		// NaN guard: skip if element is detached or returns a non-px value
		if (isNaN(rawSize)) return

		const currentIndex = activeCutIndexMap.get(el) ?? -1
		const newIndex = resolveHysteresisCutIndex(cuts, rawSize, currentIndex, hysteresis)

		if (newIndex !== currentIndex && newIndex !== -1) {
			applyCut(el, cuts[newIndex])
			activeCutIndexMap.set(el, newIndex)
			onCutChange?.(cuts[newIndex])
		}
	})

	ro.observe(el)

	const stop: OpszStepperStop = () => {
		ro.disconnect()
		const original = originalFamilyMap.get(el)
		if (original !== undefined) {
			el.style.fontFamily = original
			// Also clear any inline font-variation-settings written by applyCut
			el.style.fontVariationSettings = ''
			originalFamilyMap.delete(el)
		}
		activeCutIndexMap.delete(el)
		stopFnMap.delete(el)
	}

	// Store for use by removeOpszStepper
	stopFnMap.set(el, stop)

	return stop
}

/**
 * Restore the element's original fontFamily and disconnect any running
 * ResizeObserver started by startOpszStepper. No-op if never applied.
 *
 * @param el - Element previously passed to startOpszStepper or applyOpszStepper
 */
export function removeOpszStepper(el: HTMLElement): void {
	// If a stop function is registered (started via startOpszStepper), call it
	const stop = stopFnMap.get(el)
	if (stop) {
		stop()
		return
	}

	// Fallback: restore from originalFamilyMap (for applyOpszStepper-only usage)
	if (originalFamilyMap.has(el)) {
		// Use a local variable to avoid the non-null assertion on WeakMap.get()
		const original = originalFamilyMap.get(el)
		el.style.fontFamily = original ?? ''
		// Clear any inline font-variation-settings written by applyCut
		el.style.fontVariationSettings = ''
		originalFamilyMap.delete(el)
		activeCutIndexMap.delete(el)
	}
}
