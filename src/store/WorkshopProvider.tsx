import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type WorkshopStatus = 'published' | 'draft'
export type BookingStatus = 'new' | 'confirmed' | 'cancelled'

export type Workshop = {
  id: string
  title: string
  date: string
  time: string
  city: string
  duration: string
  capacity: number
  price: number
  description: string
  status: WorkshopStatus
}

export type Booking = {
  id: string
  workshopId: string
  workshopTitle: string
  workshopDate: string
  workshopTime: string
  createdAt: string
  name: string
  phone: string
  email: string
  guests: number
  note: string
  status: BookingStatus
}

type BookingInput = Pick<Booking, 'name' | 'phone' | 'email' | 'guests' | 'note'>

type WorkshopContextValue = {
  workshops: Workshop[]
  bookings: Booking[]
  publishedWorkshops: Workshop[]
  saveWorkshop: (workshop: Workshop) => void
  deleteWorkshop: (id: string) => void
  createBooking: (workshop: Workshop, input: BookingInput) => Booking
  updateBookingStatus: (id: string, status: BookingStatus) => void
}

const WORKSHOPS_KEY = 'esther.workshops.v1'
const BOOKINGS_KEY = 'esther.workshopBookings.v1'

const demoWorkshops: Workshop[] = [
  {
    id: 'wood-candle-intro-2026-09-19',
    title: 'WOOD CANDLE / INTRO',
    date: '2026-09-19',
    time: '15:00',
    city: 'Київ',
    duration: '≈ 2,5 години',
    capacity: 6,
    price: 1800,
    description: 'Від вибору зрізу дерева до заливки воску. Кожен учасник створює власну свічку ESTHER.',
    status: 'published',
  },
]

function load<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function sortWorkshops(items: Workshop[]) {
  return [...items].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
}

const WorkshopContext = createContext<WorkshopContextValue | null>(null)

export function WorkshopProvider({ children }: { children: ReactNode }) {
  const [workshops, setWorkshops] = useState<Workshop[]>(() => sortWorkshops(load(WORKSHOPS_KEY, demoWorkshops)))
  const [bookings, setBookings] = useState<Booking[]>(() => load(BOOKINGS_KEY, [] as Booking[]))

  const persistWorkshops = (next: Workshop[]) => {
    const sorted = sortWorkshops(next)
    setWorkshops(sorted)
    localStorage.setItem(WORKSHOPS_KEY, JSON.stringify(sorted))
  }

  const persistBookings = (next: Booking[]) => {
    setBookings(next)
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(next))
  }

  const saveWorkshop = (workshop: Workshop) => {
    const exists = workshops.some((item) => item.id === workshop.id)
    persistWorkshops(exists ? workshops.map((item) => item.id === workshop.id ? workshop : item) : [...workshops, workshop])
  }

  const deleteWorkshop = (id: string) => {
    persistWorkshops(workshops.filter((item) => item.id !== id))
  }

  const createBooking = (workshop: Workshop, input: BookingInput) => {
    const booking: Booking = {
      id: `WS-${Date.now().toString().slice(-8)}`,
      workshopId: workshop.id,
      workshopTitle: workshop.title,
      workshopDate: workshop.date,
      workshopTime: workshop.time,
      createdAt: new Date().toISOString(),
      ...input,
      status: 'new',
    }
    persistBookings([booking, ...bookings])
    return booking
  }

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    persistBookings(bookings.map((item) => item.id === id ? { ...item, status } : item))
  }

  const publishedWorkshops = useMemo(
    () => workshops.filter((item) => item.status === 'published'),
    [workshops],
  )

  return <WorkshopContext.Provider value={{ workshops, bookings, publishedWorkshops, saveWorkshop, deleteWorkshop, createBooking, updateBookingStatus }}>
    {children}
  </WorkshopContext.Provider>
}

export function useWorkshops() {
  const value = useContext(WorkshopContext)
  if (!value) throw new Error('useWorkshops must be used inside WorkshopProvider')
  return value
}
