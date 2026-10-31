export type OpeningHours = {
  opensAt: string
  closesAt: string
}

export type DaySchedule = {
  day: string
  hours: OpeningHours | null
}

export type SpecialClosure = {
  date: string
  note: string
}

export type OrderRules = {
  minPrepMinutes: number
  lastOrderMinutesBeforeClose: number
  maxOrdersPerSlot: number
}

export type OrderingStatus = {
  accepting: boolean
  until: string
  queued: number
  pausedMinutes?: number
}

export type OrderWindow = {
  days: string
  hours: string
}

export type ScheduleOverview = {
  status: OrderingStatus
  weekly: DaySchedule[]
  closures: SpecialClosure[]
  rules: OrderRules
  windows: OrderWindow[]
}
