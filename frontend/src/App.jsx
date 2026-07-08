import { Navigate, Route, Routes } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { useToast } from './hooks/useToast'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/Dashboard'
import JDAnalyticsPage from './pages/JDAnalytics'
import ResumeParserPage from './pages/ResumeParser'
import ProfileBuilderPage from './pages/ProfileBuilder'
import TalentCheckPage from './pages/TalentCheck'
import SkillMatchingPage from './pages/SkillMatching'
import SettingsPage from './pages/Settings'
import ToastContainer from './components/ToastContainer'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const { toasts, pushToast } = useToast()

  return (
    <>
      <Routes>
        <Route element={<AppLayout theme={theme} onToggleTheme={toggleTheme} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jd-analytics" element={<JDAnalyticsPage />} />
          <Route path="/resume-parser" element={<ResumeParserPage />} />
          <Route path="/profile-builder" element={<ProfileBuilderPage pushToast={pushToast} />} />
          <Route path="/talent-check" element={<TalentCheckPage />} />
          <Route path="/skill-matching" element={<SkillMatchingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ToastContainer toasts={toasts} />
    </>
  )
}
