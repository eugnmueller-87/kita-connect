import PushInit from './push-init'

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PushInit />
      {children}
    </>
  )
}
