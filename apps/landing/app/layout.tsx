import "@repo/ui/styles.css"
import "./globals.css"
import type { Metadata } from "next"
import { Geist } from "next/font/google"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shonchoy",
  description: "Make your money make sense",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geist.className}>{children}</body>
    </html>
  )
}
