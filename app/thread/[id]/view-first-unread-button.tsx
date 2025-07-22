"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export default function ViewFirstUnreadButton() {
  const handleClick = () => {
    const firstUnread = document.querySelector('[data-unread="true"]')
    if (firstUnread) {
      firstUnread.scrollIntoView({ behavior: "smooth" })
    } else {
      document.getElementById("reply-form")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700" onClick={handleClick}>
      <ChevronDown className="w-4 h-4 mr-1" />
      View First Unread
    </Button>
  )
}
