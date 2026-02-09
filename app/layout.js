import './globals.css'

export const metadata = { title: 'Random Friend Pro v2' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900">
        {children}
      </body>
    </html>
  )
}
