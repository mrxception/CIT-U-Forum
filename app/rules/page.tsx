import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, Users, MessageSquare, BookOpen, Gavel } from "lucide-react"

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Forum Rules & Guidelines</h1>
        <p className="text-lg text-gray-600">
          Please read and follow these rules to maintain a respectful and productive learning environment for all CIT-U
          students.
        </p>
      </div>

      <Alert className="mb-8">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Violation of these rules may result in warnings, temporary suspension, or
          permanent ban from the forum.
        </AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            General Conduct
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Be Respectful</h4>
                <p className="text-gray-600 text-sm">
                  Treat all members with respect and courtesy. Personal attacks, harassment, or discriminatory language
                  will not be tolerated.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Use Appropriate Language</h4>
                <p className="text-gray-600 text-sm">
                  Keep discussions professional and academic. Profanity, offensive language, or inappropriate content is
                  prohibited.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Stay On Topic</h4>
                <p className="text-gray-600 text-sm">
                  Keep discussions relevant to the course or topic at hand. Off-topic posts may be moved or removed.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">No Spam or Self-Promotion</h4>
                <p className="text-gray-600 text-sm">
                  Avoid repetitive posts, excessive self-promotion, or commercial advertising. Focus on educational
                  content.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-green-600" />
            Academic Integrity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Academic Honesty:</strong> All forum activities must comply with CIT-U's academic integrity
              policies.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">No Cheating or Plagiarism</h4>
                <p className="text-gray-600 text-sm">
                  Do not share assignment answers, exam solutions, or engage in any form of academic dishonesty.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Cite Your Sources</h4>
                <p className="text-gray-600 text-sm">
                  When sharing information or resources, properly cite your sources and give credit where due.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Collaborative Learning</h4>
                <p className="text-gray-600 text-sm">
                  Encourage discussion and help others understand concepts, but don't provide direct answers to
                  assignments.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Respect Intellectual Property</h4>
                <p className="text-gray-600 text-sm">
                  Do not share copyrighted materials without permission. Respect faculty and student intellectual
                  property.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
            Posting Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Use Descriptive Titles</h4>
                <p className="text-gray-600 text-sm">
                  Create clear, specific thread titles that accurately describe your topic or question.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Search Before Posting</h4>
                <p className="text-gray-600 text-sm">
                  Check if your question has already been asked and answered to avoid duplicate threads.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Post in the Right Forum</h4>
                <p className="text-gray-600 text-sm">
                  Choose the appropriate course forum for your topic. General questions can go in the main discussion
                  area.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Provide Context</h4>
                <p className="text-gray-600 text-sm">
                  Include relevant details and context in your posts to help others understand and respond effectively.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-sm font-bold">5</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Use Proper Formatting</h4>
                <p className="text-gray-600 text-sm">
                  Format your posts clearly with proper grammar, punctuation, and paragraph breaks for readability.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Prohibited Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm font-medium">The following content is strictly prohibited:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Hate speech or discriminatory content</li>
              <li>• Harassment or bullying</li>
              <li>• Inappropriate or explicit material</li>
              <li>• Spam or excessive advertising</li>
              <li>• Malicious links or malware</li>
            </ul>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Copyright infringement</li>
              <li>• Personal information sharing</li>
              <li>• Political or religious debates</li>
              <li>• Commercial solicitation</li>
              <li>• Impersonation of others</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gavel className="w-5 h-5 mr-2 text-orange-600" />
            Rule Enforcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Warning System</h4>
              <p className="text-gray-600 text-sm">
                Minor violations may result in warnings. Repeated violations will lead to more serious consequences.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Temporary Suspension</h4>
              <p className="text-gray-600 text-sm">
                Serious violations may result in temporary suspension from the forum (1-30 days).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Permanent Ban</h4>
              <p className="text-gray-600 text-sm">
                Severe or repeated violations may result in permanent removal from the forum.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Appeals Process</h4>
              <p className="text-gray-600 text-sm">
                If you believe you've been unfairly penalized, you may appeal through the contact form.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions or Concerns?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            If you have questions about these rules or need to report a violation, please contact the forum moderators.
          </p>
          <div className="flex space-x-4">
            <a
              href="/contact"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Moderators
            </a>
            <a
              href="/help"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Get Help
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
