import { useState } from 'react'
import { callAIAgent } from '@/utils/aiAgent'
import type { NormalizedAgentResponse } from '@/utils/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Check,
  Loader2,
  Settings,
  ChevronRight,
  Activity,
  Lightbulb,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Agent ID from workflow.json
const AGENT_ID = '696eb2abb50537828e0afde7'

// TypeScript interfaces based on actual_test_response
interface MealItem {
  meal_number: number
  meal_name: string
  timing: string
  food_items: string[]
  protein_content: number
  prep_instructions: string
  calendar_event_created: boolean
}

interface MealPlanResult {
  user_email: string
  daily_protein_target: number
  user_weight: number
  meals: MealItem[]
  total_protein_planned: number
  summary: string
}

interface AgentResponse extends NormalizedAgentResponse {
  result: MealPlanResult
}

// Helper function to get meal icon
function getMealIcon(mealNumber: number, timing: string) {
  const hour = parseInt(timing.split(':')[0])
  if (hour >= 6 && hour < 11) return Sun
  if (hour >= 11 && hour < 14) return Coffee
  if (hour >= 14 && hour < 18) return Sunset
  return Moon
}

// Meal Card Component
function MealCard({ meal }: { meal: MealItem }) {
  const MealIcon = getMealIcon(meal.meal_number, meal.timing)

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-green-500 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <MealIcon className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">{meal.meal_name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3" />
                {meal.timing}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            {meal.protein_content}g protein
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-gray-400 mb-2 font-medium">Food Items:</p>
          <ul className="space-y-1">
            {meal.food_items.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <Separator className="bg-gray-700" />
        <div>
          <p className="text-xs text-gray-400 mb-1 font-medium">Prep Instructions:</p>
          <p className="text-sm text-gray-300">{meal.prep_instructions}</p>
        </div>
        {meal.calendar_event_created && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <Check className="w-4 h-4" />
            <span>Calendar event created</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Profile Stats Component
function ProfileStats({ weight, target }: { weight: number; target: number }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center">
            <Activity className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{weight}kg</p>
            <p className="text-xs text-gray-400 mt-1">Current Weight</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{target}g</p>
            <p className="text-xs text-gray-400 mt-1">Daily Protein</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">Shred</p>
            <p className="text-xs text-gray-400 mt-1">Goal</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Progress Ring Component
function ProteinProgress({ current, target }: { current: number; target: number }) {
  const percentage = Math.min((current / target) * 100, 100)
  const isComplete = current >= target

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-green-500" />
          Daily Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{current}g</p>
              <p className="text-sm text-gray-400">of {target}g protein</p>
            </div>
            <div className={cn(
              "text-2xl font-bold",
              isComplete ? "text-green-500" : "text-gray-400"
            )}>
              {percentage.toFixed(0)}%
            </div>
          </div>
          <Progress
            value={percentage}
            className="h-3 bg-gray-700"
          />
          {isComplete && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Check className="w-4 h-4" />
              <span>Target achieved!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Tips Banner
function QuickTips() {
  const tips = [
    "Stay hydrated - drink 3-4 liters of water daily for optimal muscle recovery",
    "Pre-cook your protein sources on Sunday for easy meal prep throughout the week",
    "Track your meals consistently - what gets measured gets managed",
    "Sleep 7-8 hours for muscle recovery and growth hormone release"
  ]

  const [currentTip, setCurrentTip] = useState(0)

  return (
    <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/30">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-green-500/20 flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-400 mb-1">Quick Tip</p>
            <p className="text-sm text-gray-300">{tips[currentTip]}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentTip((prev) => (prev + 1) % tips.length)}
            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Profile Edit Sidebar
function ProfileSidebar({
  isOpen,
  onClose,
  userProfile,
  onUpdate
}: {
  isOpen: boolean
  onClose: () => void
  userProfile: { height: string; weight: number; goal: string; email: string }
  onUpdate: (profile: any) => void
}) {
  const [height, setHeight] = useState(userProfile.height)
  const [weight, setWeight] = useState(userProfile.weight.toString())
  const [goal, setGoal] = useState(userProfile.goal)
  const [email, setEmail] = useState(userProfile.email)

  const handleSave = () => {
    onUpdate({
      height,
      weight: parseInt(weight),
      goal,
      email
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-gray-900 border-l border-gray-700 p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-green-500" />
            Edit Profile
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400">
            Close
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white mt-2"
              placeholder="your.email@gmail.com"
            />
            <p className="text-xs text-gray-500 mt-1">Used for Google Calendar event creation</p>
          </div>

          <div>
            <Label htmlFor="height" className="text-gray-300">Height</Label>
            <Input
              id="height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white mt-2"
              placeholder="5'7&quot;"
            />
          </div>

          <div>
            <Label htmlFor="weight" className="text-gray-300">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white mt-2"
              placeholder="67"
            />
          </div>

          <div>
            <Label htmlFor="goal" className="text-gray-300">Goal</Label>
            <Input
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white mt-2"
              placeholder="Shred + Muscle gain"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main Home Component
export default function Home() {
  const [response, setResponse] = useState<AgentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // User profile state
  const [userProfile, setUserProfile] = useState({
    height: "5'7\"",
    weight: 67,
    goal: "Shred + Muscle gain",
    email: ""
  })

  // Meal time preferences
  const [mealTimes] = useState({
    breakfast: "8:00 AM",
    midMorning: "11:00 AM",
    lunch: "1:00 PM",
    evening: "5:00 PM",
    dinner: "8:00 PM"
  })

  const handleGeneratePlan = async () => {
    // Email validation
    if (!userProfile.email || !userProfile.email.includes('@')) {
      setError('Please enter a valid email address in your profile to create calendar events')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const message = `Generate today's meal plan for a ${userProfile.weight}kg male focused on ${userProfile.goal}. Email: ${userProfile.email}. Preferred meal times: Breakfast ${mealTimes.breakfast}, Mid-morning ${mealTimes.midMorning}, Lunch ${mealTimes.lunch}, Evening ${mealTimes.evening}, Dinner ${mealTimes.dinner}. I prefer easy-prep Indian non-veg options like eggs, chicken, paneer, fish. Minimal cooking skills.`

      const result = await callAIAgent(message, AGENT_ID)

      if (result.success && result.response.status === 'success') {
        setResponse(result.response as AgentResponse)
      } else {
        setError(result.response.message || 'Failed to generate meal plan')
      }
    } catch (e) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">FitFuel Daily</h1>
                <p className="text-sm text-gray-400">Your AI Nutrition Coach</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="border-gray-700 text-gray-300 hover:bg-gray-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Summary */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-green-500" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white font-medium">
                      {userProfile.email || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Height</span>
                    <span className="text-white font-medium">{userProfile.height}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Weight</span>
                    <span className="text-white font-medium">{userProfile.weight}kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Goal</span>
                    <span className="text-white font-medium">{userProfile.goal}</span>
                  </div>
                </div>
                <Separator className="bg-gray-700" />
                <ProfileStats
                  weight={userProfile.weight}
                  target={response?.result?.daily_protein_target || 134}
                />
              </CardContent>
            </Card>

            {/* Meal Times */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  Meal Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(mealTimes).map(([key, time]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white font-medium">{time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
                  Generate Today's Meal Plan
                </>
              )}
            </Button>

            {/* Progress Ring */}
            {response?.result && (
              <ProteinProgress
                current={response.result.total_protein_planned}
                target={response.result.daily_protein_target}
              />
            )}
          </div>

          {/* Right Column - Meal Plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Tips */}
            <QuickTips />

            {/* Error Display */}
            {error && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="pt-6">
                  <p className="text-red-400">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Email Confirmation Banner */}
            {response?.result?.user_email && (
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Mail className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-400">Calendar Events Created</p>
                      <p className="text-sm text-gray-300 mt-1">
                        All meal reminders have been added to: <span className="font-semibold text-white">{response.result.user_email}</span>
                      </p>
                    </div>
                    <Check className="w-6 h-6 text-green-400 ml-auto" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meal Plan Section */}
            {response?.result ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Today's Meal Plan</h2>
                  <p className="text-gray-400">{response.result.summary}</p>
                </div>

                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-4 pr-4">
                    {response.result.meals.map((meal, idx) => (
                      <MealCard key={idx} meal={meal} />
                    ))}
                  </div>
                </ScrollArea>

                {/* Summary Stats */}
                <Card className="bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Protein Planned</p>
                        <p className="text-3xl font-bold text-white mt-1">
                          {response.result.total_protein_planned}g
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Daily Target</p>
                        <p className="text-3xl font-bold text-green-400 mt-1">
                          {response.result.daily_protein_target}g
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6 text-center py-20">
                  <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    No Meal Plan Yet
                  </h3>
                  <p className="text-gray-500">
                    Click "Generate Today's Meal Plan" to create your personalized nutrition plan
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Profile Sidebar */}
      <ProfileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userProfile={userProfile}
        onUpdate={setUserProfile}
      />
    </div>
  )
}
