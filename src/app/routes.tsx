import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import { Home } from './pages/Home'
import { Camera } from './pages/Camera'
import { Processing } from './pages/Processing'
import { ItemForm } from './pages/ItemForm'
import { ItemDetail } from './pages/ItemDetail'
import { RoomOverview } from './pages/RoomOverview'
import { Login } from './pages/Login'
import { HouseholdSetup } from './pages/HouseholdSetup'
import { HouseholdSettings } from './pages/HouseholdSettings'
import { InviteAccept } from './pages/InviteAccept'
import { useAuth } from './context/AuthContext'
import { HouseholdProvider, useHousehold } from './context/HouseholdContext'

function RequireAuth() {
  const { session, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return (
    <HouseholdProvider>
      <Outlet />
    </HouseholdProvider>
  )
}

function RequireHousehold() {
  const { household, loading } = useHousehold()
  if (loading) return null
  if (!household) return <Navigate to="/husholdning/oppsett" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    Component: RequireAuth,
    children: [
      {
        path: '/husholdning/oppsett',
        Component: HouseholdSetup,
      },
      {
        path: '/invitasjon/:token',
        Component: InviteAccept,
      },
      {
        Component: RequireHousehold,
        children: [
          {
            path: '/',
            Component: Home,
          },
          {
            path: '/camera',
            Component: Camera,
          },
          {
            path: '/processing',
            Component: Processing,
          },
          {
            path: '/item/new',
            Component: ItemForm,
          },
          {
            path: '/item/:id',
            Component: ItemDetail,
          },
          {
            path: '/item/:id/edit',
            Component: ItemForm,
          },
          {
            path: '/room/:room',
            Component: RoomOverview,
          },
          {
            path: '/husholdning',
            Component: HouseholdSettings,
          },
        ],
      },
    ],
  },
])
