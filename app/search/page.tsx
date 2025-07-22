"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Eye, Calendar } from "lucide-react"
import Link from "next/link"
import { RoleBadge } from "@/components/ui/role-badge"
import { useToast } from "@/hooks/use-toast"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<{ threads: any[]; users: any[] }>({ threads: [], users: [] })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchResults() {
      if (query && query.trim().length >= 2) {
        try {
          const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
          if (response.ok) {
            const data = await response.json()
            setResults(data)
            if (data.threads.length === 0 && data.users.length === 0) {
              toast({
                variant: "destructive",
                title: "No Results",
                description: "No threads or users found matching your query.",
              })
            } else {
              toast({
                title: "Search Complete",
                description: `Found ${data.threads.length} threads and ${data.users.length} users.`,
              })
            }
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to fetch search results.",
            })
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Network error. Please try again.",
          })
        }
      } else if (query) {
        toast({
          variant: "destructive",
          title: "Invalid Search",
          description: "Search query must be at least 2 characters long.",
        })
      }
    }
    fetchResults()
  }, [query, toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length < 2) {
      toast({
        variant: "destructive",
        title: "Invalid Search",
        description: "Search query must be at least 2 characters long.",
      })
      return
    }
    router.push(`/search?query=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Search threads or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 text-xs sm:text-sm"
          />
          <Button type="submit" size="sm" className="w-full sm:w-auto h-8">
            Search
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Thread Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.threads.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {results.threads.map((thread) => (
                  <div key={thread.id} className="border-b border-gray-200 pb-3 sm:pb-4 last:border-b-0">
                    <Link
                      href={`/thread/${thread.id}`}
                      className="font-medium text-blue-600 hover:underline block mb-1 text-sm sm:text-base"
                    >
                      {thread.title}
                    </Link>
                    <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                      <Badge variant="secondary" className="text-xs">
                        {thread.course_name}
                      </Badge>
                      <span>{thread.college_name}</span>
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {thread.views} views
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {thread.reply_count} replies
                      </span>
                      <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">No threads found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">User Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.users.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {results.users.map((user) => (
                  <div key={user.id} className="border-b border-gray-200 pb-3 sm:pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/user/${user.id}`}
                        className="font-medium text-blue-600 hover:underline text-sm sm:text-base"
                      >
                        {user.username}
                      </Link>
                      <RoleBadge roleName={user.role_name} isBanned={user.banned} />
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">No users found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 text-xs sm:text-sm text-gray-500">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  )
}