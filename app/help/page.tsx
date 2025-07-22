import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageSquare, Users, Settings, Shield, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-lg text-gray-600">
          Find answers to common questions and learn how to use the CIT-U Forum effectively.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Learn the basics of using the forum</p>
            <Link href="#getting-started" className="text-blue-600 hover:underline text-sm">
              View Guide →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Community Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Rules and best practices</p>
            <Link href="/rules" className="text-blue-600 hover:underline text-sm">
              Read Rules →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-purple-600" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Need additional help?</p>
            <Link href="/contact" className="text-blue-600 hover:underline text-sm">
              Contact Us →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="getting-started" id="getting-started">
              <AccordionTrigger>How do I get started on the forum?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Welcome to CIT-U Forum! Here's how to get started:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      <strong>Create an account:</strong> Click "Register" and fill in your details
                    </li>
                    <li>
                      <strong>Select your courses:</strong> Choose the courses you're enrolled in
                    </li>
                    <li>
                      <strong>Explore forums:</strong> Browse course-specific discussions
                    </li>
                    <li>
                      <strong>Start participating:</strong> Create threads or reply to existing ones
                    </li>
                  </ol>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="create-thread">
              <AccordionTrigger>How do I create a new thread?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>To create a new discussion thread:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Navigate to the course forum where you want to post</li>
                    <li>Click the "New Thread" button</li>
                    <li>Enter a descriptive title for your thread</li>
                    <li>Write your content in the text area</li>
                    <li>Click "Create Thread" to publish</li>
                  </ol>
                  <p className="text-sm text-gray-600">
                    <strong>Tip:</strong> Use clear, descriptive titles to help other students find and understand your
                    topic.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reply-quote">
              <AccordionTrigger>How do I reply to posts and use quotes?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>There are several ways to respond to posts:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <strong>Reply:</strong> Click "Reply" to respond to the entire thread
                    </li>
                    <li>
                      <strong>Quote:</strong> Click "Quote" to include someone's message in your reply
                    </li>
                    <li>
                      <strong>Direct Reply:</strong> Use the reply form at the bottom of the thread
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600">
                    Quotes help provide context for your responses and make conversations easier to follow.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="profile-settings">
              <AccordionTrigger>How do I update my profile and settings?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>To manage your account:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Click on your username in the header</li>
                    <li>Select "Settings" from the dropdown</li>
                    <li>Update your profile information, avatar, or password</li>
                    <li>Modify your course enrollments</li>
                    <li>Save your changes</li>
                  </ol>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="search">
              <AccordionTrigger>How do I search for specific topics?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Use the search feature to find relevant discussions:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Use the search bar in the header</li>
                    <li>Enter keywords related to your topic</li>
                    <li>Filter results by course or date</li>
                    <li>Browse through relevant threads</li>
                  </ul>
                  <p className="text-sm text-gray-600">
                    Always search before creating a new thread to avoid duplicates.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notifications">
              <AccordionTrigger>How do notifications work?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Stay updated with forum activity:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Get notified when someone replies to your threads</li>
                    <li>Receive updates on threads you've participated in</li>
                    <li>Check the notification bell in the header</li>
                    <li>Manage notification preferences in settings</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="badges-points">
              <AccordionTrigger>What are badges and how do I earn them?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Badges recognize your contributions to the community:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <strong>New Member:</strong> Automatically awarded when you join
                    </li>
                    <li>
                      <strong>Active Contributor:</strong> Participate regularly in discussions
                    </li>
                    <li>
                      <strong>Helper:</strong> Provide helpful answers to other students
                    </li>
                    <li>
                      <strong>Scholar:</strong> Demonstrate academic excellence
                    </li>
                    <li>
                      <strong>Veteran:</strong> Long-time active forum member
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mobile">
              <AccordionTrigger>Can I use the forum on mobile devices?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Yes! The CIT-U Forum is fully responsive and works great on:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Smartphones (iOS and Android)</li>
                    <li>Tablets</li>
                    <li>Desktop computers</li>
                    <li>Laptops</li>
                  </ul>
                  <p className="text-sm text-gray-600">
                    The interface automatically adapts to your screen size for the best experience.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="technical-issues">
              <AccordionTrigger>What should I do if I encounter technical issues?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>If you experience problems:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Try refreshing the page</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Try using a different browser</li>
                    <li>Check your internet connection</li>
                    <li>Contact support if the issue persists</li>
                  </ol>
                  <p className="text-sm text-gray-600">
                    For persistent issues, please{" "}
                    <Link href="/contact" className="text-blue-600 hover:underline">
                      contact our support team
                    </Link>{" "}
                    with details about the problem.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Forum Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Read our community guidelines and rules to ensure a positive experience for everyone.
              </p>
              <Link href="/rules" className="text-blue-600 hover:underline text-sm">
                View Forum Rules →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-600" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage your profile, password, course enrollments, and notification preferences.
              </p>
              <Link href="/settings" className="text-blue-600 hover:underline text-sm">
                Go to Settings →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
