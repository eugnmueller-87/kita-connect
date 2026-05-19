import { redirect } from 'next/navigation'

// DEV: default role is parent — change to /admin or /teacher to test other roles
export default function Dashboard() {
  redirect('/parent')
}
