"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ReplyFormProps {
  threadId: string
  currentUser: any
}

export default function ReplyForm({ threadId, currentUser }: ReplyFormProps) {
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setError("Reply content is required")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: Number.parseInt(threadId),
          content: content.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Reply Posted",
          description: "Your reply has been posted successfully!",
        })
        setContent("")
        router.refresh()
      } else {
        setError(data.error || "Failed to post reply")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div id="reply-form" className="mt-6 bg-white border border-gray-300 p-4">
      <h3 className="text-lg font-semibold mb-4">Post Reply</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Textarea
          id="reply-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-32 p-3 border border-gray-300 rounded resize-none"
          placeholder="Write your reply here..."
          required
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setContent("")} disabled={submitting}>
            Clear
          </Button>
          <Button type="submit" disabled={submitting || !content.trim()}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Reply"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
