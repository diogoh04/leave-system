import { prisma } from "@/lib/prisma"

export async function GET() {
  const leaves = await prisma.leaveRequest.findMany({
    where: {
      status: { in: ["approved", "pending"] }
    }
  })

  const counts: Record<string, number> = {}

  function getDatesBetween(start: Date, end: Date) {
    const dates = []
    const current = new Date(start)

    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  for (const leave of leaves) {
    const dates = getDatesBetween(leave.startDate, leave.endDate)

    for (const date of dates) {
      const key = date.toISOString().split("T")[0]

      counts[key] = (counts[key] || 0) + 1
    }
  }

  return Response.json(counts)
}