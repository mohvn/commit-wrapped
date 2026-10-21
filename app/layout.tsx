import type { Metadata } from "next"
import { Crete_Round, Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const creteRound = Crete_Round({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-crete-round",
})

export const metadata: Metadata = {
  title: "Commit Wrapped",
  description:
    "Your GitHub commit wrapped. Pick the years, the theme, and save the image.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${creteRound.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {children}
      </body>
    </html>
  )
}
