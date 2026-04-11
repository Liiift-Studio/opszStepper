import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

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
	return (
		<html lang="en" className={`h-full antialiased ${inter.variable}`}>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	)
}
