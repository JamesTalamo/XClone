import { Routes, Route, Navigate } from "react-router-dom"


import HomePage from "./pages/home/HomePage.jsx"
import SignUpPage from "./pages/auth/signup/SignUpPage.jsx"
import LoginPage from "./pages/auth/login/LoginPage.jsx"
import NotificationPage from "./pages/notification/NotificationPage.jsx"
import ProfilePage from "./pages/profile/ProfilePage.jsx"

import Sidebar from "./components/common/Sidebar.jsx"
import RightPanel from "./components/common/RightPanel.jsx"

import { Toaster } from 'react-hot-toast'
import { useQuery } from "@tanstack/react-query"
import LoadingSpinner from "./components/common/LoadingSpinner.jsx"

function App() {

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/auth/me`, {
          method: 'GET',
          headers: {
            'content-type': 'application/json'
          },
          credentials: 'include'
        })
        let data = await res.json()
        if (data.error) return null

        if (!res.ok) throw new Error(data.error || 'Something Went Wrong.')

        return data
      } catch (error) {
        throw new Error(error)
      }
    },
    retry: false
  })


  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className='w-full bg-black '>
      <div className='flex max-w-6xl mx-auto'>
        {authUser && <Sidebar />}
        <Routes>
          <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
          <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
          <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />

          <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
          <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
        </Routes>
        {authUser && <RightPanel />}
        <Toaster />
      </div>
    </div>
  )
}

export default App