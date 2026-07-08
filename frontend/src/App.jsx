import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/Dashboard'
import JDAnalyticsPage from './pages/JDAnalytics'
import ResumeParserPage from './pages/ResumeParser'
import ProfileBuilderPage from './pages/ProfileBuilder'
import TalentCheckPage from './pages/TalentCheck'
import SkillMatchingPage from './pages/SkillMatching'
import SettingsPage from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jd-analytics" element={<JDAnalyticsPage />} />
        <Route path="/resume-parser" element={<ResumeParserPage />} />
        <Route path="/profile-builder" element={<ProfileBuilderPage />} />
        <Route path="/talent-check" element={<TalentCheckPage />} />
        <Route path="/skill-matching" element={<SkillMatchingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
