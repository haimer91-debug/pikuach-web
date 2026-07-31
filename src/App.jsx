import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Findings from './pages/Findings'
import WorkLog from './pages/WorkLog'
import Tasks from './pages/Tasks'
import Documents from './pages/Documents'
import Budget from './pages/Budget'
import Safety from './pages/Safety'
import AiPage from './pages/AiPage'
import QualityControl from './pages/QualityControl'
import Meetings from './pages/Meetings'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/findings" element={<Findings />} />
          <Route path="/worklog" element={<WorkLog />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/ai" element={<AiPage />} />
          <Route path="/qc" element={<QualityControl />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
