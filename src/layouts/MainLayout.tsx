import type { ReactNode } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

type MainLayoutProps = {
  children: ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="mx-auto px-4 py-4 w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout


