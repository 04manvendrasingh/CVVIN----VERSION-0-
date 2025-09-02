export type Profile = {
  userId: string
  fullName: string
  email: string
  phone?: string
  qualification?: string
  college?: string
  currentYear?: string
  passingYear?: string
  pursuing?: string
  skills: string[]
  interestedRoles: string[]
  resume?: { name: string; dataUrl: string } // stored simple
  photo?: { name: string; dataUrl: string }
}

const LS_KEY = "cvvin_profile"

export function getProfile(userId: string): Profile | null {
  try {
    const raw = localStorage.getItem(`${LS_KEY}_${userId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
export function setProfile(p: Profile) {
  localStorage.setItem(`${LS_KEY}_${p.userId}`, JSON.stringify(p))
}
