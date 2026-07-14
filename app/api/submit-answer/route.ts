import { type NextRequest, NextResponse } from "next/server"

const ENDPOINT = "https://community-challenge.cfapps.us10.hana.ondemand.com/odata/v4/submitAnswer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { communityId, week, answer } = body?.data ?? {}

    if (!communityId?.trim() || !week?.trim() || !answer?.trim()) {
      return NextResponse.json(
        { error: "communityId, week, and answer are all required." },
        { status: 400 },
      )
    }

    const upstream = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          communityId: communityId.trim(),
          week: week.trim(),
          answer: answer.trim(),
        },
      }),
    })

    const text = await upstream.text()

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Submission failed (status ${upstream.status}).`, details: text },
        { status: upstream.status },
      )
    }

    // Some OData endpoints return an empty body on success.
    const data = text ? JSON.parse(text) : {}
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Server error: ${error.message}`
            : "Unexpected server error.",
      },
      { status: 500 },
    )
  }
}
