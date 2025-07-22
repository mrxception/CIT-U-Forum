"use client"

import { Button } from "@/components/ui/button"

interface QuoteButtonProps {
  username: string
  content: string
}

export default function QuoteButton({ username, content }: QuoteButtonProps) {
  const handleQuote = () => {
    const textarea = document.getElementById("reply-content") as HTMLTextAreaElement
    if (textarea) {
      textarea.value = `[QUOTE=${username}]${content}[/QUOTE]\n\n`
      textarea.focus()
      textarea.scrollIntoView()
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleQuote}>
      Quote
    </Button>
  )
}
