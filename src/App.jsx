/* ============================================================
   APP
   ------------------------------------------------------------
   The routing table: which URL shows which screen.

   Read it as a sitemap. Every line is one address in the
   product, and the whole information architecture fits on one
   screen — which is a decent test in itself. If the sitemap
   doesn't fit on a page, neither does the mental model.

   /                  Today
   /teach             Find material
   /teach/:standard   Everything for one TEKS
   /classes           All classes
   /classes/:id       One class — roster and assignments
   /students/:id      One student
   /assignments       Option B only
   /insights          Who needs help
   /insights/assignment/:id   One assignment, scored
   ============================================================ */

import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import { AppProvider, useApp } from './store'

import Today from './screens/Today'
import Teach from './screens/Teach'
import StandardDetail from './screens/StandardDetail'
import Classes from './screens/Classes'
import ClassDetail from './screens/ClassDetail'
import Assignments from './screens/Assignments'
import Insights from './screens/Insights'
import AssignmentReport from './screens/AssignmentReport'
import StudentDetail from './screens/StudentDetail'

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <Router />
      </AppShell>
    </AppProvider>
  )
}

function Router() {
  const { ia } = useApp()

  return (
    <Routes>
      <Route path="/" element={<Today />} />
      <Route path="/teach" element={<Teach />} />
      <Route path="/teach/:standardId" element={<StandardDetail />} />
      <Route path="/classes" element={<Classes />} />
      <Route path="/classes/:classId" element={<ClassDetail />} />
      <Route path="/students/:studentId" element={<StudentDetail />} />
      <Route path="/insights" element={<Insights />} />
      {/* One assignment, one class, every child's scores. The
          only screen in the product that needs two ids, and the
          class rides in the query string rather than the path
          because the assignment is the subject and the class is
          the lens on it. */}
      <Route path="/insights/assignment/:assignmentId" element={<AssignmentReport />} />


      {/* Only reachable in Option B. In Option A the address
          redirects to Classes, so a bookmarked link never
          dead-ends. */}
      <Route
        path="/assignments"
        element={ia === 'split' ? <Assignments /> : <Navigate to="/classes" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
