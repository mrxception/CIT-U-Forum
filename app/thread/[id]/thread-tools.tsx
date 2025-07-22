"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Trash2, Lock, Pin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ThreadToolsProps {
  threadId: string
  currentUser: any
  threadUserId: number
  isClosed: boolean
  isPinned: boolean
}

export default function ThreadTools({ threadId, currentUser, threadUserId, isClosed, isPinned }: ThreadToolsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const isAdmin = currentUser?.role_name === "God" || currentUser?.role_name === "Moderator"
  const isOwner = currentUser?.id === threadUserId

  const handleAction = async (action: string) => {
    if (!currentUser || (!isAdmin && !isOwner)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/threads/${threadId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        })

        if (action === "delete") {
          router.push("/forums")
        } else {
          router.refresh()
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Action failed",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Network error. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser || (!isAdmin && !isOwner)) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700" disabled={loading}>
          Thread Tools
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isAdmin && (
          <>
            <DropdownMenuItem onClick={() => handleAction(isPinned ? "unpin" : "pin")}>
              <Pin className="w-4 h-4 mr-2" />
              {isPinned ? "Unpin Thread" : "Pin Thread"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(isClosed ? "open" : "close")}>
              <Lock className="w-4 h-4 mr-2" />
              {isClosed ? "Open Thread" : "Close Thread"}
            </DropdownMenuItem>
          </>
        )}
        {(isAdmin || isOwner) && (
          <DropdownMenuItem onClick={() => handleAction("delete")} className="text-red-600 focus:text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Thread
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
