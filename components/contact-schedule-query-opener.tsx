"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  MSC_SCHEDULE_QUERY,
  MSC_SCHEDULE_QUERY_VALUE,
} from "@/lib/schedule-open"

/**
 * Opens the schedule modal when landing on `/` with `?schedule=1` (e.g. from a dynamic page hero).
 */
export function ContactScheduleQueryOpener({
  onOpen,
}: {
  onOpen: () => void
}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams?.get(MSC_SCHEDULE_QUERY) !== MSC_SCHEDULE_QUERY_VALUE) {
      return
    }
    onOpen()
    router.replace("/", { scroll: false })
  }, [searchParams, router, onOpen])

  return null
}
