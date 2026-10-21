import { Suspense } from "react"

import { WrappedApp } from "@/components/wrapped-app"

export default function Home() {
  return (
    <Suspense>
      <WrappedApp />
    </Suspense>
  )
}
