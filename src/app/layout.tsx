import './styles/globals.css'
import Navbar from './components/navbar'

export const metadata = {
  title: 'Rate My Cv',
  description: 'CV Rating App',
  icons: {
    icon: '/favicon.ico',
  },
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        </body>
    </html>
  )
}
