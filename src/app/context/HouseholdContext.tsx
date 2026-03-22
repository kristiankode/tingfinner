import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type {
  Household,
  HouseholdMember,
  HouseholdInvite,
  Location,
  LocationType,
  MemberRole,
} from '../lib/data'

interface HouseholdContextValue {
  household: Household | null
  locations: Location[]
  members: HouseholdMember[]
  invites: HouseholdInvite[]
  activeLocationId: string | null
  setActiveLocationId: (id: string | null) => void
  loading: boolean
  reload: () => Promise<void>
  createHousehold: (name: string) => Promise<void>
  updateHouseholdName: (name: string) => Promise<void>
  createLocation: (name: string, type: LocationType) => Promise<void>
  updateLocation: (id: string, name: string) => Promise<void>
  deleteLocation: (id: string) => Promise<void>
  createInvite: (email: string) => Promise<HouseholdInvite>
  deleteInvite: (id: string) => Promise<void>
  acceptInvite: (token: string) => Promise<{ householdName: string }>
  removeMember: (userId: string) => Promise<void>
  leaveHousehold: () => Promise<void>
}

const HouseholdContext = createContext<HouseholdContextValue | null>(null)

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [household, setHousehold] = useState<Household | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [invites, setInvites] = useState<HouseholdInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLocationId, setActiveLocationIdState] = useState<string | null>(() =>
    localStorage.getItem('activeLocationId')
  )

  function setActiveLocationId(id: string | null) {
    setActiveLocationIdState(id)
    if (id) localStorage.setItem('activeLocationId', id)
    else localStorage.removeItem('activeLocationId')
  }

  async function load() {
    if (!session) return
    setLoading(true)

    const { data: memberRow } = await supabase
      .from('household_members')
      .select('household_id, role')
      .eq('user_id', session.user.id)
      .limit(1)
      .maybeSingle()

    if (!memberRow) {
      setHousehold(null)
      setLocations([])
      setMembers([])
      setInvites([])
      setLoading(false)
      return
    }

    const householdId = memberRow.household_id

    const [
      { data: hRow },
      { data: locRows },
      { data: memRows },
      { data: invRows },
    ] = await Promise.all([
      supabase.from('households').select('*').eq('id', householdId).single(),
      supabase.from('locations').select('*').eq('household_id', householdId).order('created_at'),
      supabase.from('household_members').select('*').eq('household_id', householdId),
      supabase.from('household_invites').select('*').eq('household_id', householdId).is('accepted_at', null),
    ])

    setHousehold(
      hRow
        ? { id: hRow.id, name: hRow.name, createdByUserId: hRow.created_by, createdAt: new Date(hRow.created_at) }
        : null
    )

    const mappedLocations: Location[] = (locRows || []).map(r => ({
      id: r.id,
      householdId: r.household_id,
      name: r.name,
      type: r.type as LocationType,
      createdAt: new Date(r.created_at),
    }))
    setLocations(mappedLocations)

    // If stored activeLocationId is no longer valid, reset it
    setActiveLocationIdState(prev => {
      if (prev && !mappedLocations.find(l => l.id === prev)) {
        localStorage.removeItem('activeLocationId')
        return null
      }
      return prev
    })

    setMembers(
      (memRows || []).map(r => ({
        householdId: r.household_id,
        userId: r.user_id,
        role: r.role as MemberRole,
        joinedAt: new Date(r.joined_at),
      }))
    )

    setInvites(
      (invRows || []).map(r => ({
        id: r.id,
        householdId: r.household_id,
        invitedEmail: r.invited_email,
        token: r.token,
        createdAt: new Date(r.created_at),
        expiresAt: new Date(r.expires_at),
        acceptedAt: r.accepted_at ? new Date(r.accepted_at) : null,
      }))
    )

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [session])

  async function createHousehold(name: string) {
    if (!session) return
    const userId = session.user.id

    const { data: hh, error: hhErr } = await supabase
      .from('households')
      .insert({ name, created_by: userId })
      .select()
      .single()
    if (hhErr) throw hhErr

    const { error: memErr } = await supabase
      .from('household_members')
      .insert({ household_id: hh.id, user_id: userId, role: 'eier' })
    if (memErr) throw memErr

    const { error: locErr } = await supabase
      .from('locations')
      .insert({ household_id: hh.id, name: 'Hjemme', type: 'hus' })
    if (locErr) throw locErr

    await load()
  }

  async function updateHouseholdName(name: string) {
    if (!household) return
    const { error } = await supabase.from('households').update({ name }).eq('id', household.id)
    if (error) throw error
    setHousehold(prev => prev ? { ...prev, name } : null)
  }

  async function createLocation(name: string, type: LocationType) {
    if (!household) return
    const { error } = await supabase
      .from('locations')
      .insert({ household_id: household.id, name, type })
    if (error) throw error
    await load()
  }

  async function updateLocation(id: string, name: string) {
    const { error } = await supabase.from('locations').update({ name }).eq('id', id)
    if (error) throw error
    setLocations(prev => prev.map(l => l.id === id ? { ...l, name } : l))
  }

  async function deleteLocation(id: string) {
    const { error } = await supabase.from('locations').delete().eq('id', id)
    if (error) throw error
    if (activeLocationId === id) setActiveLocationId(null)
    setLocations(prev => prev.filter(l => l.id !== id))
  }

  async function createInvite(email: string): Promise<HouseholdInvite> {
    if (!household) throw new Error('Ingen husholdning')
    const { data, error } = await supabase
      .from('household_invites')
      .insert({ household_id: household.id, invited_email: email })
      .select()
      .single()
    if (error) throw error
    const invite: HouseholdInvite = {
      id: data.id,
      householdId: data.household_id,
      invitedEmail: data.invited_email,
      token: data.token,
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expires_at),
      acceptedAt: null,
    }
    setInvites(prev => [...prev, invite])
    return invite
  }

  async function deleteInvite(id: string) {
    const { error } = await supabase.from('household_invites').delete().eq('id', id)
    if (error) throw error
    setInvites(prev => prev.filter(i => i.id !== id))
  }

  async function acceptInvite(token: string): Promise<{ householdName: string }> {
    if (!session) throw new Error('Ikke innlogget')

    // Look up invite
    const { data: invite, error: fetchErr } = await supabase
      .from('household_invites')
      .select('*, households(name)')
      .eq('token', token)
      .is('accepted_at', null)
      .maybeSingle()
    if (fetchErr) throw fetchErr
    if (!invite) throw new Error('Invitasjonen er ugyldig eller utløpt')

    const householdName = (invite.households as { name: string }).name

    // Add member
    const { error: memErr } = await supabase
      .from('household_members')
      .insert({ household_id: invite.household_id, user_id: session.user.id, role: 'medlem' })
    if (memErr) throw memErr

    // Mark invite as accepted
    await supabase
      .from('household_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id)

    await load()
    return { householdName }
  }

  async function removeMember(userId: string) {
    if (!household) return
    const { error } = await supabase
      .from('household_members')
      .delete()
      .eq('household_id', household.id)
      .eq('user_id', userId)
    if (error) throw error
    setMembers(prev => prev.filter(m => m.userId !== userId))
  }

  async function leaveHousehold() {
    if (!session || !household) return
    await removeMember(session.user.id)
    setHousehold(null)
    setLocations([])
    setMembers([])
    setActiveLocationId(null)
  }

  return (
    <HouseholdContext.Provider
      value={{
        household,
        locations,
        members,
        invites,
        activeLocationId,
        setActiveLocationId,
        loading,
        reload: load,
        createHousehold,
        updateHouseholdName,
        createLocation,
        updateLocation,
        deleteLocation,
        createInvite,
        deleteInvite,
        acceptInvite,
        removeMember,
        leaveHousehold,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  )
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext)
  if (!ctx) throw new Error('useHousehold must be used within HouseholdProvider')
  return ctx
}
