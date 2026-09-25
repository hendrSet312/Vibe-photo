import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
 
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col dell-frame">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}