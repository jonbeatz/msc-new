/** Query string used with home page to open the schedule consultation modal from deep links. */
export const MSC_SCHEDULE_QUERY = "schedule"
export const MSC_SCHEDULE_QUERY_VALUE = "1"

export function scheduleConsultationHomeHref(): string {
  return `/?${MSC_SCHEDULE_QUERY}=${MSC_SCHEDULE_QUERY_VALUE}`
}
