"use client"

// Interactive demo: drag font-size slider, move cursor, or tilt device to watch opszStepper hot-swap between Cormorant cuts
import { useState, useDeferredValue, useEffect } from "react"
import { OpszStepperText } from "@liiift-studio/opszstepper"
import type { OpszStepperCut } from "@liiift-studio/opszstepper"

/** Three Cormorant optical cuts loaded via next/font — keys must match CSS variable names */
const CUTS: OpszStepperCut[] = [
	{ family: 'var(--font-cormorant-sc), serif',       maxSize: 16 },
	{ family: 'var(--font-cormorant-garamond), serif', minSize: 16, maxSize: 36 },
	{ family: 'var(--font-cormorant-display), serif',  minSize: 36 },
]

/** Human-readable label for each cut, keyed by family string */
const CUT_LABELS: Record<string, { name: string; subtitle: string }> = {
	'var(--font-cormorant-sc), serif':       { name: 'Micro',   subtitle: 'Cormorant SC — small caps, designed for small sizes' },
	'var(--font-cormorant-garamond), serif': { name: 'Text',    subtitle: 'Cormorant Garamond — text optical size' },
	'var(--font-cormorant-display), serif':  { name: 'Display', subtitle: 'Cormorant Display — display optical size' },
}

const DEMO_TEXT = `The geometry that works at twelve points becomes wrong at seventy-two. Type designers know this — it's why they draw separate optical-size cuts. Stroke widths, apertures, spacing: all redrawn for the intended size.`

/** Cursor icon SVG */
function CursorIcon() {
	return (
		<svg width="11" height="14" viewBox="0 0 11 14" fill="currentColor" aria-hidden>
			<path d="M0 0L0 11L3 8L5 13L6.8 12.3L4.8 7.3L8.5 7.3Z" />
		</svg>
	)
}

/** Gyroscope icon SVG */
function GyroIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden>
			<circle cx="7" cy="7" r="5.5" />
			<circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
			<path d="M7 1.5 A5.5 5.5 0 0 1 12.5 7" strokeWidth="1.4" />
			<path d="M11.5 5.5 L12.5 7 L13.8 6" strokeWidth="1.2" />
		</svg>
	)
}

/** Slider with accessible label */
function Slider({ label, value, min, max, step, unit, onChange }: {
	label: string
	value: number
	min: number
	max: number
	step: number
	unit: string
	onChange: (v: number) => void
}) {
	return (
		<div className="flex flex-col gap-1">
			<div className="flex justify-between items-baseline">
				<span className="text-xs uppercase tracking-widest opacity-50">{label}</span>
				<span className="tabular-nums text-xs opacity-50">{value}{unit}</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				aria-label={label}
				onChange={e => onChange(Number(e.target.value))}
				onTouchStart={e => e.stopPropagation()}
				style={{ touchAction: 'none' }}
			/>
		</div>
	)
}

/** Chip showing Micro / Text / Display — active one is fully opaque */
function CutChips({ activeName }: { activeName: string }) {
	const names = ['Micro', 'Text', 'Display']
	return (
		<div className="flex gap-2">
			{names.map(name => (
				<span
					key={name}
					className="text-xs px-3 py-1 rounded-full border transition-opacity"
					style={{
						borderColor: 'currentColor',
						opacity: name === activeName ? 1 : 0.25,
						background: name === activeName ? 'var(--btn-bg)' : 'transparent',
					}}
				>
					{name}
				</span>
			))}
		</div>
	)
}

/** Interactive demo component for opszStepper */
export default function Demo() {
	const [fontSize, setFontSize] = useState(32)
	const [hysteresis, setHysteresis] = useState(1)
	const [activeCut, setActiveCut] = useState<OpszStepperCut>(CUTS[1])

	// Interaction modes — mutually exclusive
	const [cursorMode, setCursorMode] = useState(false)
	const [gyroMode, setGyroMode] = useState(false)

	// Gyro-driven value — separate from slider state to prevent mobile scroll
	const [gyroFontSize, setGyroFontSize] = useState(32)

	// Detected capabilities — resolved client-side after mount
	const [showCursor, setShowCursor] = useState(false)
	const [showGyro, setShowGyro] = useState(false)

	useEffect(() => {
		const isHover = window.matchMedia('(hover: hover)').matches
		const isTouch = window.matchMedia('(hover: none)').matches
		setShowCursor(isHover)
		setShowGyro(isTouch && 'DeviceOrientationEvent' in window)
	}, [])

	// Effective font-size: gyro-driven or slider-driven
	const effectiveFontSize = gyroMode ? gyroFontSize : fontSize

	const dFontSize = useDeferredValue(effectiveFontSize)
	const dHysteresis = useDeferredValue(hysteresis)

	// Cursor mode — Y controls font-size (top = large, bottom = small)
	useEffect(() => {
		if (!cursorMode) return
		const handleMove = (e: MouseEvent) => {
			setFontSize(Math.round(8 + (1 - e.clientY / window.innerHeight) * 88))
		}
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setCursorMode(false)
		}
		window.addEventListener('mousemove', handleMove)
		window.addEventListener('keydown', handleKey)
		return () => {
			window.removeEventListener('mousemove', handleMove)
			window.removeEventListener('keydown', handleKey)
		}
	}, [cursorMode])

	// Gyro mode — beta (front/back tilt) controls font-size (upright = large, tilted back = small)
	useEffect(() => {
		if (!gyroMode) return
		let rafId: number | null = null
		const handleOrientation = (e: DeviceOrientationEvent) => {
			if (rafId !== null) return
			rafId = requestAnimationFrame(() => {
				rafId = null
				if (e.beta !== null) {
					// beta ~90 (upright portrait) = large; tilted back toward you = smaller
					const clamped = Math.max(15, Math.min(90, e.beta))
					setGyroFontSize(Math.round(8 + ((clamped - 15) / 75) * 88))
				}
			})
		}
		window.addEventListener('deviceorientation', handleOrientation)
		return () => {
			window.removeEventListener('deviceorientation', handleOrientation)
			if (rafId !== null) cancelAnimationFrame(rafId)
		}
	}, [gyroMode])

	// Toggle cursor mode — turns off gyro if active
	const toggleCursor = () => {
		setGyroMode(false)
		setCursorMode(v => !v)
	}

	// Toggle gyro mode — requests iOS permission if needed, turns off cursor if active
	const toggleGyro = async () => {
		if (gyroMode) { setGyroMode(false); return }
		setCursorMode(false)
		const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
			requestPermission?: () => Promise<PermissionState>
		}
		if (typeof DOE.requestPermission === 'function') {
			const permission = await DOE.requestPermission()
			if (permission === 'granted') setGyroMode(true)
		} else {
			setGyroMode(true)
		}
	}

	const activeMode = cursorMode || gyroMode
	const cutInfo = CUT_LABELS[activeCut.family] ?? { name: 'Text', subtitle: '' }

	return (
		<div className="w-full flex flex-col gap-8">
			{/* Controls */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<Slider label="Font Size" value={fontSize} min={8} max={96} step={1} unit="px" onChange={setFontSize} />
				<Slider label="Hysteresis" value={hysteresis} min={0} max={4} step={0.5} unit="px" onChange={setHysteresis} />
			</div>

			{/* Mode toggles */}
			<div className="flex flex-wrap items-center gap-3">
				{showCursor && (
					<button
						onClick={toggleCursor}
						title="Move cursor up/down to control font size"
						className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all"
						style={{
							borderColor: 'currentColor',
							opacity: cursorMode ? 1 : 0.5,
							background: cursorMode ? 'var(--btn-bg)' : 'transparent',
						}}
					>
						<CursorIcon />
						<span>{cursorMode ? 'Esc to exit' : '?'}</span>
					</button>
				)}
				{showGyro && (
					<button
						onClick={toggleGyro}
						title="Tilt your device front/back to control font size"
						className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all"
						style={{
							borderColor: 'currentColor',
							opacity: gyroMode ? 1 : 0.5,
							background: gyroMode ? 'var(--btn-bg)' : 'transparent',
						}}
					>
						<GyroIcon />
						<span>{gyroMode ? 'Tilt active' : 'Tilt'}</span>
					</button>
				)}
			</div>

			{/* Active cut indicator */}
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-4 flex-wrap">
					<CutChips activeName={cutInfo.name} />
					<span className="text-xs opacity-50">{cutInfo.subtitle}</span>
				</div>
			</div>

			{/* Demo text — font-size controlled by slider or cursor or gyro */}
			<div className="rounded-lg p-6" style={{ background: 'rgba(0,0,0,0.2)' }}>
				<OpszStepperText
					cuts={CUTS}
					hysteresis={dHysteresis}
					onCutChange={setActiveCut}
					style={{
						fontSize: `${dFontSize}px`,
						lineHeight: 1.3,
						margin: 0,
					}}
				>
					{DEMO_TEXT}
				</OpszStepperText>
			</div>

			{/* Cut reference legend */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs opacity-50">
				{CUTS.map((cut) => {
					const info = CUT_LABELS[cut.family]
					const range = cut.minSize !== undefined && cut.maxSize !== undefined
						? `${cut.minSize}px – ${cut.maxSize}px`
						: cut.maxSize !== undefined
						? `< ${cut.maxSize}px`
						: `≥ ${cut.minSize}px`
					return (
						<div key={cut.family} className="flex flex-col gap-0.5">
							<span className="font-semibold opacity-100">{info?.name} cut</span>
							<span>{info?.subtitle.split(' — ')[0]}</span>
							<span className="opacity-60">{range}</span>
						</div>
					)
				})}
			</div>

			<p className="text-xs opacity-40 italic" style={{ lineHeight: 1.8 }}>
				{activeMode
					? cursorMode
						? 'Move cursor up for large sizes, down for small. Press Esc to exit.'
						: 'Tilt device toward you for smaller sizes, upright for larger.'
					: 'Drag the font-size slider to cross the 16px and 36px thresholds — watch the typeface change. The hysteresis slider sets the dead zone: font-size must overshoot the boundary by that many pixels before the cut switches, preventing oscillation at the edge.'}
			</p>
		</div>
	)
}
