"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Ban, Trash2, UserCheck, ShieldCheck } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdminControlsProps {
  userId: number
  isBanned: boolean
  canDelete: boolean
  username: string
  roleId: number
}

export default function AdminControls({ userId, isBanned, canDelete, username, roleId }: AdminControlsProps) {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>(roleId.toString())
  const { toast } = useToast()
  const router = useRouter()

  const handleBanToggle = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isBanned ? "unban" : "ban" }),
      })

      if (response.ok) {
        toast({
          title: isBanned ? "User Unbanned" : "User Banned",
          description: `${username} has been ${isBanned ? "unbanned" : "banned"} successfully.`,
        })
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to update user status",
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

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "User Deleted",
          description: `${username} has been deleted successfully.`,
        })
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to delete user",
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

  const handleRoleChange = async () => {
    if (!selectedRole) return
    const newRoleId = Number.parseInt(selectedRole)
    if (isNaN(newRoleId) || newRoleId < 1 || newRoleId > 4) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid role selected.",
      })
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setRole", roleId: newRoleId }),
      })

      if (response.ok) {
        toast({
          title: "Role Updated",
          description: `${username}'s role has been updated successfully.`,
        })
        router.refresh()
      } else {
        const data = await response.json()
        console.log("API Response:", data)
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Role update not supported. Server needs to be updated.",
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

  return (
    <div className="space-y-2 sm:space-y-3 mt-4">
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <Button onClick={handleBanToggle} disabled={loading} variant={isBanned ? "outline" : "destructive"} size="sm">
          {isBanned ? (
            <>
              <UserCheck className="w-4 h-4 mr-1" />
              Unban User
            </>
          ) : (
            <>
              <Ban className="w-4 h-4 mr-1" />
              Ban User
            </>
          )}
        </Button>

        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={loading}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete User
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user account for{" "}
                  <strong>{username}</strong> and replace their name with "deleted user" in all posts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:gap-2">
        <Select value={selectedRole} onValueChange={setSelectedRole} disabled={loading}>
          <SelectTrigger className="w-full sm:w-40 h-8 text-xs sm:text-sm">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1" className="text-xs sm:text-sm">Member</SelectItem>
            <SelectItem value="2" className="text-xs sm:text-sm">VIP</SelectItem>
            <SelectItem value="3" className="text-xs sm:text-sm">Moderator</SelectItem>
            <SelectItem value="4" className="text-xs sm:text-sm">God</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleRoleChange}
          disabled={loading || selectedRole === roleId.toString()}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto h-8"
        >
          <ShieldCheck className="w-4 h-4 mr-1" />
          Update Role
        </Button>
      </div>
    </div>
  )
}