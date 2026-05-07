import Demo from "@/components/Demo"
import CopyInstall from "@/components/CopyInstall"
import CodeBlock from "@/components/CodeBlock"
import ToolDirectory from "@/components/ToolDirectory"
import { version } from "../../../package.json"
import { version as siteVersion } from "../../package.json"
import SiteFooter from "../components/SiteFooter"

export default function Home() {
	return (
		<main className="flex flex-col items-center px-6 py-20 gap-24">

			{/* Hero */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<p className="text-xs uppercase tracking-widest opacity-50">opszstepper</p>
					<h1 className="text-4xl lg:text-8xl xl:text-9xl" style={{ fontFamily: "var(--font-merriweather), serif", fontVariationSettings: '"wght" 300, "opsz" 144', lineHeight: "1.05em" }}>
						Optical cuts,<br />
						<span style={{ opacity: 0.5, fontStyle: "italic" }}>on demand.</span>
					</h1>
				</div>
				<div className="flex items-center gap-4">
					<CopyInstall />
					<a href="https://github.com/Liiift-Studio/OpszStepper" className="text-sm opacity-50 hover:opacity-100 transition-opacity">GitHub</a>
				</div>
				<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-50 tracking-wide">
					<span>TypeScript</span><span>·</span><span>Zero dependencies</span><span>·</span><span>React + Vanilla JS</span>
				</div>
				<p className="text-base opacity-60 leading-relaxed max-w-lg">
					Type designers create separate optical-size cuts for the same reason optometrists prescribe different lenses for reading and driving — the geometry that works at 12px becomes wrong at 72px. Opsz Stepper detects the current font-size and hot-swaps to the correct cut, automatically.
				</p>
			</section>

			{/* Demo */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-4">
				<p className="text-xs uppercase tracking-widest opacity-50">Live demo — drag the sliders</p>
				<div className="rounded-xl -mx-8 px-8 py-8" style={{ background: "rgba(0,0,0,0.25)", overflow: 'hidden' }}>
					<Demo />
				</div>
			</section>

			{/* Explanation */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<p className="text-xs uppercase tracking-widest opacity-50">How it works</p>
				<div className="prose-grid grid grid-cols-1 sm:grid-cols-2 gap-12 text-sm leading-relaxed opacity-70">
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">Optical sizes are different drawings</p>
						<p>Micro, Text, and Display variants of the same typeface aren&rsquo;t simply scaled versions of each other. They have different stroke widths, apertures, x-heights, and spacing — each redrawn from scratch to be optically correct at its intended size range.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">ResizeObserver watches the element</p>
						<p>When the element&rsquo;s computed font-size changes — because of responsive CSS, viewport units, or user zoom — the ResizeObserver fires. Opsz Stepper re-reads the font-size and re-evaluates which cut to apply, keeping the typeface optically correct at every size.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">Hysteresis prevents oscillation</p>
						<p>If font-size sits exactly at a cut boundary — say, precisely 16px — the element would flip between cuts on every resize event. The hysteresis dead zone prevents this: font-size must pass the boundary by N pixels before the cut switches, so the boundary feels stable rather than jittery.</p>
					</div>
					<div className="flex flex-col gap-3">
						<p className="font-semibold opacity-100 text-base">Works with any font family</p>
						<p>Cuts are just CSS font-family strings. Google Fonts, locally hosted <code className="text-xs font-mono">@font-face</code> declarations, cloud fonts, Adobe Fonts — anything you can name in CSS works as a cut. The tool makes no assumptions about the fonts themselves.</p>
					</div>
				</div>
			</section>

			{/* Usage */}
			<section className="w-full max-w-2xl lg:max-w-5xl flex flex-col gap-6">
				<div className="flex items-baseline gap-4">
					<p className="text-xs uppercase tracking-widest opacity-50">Usage</p>
					<p className="text-xs opacity-50 tracking-wide">TypeScript + React · Vanilla JS</p>
				</div>
				<div className="flex flex-col gap-8 text-sm">
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Drop-in component</p>
						<CodeBlock code={`import { OpszStepperText } from '@liiift-studio/opszstepper'

<OpszStepperText cuts={[
  { family: 'Halyard Micro, sans-serif', maxSize: 13 },
  { family: 'Halyard Text, sans-serif', minSize: 13, maxSize: 28 },
  { family: 'Halyard Display, sans-serif', minSize: 28 },
]}>
  Your text here
</OpszStepperText>`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Hook — attach to any element</p>
						<CodeBlock code={`import { useOpszStepper } from '@liiift-studio/opszstepper'

const ref = useOpszStepper({ cuts })
<p ref={ref}>Your text</p>`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Vanilla JS</p>
						<CodeBlock code={`import { startOpszStepper } from '@liiift-studio/opszstepper'

const el = document.querySelector('h1')
const stop = startOpszStepper(el, { cuts })
// Call stop() to disconnect and restore original fontFamily`} />
					</div>
					<div className="flex flex-col gap-3">
						<p className="opacity-50">Options</p>
						<table className="w-full text-xs">
							<thead><tr className="opacity-50 text-left"><th className="pb-2 pr-6 font-normal">Option</th><th className="pb-2 pr-6 font-normal">Default</th><th className="pb-2 font-normal">Description</th></tr></thead>
							<tbody className="opacity-70">
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">cuts</td><td className="py-2 pr-6">required</td><td className="py-2">Array of <code className="font-mono">OpszStepperCut</code> objects, each with a <code className="font-mono">family</code> string and optional <code className="font-mono">minSize</code>/<code className="font-mono">maxSize</code> in px.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">hysteresis</td><td className="py-2 pr-6">1</td><td className="py-2">Dead zone in px at each cut boundary. Prevents oscillation when font-size sits exactly at a threshold.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">onCutChange</td><td className="py-2 pr-6">—</td><td className="py-2">Callback fired each time the active cut changes. Receives the new <code className="font-mono">OpszStepperCut</code> object.</td></tr>
								<tr className="border-t border-white/10 hover:bg-white/5 transition-colors"><td className="py-2 pr-6 font-mono">as</td><td className="py-2 pr-6">&apos;p&apos;</td><td className="py-2">HTML element to render. Accepts any valid React element type. (<code className="font-mono">OpszStepperText</code> only)</td></tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			<SiteFooter current="opszStepper" npmVersion={version} siteVersion={siteVersion} />

		</main>
	)
}
