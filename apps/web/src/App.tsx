import React, { useEffect, useState } from 'react'
import { api, setAuth, clearAuth } from './api'
import './theme.css'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Quizzes from './pages/Quizzes'
import QuizDetail from './pages/QuizDetail'
import QuizEdit from './pages/QuizEdit'

type Page = 'dashboard' | 'users' | 'quizzes' | 'quizDetail' | 'quizEdit'

export function App() {
  const [user, setUser] = useState(api.me())
  const [page, setPage] = useState<Page>('dashboard')
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null)

  useEffect(() => {
    if (!user) setPage('dashboard')
  }, [user])

  if (!user) {
    return (
      <Login
        onLogin={(data) => {
          setAuth(data.data.accessToken, data.data.refreshToken, data.data.user)
          setUser(data.data.user)
        }}
      />
    )
  }

  return (
    <div>
      {/* Navbar com a marca do IFS */}
      <nav
        className="nav"
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <img
          src="/ifs-wordmark.svg"
          alt="Instituto Federal de Sergipe"
          style={{ height: 28 }}
        />

        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('quizzes')}>Quizzes</button>
        {user.role === 'ADMIN' && (
          <button onClick={() => setPage('users')}>Usuários</button>
        )}

        <div className="spacer" />
        <div className="user">
          {user.name} ({user.role})
        </div>
        <button
          onClick={() => {
            clearAuth()
            setUser(null)
          }}
        >
          Sair
        </button>
      </nav>

      <div className="container" style={{ paddingTop: 16 }}>
        {page === 'dashboard' && <Dashboard />}

        {page === 'users' && <Users />}

        {page === 'quizzes' && (
          <Quizzes
            onView={(id) => {
              setSelectedQuiz(id)
              setPage('quizDetail')
            }}
            onEdit={(id) => {
              setSelectedQuiz(id)
              setPage('quizEdit')
            }}
            onNew={() => {
              setSelectedQuiz(null)
              setPage('quizEdit')
            }}
          />
        )}

        {page === 'quizDetail' && selectedQuiz && (
          <QuizDetail id={selectedQuiz} />
        )}

        {page === 'quizEdit' && (
          <QuizEdit id={selectedQuiz} onDone={() => setPage('quizzes')} />
        )}
      </div>
    </div>
  )
}
