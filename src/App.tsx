import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import { navbarConfig } from './layout/NavbarData'
import { sidebarItems } from './layout/SidebarData'
import Dashboard from './pages/dashboard/Dashboard'
import Settings from './pages/settings/Settings'
import ChatbotPage from './pages/chatbot/Pages'

/**
 * Route table — layout receives navigation data as props (single source: data files + App).
 */
function App() {
  return (
    <Routes>
      <Route
        element={<Layout sidebarItems={sidebarItems} navbarConfig={navbarConfig} />}
      >
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App