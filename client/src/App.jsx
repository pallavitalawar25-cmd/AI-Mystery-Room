import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import CreateCasePage from './pages/CreateCasePage.jsx'
import InvestigationPage from './pages/InvestigationPage.jsx'
import AccusationPage from './pages/AccusationPage.jsx'
import ResultPage from './pages/ResultPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateCasePage />} />
        <Route path="/case/:id" element={<InvestigationPage />} />
        <Route path="/case/:id/accuse" element={<AccusationPage />} />
        <Route path="/case/:id/result" element={<ResultPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
