"use client"

// Interactive demo: drag font-size slider, watch opszStepper hot-swap between Cormorant cuts
import { useState, useDeferredValue } from "react"
import { OpszStepperText } from "@liiift-studio/opszstepper"
import type { OpszStepperCut } from "@liiift-studio/opszstepper"

/** Three Cormorant optical cuts: SC for micro, Garamond for text, Display for display */
const CUTS: OpszStepperCut[] = [
	{ family: 'Cormorant SC, serif',       maxSize: 16 },
	{ family: 'Cormorant Garamond, serif', minSize: 16, maxSize: 36 },
	{ family: 'Cormorant Display, serif',  minSize: 36 },
]

/** Human-readable label for each cut, keyed by family string */
const CUT_LABELS: Record<string, { name: string; subtitle: string }> = {
	'Cormorant SC, serif':       { name: 'Micro',   subtitle: 'Cormorant SC — small caps, designed for small sizes' },
	'Cormorant Garamond, serif': { name: 'Text',    subtitle: 'Cormorant Garamond — text optical size' },
	'Cormorant Display, serif':  { name: 'Display', subtitle: 'Cormorant Display — display optical size' },
}

const DEMO_TEXT = `The geometry that works at twelve points becomes wrong at seventy-two. Type designers know this — it's why they draw separate optical-size cuts. Stroke widths, apertures, spacing: all redrawn for the intended size.`

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

	const dFontSize = useDeferredValue(fontSize)
	const dHysteresis = useDeferredValue(hysteresis)

	const cutInfo = CUT_LABELS[activeCut.family] ?? { name: 'Text', subtitle: '' }

	return (
		<div className="w-full flex flex-col gap-8">
			{/* Controls */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<Slider label="Font Size" value={fontSize} min={8} max={96} step={1} unit="px" onChange={setFontSize} />
				<Slider label="Hysteresis" value={hysteresis} min={0} max={4} step={0.5} unit="px" onChange={setHysteresis} />
			</div>

			{/* Active cut indicator */}
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-4 flex-wrap">
					<CutChips activeName={cutInfo.name} />
					<span className="text-xs opacity-50">{cutInfo.subtitle}</span>
				</div>
			</div>

			{/* Demo text — font-size controlled by slider */}
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
				Drag the font-size slider to cross the 16px and 36px thresholds — watch the typeface change. The hysteresis slider sets the dead zone: font-size must overshoot the boundary by that many pixels before the cut switches, preventing oscillation at the edge.
			</p>
		</div>
	)
}
