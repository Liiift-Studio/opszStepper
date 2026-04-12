import type { Metadata } from "next"
import "./globals.css"
import { Inter, Cormorant_Display, Cormorant_Garamond, Cormorant_SC } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

// Three Cormorant optical-size cuts — downloaded at build time, served locally
const cormorantDisplay = Cormorant_Display({
	subsets: ["latin"],
	weight: ["300", "400", "600", "700"],
	style: ["normal", "italic"],
	variable: "--font-cormorant-display",
	display: "swap",
})

const cormorantGaramond = Cormorant_Garamond({
	subsets: ["latin"],
	weight: ["300", "400", "600", "700"],
	style: ["normal", "italic"],
	variable: "--font-cormorant-garamond",
	display: "swap",
})

const cormorantSC = Cormorant_SC({
	subsets: ["latin"],
	weight: ["300", "400", "600", "700"],
	variable: "--font-cormorant-sc",
	display: "swap",
})

export const metadata: Metadata = {
	title: "Opsz Stepper — Optical font family hot-swap by font-size",
	icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
	description: "Opsz Stepper automatically swaps between optical size cuts of a typeface — Micro, Text, or Display — based on the element's computed font-size. Works with React, vanilla JS, or any framework.",
	keywords: ["optical size", "font-size", "opsz", "optical cut", "font-family", "typography", "TypeScript", "npm", "react", "variable font"],
	openGraph: {
		title: "Opsz Stepper — Optical font family hot-swap by font-size",
		description: "Automatically swap between Micro, Text, and Display optical cuts as font-size changes. A typographic precision tool, now in one npm package.",
		url: "https://opszstepper.com",
		siteName: "Opsz Stepper",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Opsz Stepper — Optical font family hot-swap by font-size",
		description: "Automatically swap between optical size cuts as font-size changes.",
	},
	metadataBase: new URL("https://opszstepper.com"),
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const fontClasses = [
		inter.variable,
		cormorantDisplay.variable,
		cormorantGaramond.variable,
		cormorantSC.variable,
	].join(" ")
	return (
		<html lang="en" className={`h-full antialiased ${fontClasses}`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
