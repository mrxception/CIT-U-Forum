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

enum Role {
  Member = 1,
  VIP = 2,
  Moderator = 3,
  God = 4,
}

const roles = [
  { id: Role.Member, name: "Member" },
  { id: Role.VIP, name: "VIP" },
  { id: Role.Moderator, name: "Moderator" },
  { id: Role.God, name: "God" },
]

interface AdminControlsProps {
  userId: number
  isBanned: boolean
  canDelete: boolean
  username: string
  roleId: number
  currentUserRole: number
}

export default function AdminControls({ userId, isBanned, canDelete, username, roleId, currentUserRole }: AdminControlsProps) {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>(roleId.toString())
  const { toast } = useToast()
  const router = useRouter()

  const canBanOrDelete = currentUserRole === Role.God || (currentUserRole === Role.Moderator && roleId < Role.Moderator)
  const canUpdateRole = currentUserRole === Role.God

  const handleBanToggle = async () => {
    if (!canBanOrDelete) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You do not have permission to ban/unban this user.",
      })
      return
    }
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
    if (!canBanOrDelete) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You do not have permission to delete this user.",
      })
      return
    }
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
    if (!canUpdateRole) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You do not have permission to update roles.",
      })
      return
    }
    if (!selectedRole) return
    const newRoleId = Number.parseInt(selectedRole)
    if (isNaN(newRoleId) || newRoleId < Role.Member || newRoleId > Role.God) {
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
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Role update failed. Check server logs.",
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
        <Button
          onClick={handleBanToggle}
          disabled={loading || !canBanOrDelete}
          variant={isBanned ? "outline" : "destructive"}
          size="sm"
        >
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
              <Button
                variant="destructive"
                size="sm"
                disabled={loading || !canBanOrDelete}
              >
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
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!canBanOrDelete}
                >
                  Delete User
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:gap-2">
        <Select value={selectedRole} onValueChange={setSelectedRole} disabled={loading || !canUpdateRole}>
          <SelectTrigger className="w-full sm:w-40 h-8 text-xs sm:text-sm">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id.toString()} className="text-xs sm:text-sm">
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleRoleChange}
          disabled={loading || !canUpdateRole || selectedRole === roleId.toString()}
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