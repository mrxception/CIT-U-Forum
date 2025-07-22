import { Badge } from "@/components/ui/badge"
import { Crown, Shield, Star, Ban } from "lucide-react"

interface RoleBadgeProps {
  roleName: string
  isBanned?: boolean
  className?: string
}

export function RoleBadge({ roleName, isBanned = false, className }: RoleBadgeProps) {
  if (isBanned) {
    return (
      <Badge variant="destructive" className={`text-xs ${className}`}>
        <Ban className="w-3 h-3 mr-1" />
        Banned
      </Badge>
    )
  }

  switch (roleName.toLowerCase()) {
    case "god":
      return (
        <Badge className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-xs ${className}`}>
          <Crown className="w-3 h-3 mr-1" />
          God
        </Badge>
      )
    case "moderator":
      return (
        <Badge className={`bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 text-xs ${className}`}>
          <Shield className="w-3 h-3 mr-1" />
          Moderator
        </Badge>
      )
    case "vip":
      return (
        <Badge className={`bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 text-xs ${className}`}>
          <Star className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className={`text-xs ${className}`}>
          {roleName}
        </Badge>
      )
  }
}