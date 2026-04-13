"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RotateCcw, Play, Keyboard, Timer, Target, Zap } from "lucide-react"

const TIME_LIMIT = 5; // ← 好きな秒数に変更可能
const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is perfect for typing practice.",
  "Programming is the art of telling a computer what to do through a sequence of instructions. It requires patience, logic, and creativity.",
  "Technology continues to evolve at an unprecedented pace, transforming how we live, work, and communicate with each other every day.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. Never give up on your dreams and aspirations.",
  "The best way to predict the future is to create it. Innovation comes from those who dare to think differently and take action.",
]

type GameState = "idle" | "playing" | "finished"

export function TypingTest() {
  const [text, setText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [gameState, setGameState] = useState<GameState>("idle")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const [currentErrors, setCurrentErrors] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const getRandomText = useCallback(() => {
    return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]
  }, [])

  const startGame = useCallback(() => {
    const newText = getRandomText()
    setText(newText)
    setUserInput("")
    setErrors(0)
    setCurrentErrors(0)
    setStartTime(null)
    setEndTime(null)
    setGameState("playing")
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 50)
  }, [getRandomText])

  const resetGame = useCallback(() => {
    setGameState("idle")
    setUserInput("")
    setText("")
    setErrors(0)
    setCurrentErrors(0)
    setStartTime(null)
    setEndTime(null)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      if (!startTime && value.length === 1) {
        setStartTime(Date.now())
      }

      // Count errors
      let errorCount = 0
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== text[i]) {
          errorCount++
        }
      }
      setCurrentErrors(errorCount)

      // Track total errors (only count new errors)
      if (errorCount > errors) {
        setErrors(errorCount)
      }

      setUserInput(value)

      // Check if completed
      if (value.length === text.length) {
        setEndTime(Date.now())
        setGameState("finished")
      }
    },
    [text, startTime, errors]
  )

  // Calculate stats
  const elapsedTime = startTime
    ? ((endTime || Date.now()) - startTime) / 1000
    : 0
  const timeLeft = Math.max(0, TIME_LIMIT - elapsedTime);
  const wordsTyped = userInput.trim().split(/\s+/).filter(Boolean).length
  const wpm = elapsedTime > 0 ? Math.round((wordsTyped / elapsedTime) * 60) : 0
  const accuracy =
    userInput.length > 0
      ? Math.round(((userInput.length - currentErrors) / userInput.length) * 100)
      : 100
  const progress = text.length > 0 ? (userInput.length / text.length) * 100 : 0

  // Real-time timer update
  const [, setTick] = useState(0)
  useEffect(() => {
    if (gameState === "playing" && startTime) {
      const interval = setInterval(() => setTick((t) => t + 1), 100)
      return () => clearInterval(interval)
    }
    if (timeLeft <= 0 && !endTime) {
      setEndTime(Date.now());
    }
    
  }, [gameState, startTime])
 
  useEffect(() => {
    if (timeLeft <= 0 && !endTime) {
      setEndTime(Date.now());
    }
  }, [timeLeft, endTime, startTime]);
  
  const renderText = () => {
    return text.split("").map((char, index) => {
      let className = "text-muted-foreground"

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className = "text-success"
        } else {
          className = "text-destructive bg-destructive/20"
        }
      } else if (index === userInput.length) {
        className = "text-foreground bg-primary/30 animate-pulse"
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      )
    })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Keyboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">My Type App</h1>
              <p className="text-sm text-muted-foreground">Test your typing skills</p>
            </div>
          </div>
          {gameState !== "idle" && (
            <Button variant="outline" onClick={resetGame} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Stats Bar */}
        {gameState !== "idle" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WPM</p>
                  <p className="text-2xl font-bold text-foreground">{wpm}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Target className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-chart-2/10 rounded-lg">
                  <Timer className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-2xl font-bold text-foreground">{timeLeft.toFixed(1)}s</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <span className="text-destructive font-bold text-lg">!</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Errors</p>
                  <p className="text-2xl font-bold text-foreground">{errors}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          {gameState === "idle" && (
            <Card className="w-full max-w-2xl bg-card border-border">
              <CardContent className="p-8 flex flex-col items-center gap-6 text-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Keyboard className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Ready to Test Your Speed?</h2>
                  <p className="text-muted-foreground">
                    Type the text as fast and accurately as you can. Your WPM and accuracy will be calculated in real-time.
                  </p>
                </div>
                <Button size="lg" onClick={startGame} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Play className="h-5 w-5" />
                  Start Challenge
                </Button>
              </CardContent>
            </Card>
          )}

          {gameState === "playing" && (
            <Card className="w-full max-w-4xl bg-card border-border">
              <CardContent className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-primary border-primary">
                    In Progress
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {userInput.length} / {text.length} characters
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div
                  className="font-mono text-lg leading-relaxed p-4 bg-secondary/50 rounded-lg border border-primary/50 cursor-text ring-2 ring-primary/20"
                  onClick={() => inputRef.current?.focus()}
                >
                  {renderText()}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  disabled={!!endTime}   // ← これを追加
                  className="w-full p-3 bg-secondary border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Start typing here..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  autoFocus
                />
                <p className="text-center text-sm text-muted-foreground">
                  Type in the input field above - your time starts when you type the first character
                </p>
              </CardContent>
            </Card>
          )}

          {gameState === "finished" && (
            <Card className="w-full max-w-2xl bg-card border-border">
              <CardContent className="p-8 flex flex-col items-center gap-6 text-center">
                <div className="p-4 bg-success/10 rounded-full">
                  <Target className="h-12 w-12 text-success" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Challenge Complete!</h2>
                  <p className="text-muted-foreground">
                    Great job! Here are your results:
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-3xl font-bold text-primary">{wpm}</p>
                    <p className="text-sm text-muted-foreground">Words per minute</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-3xl font-bold text-success">{accuracy}%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-3xl font-bold text-chart-2">{timeLeft.toFixed(1)}s</p>
                    <p className="text-sm text-muted-foreground">Total time</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-3xl font-bold text-destructive">{errors}</p>
                    <p className="text-sm text-muted-foreground">Total errors</p>
                  </div>
                </div>
                <Button size="lg" onClick={startGame} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <RotateCcw className="h-5 w-5" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Press Start to begin your typing challenge
        </div>
      </footer>
    </div>
  )
}
