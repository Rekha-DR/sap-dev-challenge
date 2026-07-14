"use client"

import { useState, type FormEvent } from "react"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SapLogo } from "@/components/sap-logo"
import { cn } from "@/lib/utils"

const ENDPOINT = "/api/submit-answer"

type FieldName = "communityId" | "week" | "answer"

type FormValues = Record<FieldName, string>

type FormErrors = Partial<Record<FieldName, string>>

type Status = "idle" | "loading" | "success" | "error"

const INITIAL_VALUES: FormValues = {
  communityId: "",
  week: "",
  answer: "",
}

const FIELD_LABELS: Record<FieldName, string> = {
  communityId: "SAP Community ID",
  week: "Week",
  answer: "Answer",
}

export function SubmitAnswerForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState<string>("")

  function handleChange(field: FieldName, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    // Clear the field error as the user types.
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {}
    ;(Object.keys(values) as FieldName[]).forEach((field) => {
      if (!values[field].trim()) {
        nextErrors[field] = `${FIELD_LABELS[field]} is required.`
      }
    })
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("idle")
    setMessage("")

    if (!validate()) return

    setStatus("loading")

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            communityId: values.communityId.trim(),
            week: values.week.trim(),
            answer: values.answer.trim(),
          },
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result?.error || `Request failed with status ${response.status}`)
      }

      setStatus("success")
      setMessage("Your answer was submitted successfully.")
      setValues(INITIAL_VALUES)
      setErrors({})
    } catch (error) {
      setStatus("error")
      setMessage(
        error instanceof Error
          ? `Something went wrong: ${error.message}`
          : "Something went wrong. Please try again.",
      )
    }
  }

  const isLoading = status === "loading"

  const inputClasses =
    "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[0_2px_24px_rgba(0,0,0,0.06)] sm:p-10">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-accent">
          <SapLogo className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-card-foreground text-balance">
            Submit Your Answer
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            Enter your SAP Community details and answer for this week&apos;s challenge.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="communityId" className="text-sm font-medium text-card-foreground">
            {FIELD_LABELS.communityId} <span className="text-destructive">*</span>
          </label>
          <input
            id="communityId"
            name="communityId"
            type="text"
            value={values.communityId}
            onChange={(e) => handleChange("communityId", e.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(errors.communityId)}
            aria-describedby={errors.communityId ? "communityId-error" : undefined}
            className={cn(inputClasses, errors.communityId && "border-destructive focus-visible:ring-destructive")}
            placeholder="e.g. jane.doe"
          />
          {errors.communityId && (
            <p id="communityId-error" className="text-sm text-destructive">
              {errors.communityId}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="week" className="text-sm font-medium text-card-foreground">
            {FIELD_LABELS.week} <span className="text-destructive">*</span>
          </label>
          <input
            id="week"
            name="week"
            type="text"
            value={values.week}
            onChange={(e) => handleChange("week", e.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(errors.week)}
            aria-describedby={errors.week ? "week-error" : undefined}
            className={cn(inputClasses, errors.week && "border-destructive focus-visible:ring-destructive")}
            placeholder="e.g. Week1"
          />
          {errors.week && (
            <p id="week-error" className="text-sm text-destructive">
              {errors.week}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="answer" className="text-sm font-medium text-card-foreground">
            {FIELD_LABELS.answer} <span className="text-destructive">*</span>
          </label>
          <textarea
            id="answer"
            name="answer"
            rows={4}
            value={values.answer}
            onChange={(e) => handleChange("answer", e.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(errors.answer)}
            aria-describedby={errors.answer ? "answer-error" : undefined}
            className={cn(inputClasses, "resize-y", errors.answer && "border-destructive focus-visible:ring-destructive")}
            placeholder="Type your answer here..."
          />
          {errors.answer && (
            <p id="answer-error" className="text-sm text-destructive">
              {errors.answer}
            </p>
          )}
        </div>

        {status === "success" && message && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}

        {status === "error" && message && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-1 w-full rounded-full py-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  )
}
