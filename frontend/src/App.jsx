import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './app/HomePage'
import UploadPage from './app/UploadPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App