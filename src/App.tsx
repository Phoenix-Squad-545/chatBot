import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import { navbarConfig } from './layout/NavbarData'
import { sidebarItems } from './layout/SidebarData'
import Dashboard from './pages/dashboard/Dashboard'
import Settings from './pages/settings/Settings'
import ChatbotPage from './pages/chatbot/Pages'
import LoginPage from './pages/Login/LoginPage'
import LoginPage1 from './pages/Login/LoginPage1'

/**
 * Route table — layout receives navigation data as props (single source: data files + App).
 */
function App() {
  return (
   <Routes>
  {/* Public */}
  <Route path="/login" element={<LoginPage />} />

  {/* Private */}
  <Route element={<Layout sidebarItems={sidebarItems} navbarConfig={navbarConfig} />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/chatbot" element={<ChatbotPage />} />
  </Route>

  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>
  )
}

export default App