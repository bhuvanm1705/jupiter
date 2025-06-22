"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Coins,
  Zap,
  Globe,
  Wallet,
  Gem,
  Users,
  Play,
  GamepadIcon,
  Copy,
  ExternalLink,
  TrendingUp,
  Gift,
  Trophy,
  ArrowUpDown,
  Crown,
  Swords,
  Grid3X3,
  User,
  Clock,
  Star,
  Award,
  History,
  Settings,
  Gamepad2,
  ArrowRight,
} from "lucide-react"

// Demo wallet addresses with 100 JUP each
const DEMO_WALLETS = [
  { address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", balance: 100, username: "AliceGamer", avatar: "🚀" },
  { address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", balance: 100, username: "BobPlayer", avatar: "🌟" },
  { address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1", balance: 100, username: "CharlieWin", avatar: "💎" },
  { address: "BUGuuhPsHpk8YZrL2GctsCtXGneL1gmT5zYb7eMHZDWf", balance: 100, username: "DianaChamp", avatar: "👑" },
  { address: "3NC2FQpqXwvgXWjd9HfxQsQ8DveLQpnLMwcxvQMfcXRD", balance: 100, username: "EveStrategist", avatar: "⚡" },
  { address: "8YHFGnO4vwvgXWjd9HfxQsQ8DveLQpnLMwcxvQMfcXRD", balance: 100, username: "FrankMaster", avatar: "🎯" },
]

const CURRENCY_RATES = {
  JUP: 1,
  SOL: 0.0045,
  USDC: 0.85,
  BTC: 0.0000087,
  ETH: 0.00025,
}

interface GameState {
  connected: boolean
  walletAddress: string
  jupiterTokens: number
  balances: { [key: string]: number }
  nftCount: number
  level: number
  experience: number
  totalEarned: number
  pendingRewards: number
  transactions: Transaction[]
  gameStats: GameStats
  leaderboard: LeaderboardEntry[]
  achievements: string[]
  gameHistory: GameHistoryEntry[]
}

interface Transaction {
  id: string
  type: "earn" | "claim" | "spend" | "bet_win" | "bet_lose" | "convert"
  amount: number
  currency: string
  description: string
  timestamp: Date
  hash: string
  status: "completed" | "pending" | "failed"
}

interface GameStats {
  gamesPlayed: number
  gamesWon: number
  totalBetsWon: number
  totalBetsLost: number
  winStreak: number
  bestWinStreak: number
}

interface LeaderboardEntry {
  username: string
  address: string
  score: number
  level: number
  gamesWon: number
  avatar: string
}

interface MultiplayerGame {
  players: Player[]
  gameType: string
  betAmount: number
  status: "waiting" | "playing" | "finished"
  winner?: string
  roomId: string
}

interface Player {
  address: string
  username: string
  score: number
  isComputer: boolean
  avatar: string
  isOnline: boolean
}

interface GameHistoryEntry {
  id: string
  gameType: string
  result: "won" | "lost" | "draw"
  playerScore: number
  opponentScore: number
  opponentName: string
  reward: number
  date: Date
  isMultiplayer: boolean
}

const GAMES = [
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    description: "Classic 3x3 grid strategy game",
    difficulty: "Easy",
    reward: "10-30 JUP",
    icon: Grid3X3,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "memory-match",
    name: "Memory Match",
    description: "Match pairs of cards in sequence",
    difficulty: "Medium",
    reward: "25-75 JUP",
    icon: Gem,
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "strategy-battle",
    name: "Strategy Battle",
    description: "Turn-based tactical combat game",
    difficulty: "Hard",
    reward: "50-150 JUP",
    icon: Swords,
    color: "from-red-500 to-orange-600",
  },
]

const ACHIEVEMENTS = [
  { id: "first_win", name: "First Victory", description: "Win your first game", icon: "🏆" },
  { id: "win_streak_5", name: "Hot Streak", description: "Win 5 games in a row", icon: "🔥" },
  { id: "multiplayer_master", name: "Multiplayer Master", description: "Win 10 multiplayer games", icon: "👑" },
  { id: "token_collector", name: "Token Collector", description: "Earn 1000 JUP tokens", icon: "💰" },
  { id: "social_player", name: "Social Player", description: "Play with 5 different friends", icon: "🤝" },
]

export default function JupiterGamingPlatform() {
  const [gameState, setGameState] = useState<GameState>({
    connected: false,
    walletAddress: "",
    jupiterTokens: 0,
    balances: { JUP: 0, SOL: 0, USDC: 0, BTC: 0, ETH: 0 },
    nftCount: 0,
    level: 1,
    experience: 0,
    totalEarned: 0,
    pendingRewards: 0,
    transactions: [],
    gameStats: { gamesPlayed: 0, gamesWon: 0, totalBetsWon: 0, totalBetsLost: 0, winStreak: 0, bestWinStreak: 0 },
    leaderboard: [
      { username: "AliceGamer", address: DEMO_WALLETS[0].address, score: 2450, level: 15, gamesWon: 89, avatar: "🚀" },
      { username: "BobPlayer", address: DEMO_WALLETS[1].address, score: 1890, level: 12, gamesWon: 67, avatar: "🌟" },
      { username: "CharlieWin", address: DEMO_WALLETS[2].address, score: 3200, level: 22, gamesWon: 124, avatar: "💎" },
      { username: "DianaChamp", address: DEMO_WALLETS[3].address, score: 2100, level: 18, gamesWon: 95, avatar: "👑" },
    ],
    achievements: [],
    gameHistory: [],
  })

  const [selectedGame, setSelectedGame] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentGameData, setCurrentGameData] = useState<any>(null)

  // Multiplayer states
  const [multiplayerGame, setMultiplayerGame] = useState<MultiplayerGame | null>(null)
  const [playerCount, setPlayerCount] = useState(2)
  const [betAmount, setBetAmount] = useState(10)
  const [friendWallet, setFriendWallet] = useState("ai_opponent")
  const [showMultiplayerDialog, setShowMultiplayerDialog] = useState(false)
  const [activeRooms, setActiveRooms] = useState<MultiplayerGame[]>([])

  // Currency conversion states
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false)
  const [convertFrom, setConvertFrom] = useState("JUP")
  const [convertTo, setConvertTo] = useState("SOL")
  const [convertAmount, setConvertAmount] = useState(0)

  // Add these new states after the existing states
  const [spectatingGame, setSpectatingGame] = useState<MultiplayerGame | null>(null)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<MultiplayerGame | null>(null)
  const [joinBetAmount, setJoinBetAmount] = useState(10)
  const [liveGames, setLiveGames] = useState<MultiplayerGame[]>([])

  // Add these new states after the existing states
  const [gameResult, setGameResult] = useState<{
    winner: string
    playerScore: number
    opponentScore: number
    gameType: string
    date: Date
    reward: number
  } | null>(null)
  const [showGameResult, setShowGameResult] = useState(false)
  const [liveLeaderboard, setLiveLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isGameActive, setIsGameActive] = useState(false)

  // Add animated alert state
  const [showAnimatedAlert, setShowAnimatedAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const { toast } = useToast()

  // Animated Alert Component
  const AnimatedAlert = () => {
    if (!showAnimatedAlert) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 max-w-md mx-4 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-2xl font-bold text-white mb-4">Game Ready!</h3>
          <p className="text-white mb-6">{alertMessage}</p>
          <div className="flex items-center justify-center gap-2 text-yellow-400 mb-4">
            <span className="text-lg">Go to Games Tab</span>
            <ArrowRight className="w-6 h-6" />
            <GamepadIcon className="w-6 h-6" />
          </div>
          <Button
            onClick={() => setShowAnimatedAlert(false)}
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-2 text-lg font-semibold"
          >
            Got it!
          </Button>
        </div>
      </div>
    )
  }

  // Improved Tic Tac Toe Game Component with fixed blinking and AI
  const TicTacToeGame = ({
    onGameEnd,
    isMultiplayer = false,
    players = [],
  }: {
    onGameEnd: (score: number, winner?: string) => void
    isMultiplayer?: boolean
    players?: Player[]
  }) => {
    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null))
    const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X")
    const [gameOver, setGameOver] = useState(false)
    const [winner, setWinner] = useState<string | null>(null)
    const [moves, setMoves] = useState(0)
    const [gameStarted, setGameStarted] = useState(false)
    const [isPlayerTurn, setIsPlayerTurn] = useState(true)
    const [isAIThinking, setIsAIThinking] = useState(false)

    // Use refs to prevent multiple AI moves
    const aiMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const gameEndedRef = useRef(false)

    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ]

    // Auto-start game after component mounts - only once
    useEffect(() => {
      if (!gameStarted) {
        const timer = setTimeout(() => setGameStarted(true), 1000)
        return () => clearTimeout(timer)
      }
    }, [gameStarted])

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (aiMoveTimeoutRef.current) {
          clearTimeout(aiMoveTimeoutRef.current)
        }
      }
    }, [])

    const checkWinner = useCallback((newBoard: (string | null)[]) => {
      for (const combination of winningCombinations) {
        const [a, b, c] = combination
        if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
          return newBoard[a]
        }
      }
      return null
    }, [])

    const getCurrentPlayerName = useCallback(() => {
      if (!isMultiplayer) {
        return currentPlayer === "X" ? "You" : "AI"
      }

      if (currentPlayer === "X") {
        return "You"
      } else {
        const opponent = players.find((p) => p.address !== gameState.walletAddress)
        return opponent?.username || "Opponent"
      }
    }, [currentPlayer, isMultiplayer, players, gameState.walletAddress])

    // AI move function with better state management
    const makeAIMove = useCallback(
      (currentBoard: (string | null)[], currentMoves: number) => {
        if (gameEndedRef.current || isAIThinking) return

        setIsAIThinking(true)

        const availableMoves = currentBoard.map((cell, i) => (cell === null ? i : null)).filter((i) => i !== null)

        if (availableMoves.length > 0) {
          const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
          if (randomMove !== null) {
            const aiBoard = [...currentBoard]
            aiBoard[randomMove] = "O"
            setBoard(aiBoard)
            setMoves(currentMoves + 1)

            const aiWinner = checkWinner(aiBoard)
            if (aiWinner) {
              setWinner(aiWinner)
              setGameOver(true)
              gameEndedRef.current = true
              setTimeout(() => {
                onGameEnd(
                  aiWinner === "X" ? 100 : 0,
                  isMultiplayer ? (aiWinner === "X" ? "You" : "Opponent") : undefined,
                )
              }, 1500)
            } else if (currentMoves + 1 >= 8) {
              // Check for draw (9 total moves)
              setGameOver(true)
              gameEndedRef.current = true
              setTimeout(() => onGameEnd(50), 1500)
            } else {
              setCurrentPlayer("X")
              setIsPlayerTurn(true)
            }
          }
        }

        setIsAIThinking(false)
      },
      [checkWinner, onGameEnd, isMultiplayer, isAIThinking],
    )

    const makeMove = useCallback(
      (index: number) => {
        if (board[index] || gameOver || !gameStarted || gameEndedRef.current) return

        // In multiplayer, only allow player moves when it's their turn (X)
        if (isMultiplayer && currentPlayer === "O") return

        // Prevent moves during AI thinking
        if (isAIThinking) return

        const newBoard = [...board]
        newBoard[index] = currentPlayer
        setBoard(newBoard)
        const newMoves = moves + 1
        setMoves(newMoves)

        const gameWinner = checkWinner(newBoard)
        if (gameWinner) {
          setWinner(gameWinner)
          setGameOver(true)
          gameEndedRef.current = true
          const score = gameWinner === "X" ? 100 : 0
          setTimeout(() => {
            onGameEnd(score, isMultiplayer ? (gameWinner === "X" ? "You" : "Opponent") : undefined)
          }, 1500)
          return
        }

        if (newMoves === 9) {
          setGameOver(true)
          gameEndedRef.current = true
          setTimeout(() => onGameEnd(50), 1500) // Draw
          return
        }

        // Switch turns
        setCurrentPlayer("O")
        setIsPlayerTurn(false)

        // Clear any existing AI timeout
        if (aiMoveTimeoutRef.current) {
          clearTimeout(aiMoveTimeoutRef.current)
        }

        // Schedule AI move
        if (!gameEndedRef.current && newMoves < 9) {
          if (!isMultiplayer || (isMultiplayer && players[1]?.isComputer)) {
            aiMoveTimeoutRef.current = setTimeout(() => {
              makeAIMove(newBoard, newMoves)
            }, 1500)
          }
        }
      },
      [
        board,
        gameOver,
        gameStarted,
        isMultiplayer,
        currentPlayer,
        isAIThinking,
        moves,
        checkWinner,
        onGameEnd,
        players,
        makeAIMove,
      ],
    )

    if (!gameStarted) {
      return (
        <div className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl p-6 shadow-2xl border border-blue-400">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-2">Starting Tic Tac Toe...</h3>
            <div className="text-gray-200">Get ready to play!</div>
          </div>
        </div>
      )
    }

    return (
      <div className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl p-6 shadow-2xl border border-blue-400">
        {/* Header */}
        <div className="text-center text-white mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-2xl font-bold">🎯 Tic Tac Toe</h3>
            {isMultiplayer && <Badge className="bg-purple-500 text-white border-purple-400">Multiplayer</Badge>}
          </div>

          {!gameOver && (
            <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-4">
              <div className="text-lg font-bold mb-1">
                Current Turn: <span className="text-yellow-300 text-xl">{currentPlayer}</span>
              </div>
              <div className="text-sm text-blue-200">{getCurrentPlayerName()}'s turn</div>
              {isMultiplayer && !isPlayerTurn && currentPlayer === "O" && (
                <div className="text-xs text-gray-300 mt-1">
                  {isAIThinking ? "AI is thinking..." : "Waiting for opponent..."}
                </div>
              )}
              {!isMultiplayer && currentPlayer === "O" && (
                <div className="text-xs text-gray-300 mt-1">{isAIThinking ? "AI is thinking..." : "AI's turn"}</div>
              )}
            </div>
          )}

          {gameOver && (
            <div className="bg-black bg-opacity-40 rounded-lg p-4 mb-4">
              <div className="text-3xl mb-2">{winner ? (winner === "X" ? "🏆" : "👑") : "🤝"}</div>
              <div className="text-xl font-bold text-yellow-300">{winner ? `${winner} Wins!` : "It's a Draw!"}</div>
              {winner && (
                <div className="text-sm text-blue-200 mt-1">
                  {winner === "X" ? "You" : getCurrentPlayerName()} is victorious!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => makeMove(index)}
              disabled={
                gameOver || cell !== null || (isMultiplayer && !isPlayerTurn && currentPlayer === "O") || isAIThinking
              }
              className={`
                w-20 h-20 rounded-lg text-3xl font-bold transition-all duration-200 transform hover:scale-105
                ${
                  cell === null
                    ? "bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600 border-2 border-gray-300 hover:border-blue-400 shadow-md"
                    : cell === "X"
                      ? "bg-blue-500 text-white border-2 border-blue-400 shadow-lg"
                      : "bg-red-500 text-white border-2 border-red-400 shadow-lg"
                }
                ${
                  gameOver || cell !== null || (isMultiplayer && !isPlayerTurn && currentPlayer === "O") || isAIThinking
                    ? "cursor-not-allowed opacity-75"
                    : "cursor-pointer hover:shadow-xl"
                }
              `}
            >
              {cell || ""}
            </button>
          ))}
        </div>

        {/* Game Info */}
        <div className="text-center text-white">
          <div className="bg-black bg-opacity-30 rounded-lg p-3">
            <div className="flex items-center justify-center gap-4 text-sm">
              <span>
                Moves: <span className="text-yellow-300 font-bold">{moves}</span>
              </span>
              <span>•</span>
              <span>
                Status: <span className="text-green-300 font-bold">{gameOver ? "Finished" : "Playing"}</span>
              </span>
              {isMultiplayer && (
                <>
                  <span>•</span>
                  <span>
                    Mode: <span className="text-purple-300 font-bold">Multiplayer</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Medium Game: Memory Match
  const MemoryMatchGame = ({
    onGameEnd,
    isMultiplayer = false,
    players = [],
  }: {
    onGameEnd: (score: number, winner?: string) => void
    isMultiplayer?: boolean
    players?: Player[]
  }) => {
    const [cards, setCards] = useState<{ id: number; value: string; flipped: boolean; matched: boolean }[]>([])
    const [flippedCards, setFlippedCards] = useState<number[]>([])
    const [matches, setMatches] = useState(0)
    const [moves, setMoves] = useState(0)

    useEffect(() => {
      const symbols = ["🚀", "🌟", "💎", "🎯", "⚡", "🔥", "💫", "🎮"]
      const gameCards = [...symbols, ...symbols]
        .map((symbol, index) => ({
          id: index,
          value: symbol,
          flipped: false,
          matched: false,
        }))
        .sort(() => Math.random() - 0.5)

      setCards(gameCards)
    }, [])

    const flipCard = (cardId: number) => {
      if (flippedCards.length === 2) return

      setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, flipped: true } : card)))
      setFlippedCards((prev) => [...prev, cardId])
    }

    useEffect(() => {
      if (flippedCards.length === 2) {
        const [first, second] = flippedCards
        const firstCard = cards.find((c) => c.id === first)
        const secondCard = cards.find((c) => c.id === second)

        setTimeout(() => {
          if (firstCard?.value === secondCard?.value) {
            setCards((prev) =>
              prev.map((card) => (card.id === first || card.id === second ? { ...card, matched: true } : card)),
            )
            setMatches((prev) => prev + 1)
          } else {
            setCards((prev) =>
              prev.map((card) => (card.id === first || card.id === second ? { ...card, flipped: false } : card)),
            )
          }

          setFlippedCards([])
          setMoves((prev) => prev + 1)
        }, 1000)
      }
    }, [flippedCards, cards])

    useEffect(() => {
      if (matches === 8) {
        const score = Math.max(200 - moves * 5, 50)
        onGameEnd(score, isMultiplayer ? "You" : undefined)
      }
    }, [matches, moves, onGameEnd, isMultiplayer])

    return (
      <div className="w-full max-w-md mx-auto bg-gradient-to-b from-blue-800 to-cyan-900 rounded-lg p-4">
        <div className="text-center text-white mb-2">
          <h3 className="text-lg font-bold">Memory Match</h3>
          <p className="text-xs">
            Matches: {matches}/8 | Moves: {moves}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-1 h-40">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => flipCard(card.id)}
              disabled={card.flipped || card.matched || flippedCards.length === 2}
              className={`
                w-full h-full rounded text-lg font-bold transition-all
                ${card.flipped || card.matched ? "bg-white text-black" : "bg-blue-600 hover:bg-blue-500"}
              `}
            >
              {card.flipped || card.matched ? card.value : "?"}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Hard Game: Strategy Battle
  const StrategyBattleGame = ({
    onGameEnd,
    isMultiplayer = false,
    players = [],
  }: {
    onGameEnd: (score: number, winner?: string) => void
    isMultiplayer?: boolean
    players?: Player[]
  }) => {
    const [playerHealth, setPlayerHealth] = useState(100)
    const [enemyHealth, setEnemyHealth] = useState(100)
    const [playerEnergy, setPlayerEnergy] = useState(3)
    const [enemyEnergy, setEnemyEnergy] = useState(3)
    const [turn, setTurn] = useState<"player" | "enemy">("player")
    const [battleLog, setBattleLog] = useState<string[]>(["Battle begins!"])

    const addLog = (message: string) => {
      setBattleLog((prev) => [...prev.slice(-4), message])
    }

    const playerAction = (action: "attack" | "defend" | "charge") => {
      if (turn !== "player") return

      let damage = 0
      let energyCost = 0

      switch (action) {
        case "attack":
          if (playerEnergy < 1) return
          damage = Math.floor(Math.random() * 25) + 15
          energyCost = 1
          setEnemyHealth((prev) => Math.max(0, prev - damage))
          addLog(`You attack for ${damage} damage!`)
          break
        case "defend":
          setPlayerHealth((prev) => Math.min(100, prev + 10))
          setPlayerEnergy((prev) => Math.min(5, prev + 1))
          addLog("You defend and recover!")
          break
        case "charge":
          setPlayerEnergy((prev) => Math.min(5, prev + 2))
          addLog("You charge up energy!")
          break
      }

      setPlayerEnergy((prev) => Math.max(0, prev - energyCost))
      setTurn("enemy")

      setTimeout(() => {
        if (enemyHealth > 0) {
          const enemyAction = Math.random()
          if (enemyAction < 0.6 && enemyEnergy >= 1) {
            const enemyDamage = Math.floor(Math.random() * 20) + 10
            setPlayerHealth((prev) => Math.max(0, prev - enemyDamage))
            setEnemyEnergy((prev) => prev - 1)
            addLog(`Enemy attacks for ${enemyDamage} damage!`)
          } else {
            setEnemyEnergy((prev) => Math.min(5, prev + 2))
            addLog("Enemy charges energy!")
          }
        }
        setTurn("player")
      }, 1500)
    }

    useEffect(() => {
      if (playerHealth <= 0) {
        addLog("💀 You were defeated!")
        onGameEnd(0, isMultiplayer ? "Opponent" : undefined)
      } else if (enemyHealth <= 0) {
        addLog("🎉 Victory!")
        const score = playerHealth + playerEnergy * 10
        onGameEnd(score, isMultiplayer ? "You" : undefined)
      }
    }, [playerHealth, enemyHealth, playerEnergy, onGameEnd, isMultiplayer])

    return (
      <div className="w-full max-w-md mx-auto bg-gradient-to-b from-red-800 to-orange-900 rounded-lg p-4">
        <div className="flex justify-between mb-2">
          <div className="text-white text-sm">
            <div>
              You: {playerHealth}❤️ {playerEnergy}⚡
            </div>
            <div className="w-20 h-1 bg-gray-700 rounded">
              <div className="h-1 bg-green-500 rounded" style={{ width: `${playerHealth}%` }} />
            </div>
          </div>
          <div className="text-white text-sm text-right">
            <div>
              Enemy: {enemyHealth}❤️ {enemyEnergy}⚡
            </div>
            <div className="w-20 h-1 bg-gray-700 rounded">
              <div className="h-1 bg-red-500 rounded" style={{ width: `${enemyHealth}%` }} />
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-2">
          <Button
            onClick={() => playerAction("attack")}
            disabled={turn !== "player" || playerEnergy < 1}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            ⚔️ Attack (1⚡)
          </Button>
          <Button
            onClick={() => playerAction("defend")}
            disabled={turn !== "player"}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            🛡️ Defend
          </Button>
          <Button
            onClick={() => playerAction("charge")}
            disabled={turn !== "player"}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            ⚡ Charge
          </Button>
        </div>

        <div className="h-16 overflow-y-auto bg-gray-800 rounded p-2 text-white text-xs">
          {battleLog.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    )
  }

  // Update the connectWallet function to generate more active rooms
  const connectWallet = async (demoWallet?: string) => {
    const wallet = demoWallet || DEMO_WALLETS[0]
    const walletData =
      typeof wallet === "string" ? DEMO_WALLETS.find((w) => w.address === wallet) || DEMO_WALLETS[0] : wallet

    setGameState((prev) => ({
      ...prev,
      connected: true,
      walletAddress: walletData.address,
      jupiterTokens: walletData.balance,
      balances: {
        JUP: walletData.balance,
        SOL: walletData.balance * CURRENCY_RATES.SOL,
        USDC: walletData.balance * CURRENCY_RATES.USDC,
        BTC: walletData.balance * CURRENCY_RATES.BTC,
        ETH: walletData.balance * CURRENCY_RATES.ETH,
      },
      pendingRewards: 0,
    }))

    // Generate demo active rooms with other players (exclude current user)
    const availableWallets = DEMO_WALLETS.filter((w) => w.address !== walletData.address)

    const demoRooms = [
      {
        roomId: "room_001",
        players: [
          {
            ...availableWallets[0],
            score: 0,
            isComputer: true,
            isOnline: true,
          },
          {
            address: "waiting",
            username: "Waiting for player...",
            score: 0,
            isComputer: false,
            avatar: "⏳",
            isOnline: false,
          },
        ],
        gameType: "tic-tac-toe",
        betAmount: 15,
        status: "waiting" as const,
      },
      {
        roomId: "room_002",
        players: [
          {
            ...availableWallets[1],
            score: 0,
            isComputer: true,
            isOnline: true,
          },
          {
            address: "waiting",
            username: "Waiting for player...",
            score: 0,
            isComputer: false,
            avatar: "⏳",
            isOnline: false,
          },
        ],
        gameType: "memory-match",
        betAmount: 25,
        status: "waiting" as const,
      },
      {
        roomId: "room_003",
        players: [
          {
            ...availableWallets[2],
            score: 85,
            isComputer: true,
            isOnline: true,
          },
          {
            ...availableWallets[3],
            score: 92,
            isComputer: true,
            isOnline: true,
          },
        ],
        gameType: "strategy-battle",
        betAmount: 30,
        status: "playing" as const,
        winner: availableWallets[3].username,
      },
    ]

    setActiveRooms(demoRooms)

    // Generate live games for spectating (exclude current user)
    const liveDemoGames = [
      {
        roomId: "live_001",
        players: [
          {
            ...(availableWallets[4] || availableWallets[0]),
            score: 2,
            isComputer: true,
            isOnline: true,
          },
          {
            ...(availableWallets[5] || availableWallets[1]),
            score: 1,
            isComputer: true,
            isOnline: true,
          },
        ],
        gameType: "tic-tac-toe",
        betAmount: 20,
        status: "playing" as const,
      },
      {
        roomId: "live_002",
        players: [
          {
            ...availableWallets[2],
            score: 156,
            isComputer: true,
            isOnline: true,
          },
          {
            ...availableWallets[3],
            score: 134,
            isComputer: true,
            isOnline: true,
          },
        ],
        gameType: "memory-match",
        betAmount: 35,
        status: "playing" as const,
      },
    ]

    setLiveGames(liveDemoGames)

    toast({
      title: "Wallet Connected! 🎉",
      description: `Welcome back, ${walletData.username}! All currencies synced.`,
    })
  }

  // Fix the joinRoom function
  const joinRoom = (room: MultiplayerGame) => {
    if (room.status !== "waiting") {
      toast({
        title: "Room Not Available",
        description: "This room is not accepting new players",
        variant: "destructive",
      })
      return
    }

    if (room.players[0].address === gameState.walletAddress) {
      toast({
        title: "Cannot Join Own Room",
        description: "You cannot join a room hosted by yourself",
        variant: "destructive",
      })
      return
    }

    if (joinBetAmount > gameState.jupiterTokens) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough JUP tokens to join this room",
        variant: "destructive",
      })
      return
    }

    const currentUser = DEMO_WALLETS.find((w) => w.address === gameState.walletAddress)

    const updatedRoom: MultiplayerGame = {
      ...room,
      players: [
        room.players[0],
        {
          address: gameState.walletAddress,
          username: currentUser?.username || "You",
          score: 0,
          isComputer: false,
          avatar: currentUser?.avatar || "👤",
          isOnline: true,
        },
      ],
      betAmount: joinBetAmount,
      status: "playing",
    }

    // Set the multiplayer game state BEFORE starting the game
    setMultiplayerGame(updatedRoom)
    setSelectedGame(room.gameType)
    setShowJoinDialog(false)

    // Remove room from active rooms and add to live games
    setActiveRooms((prev) => prev.filter((r) => r.roomId !== room.roomId))
    setLiveGames((prev) => [...prev, updatedRoom])

    // Show success message
    toast({
      title: "Room Joined! 🎮",
      description: `Joined ${GAMES.find((g) => g.id === room.gameType)?.name} room! Starting game...`,
    })

    // Start the game immediately
    setTimeout(() => {
      playGame(room.gameType, true)
    }, 500)
  }

  // Add spectate function
  const spectateGame = (game: MultiplayerGame) => {
    setSpectatingGame(game)
    toast({
      title: "Spectating Game 👀",
      description: `Watching ${game.players[0].username} vs ${game.players[1].username}`,
    })
  }

  // Update the startMultiplayerGame function
  const startMultiplayerGame = () => {
    if (!friendWallet && playerCount === 2) {
      toast({
        title: "Error",
        description: "Please select an opponent",
        variant: "destructive",
      })
      return
    }

    const players: Player[] = [
      {
        address: gameState.walletAddress,
        username: DEMO_WALLETS.find((w) => w.address === gameState.walletAddress)?.username || "You",
        score: 0,
        isComputer: false,
        avatar: DEMO_WALLETS.find((w) => w.address === gameState.walletAddress)?.avatar || "👤",
        isOnline: true,
      },
    ]

    if (friendWallet && friendWallet !== "ai_opponent" && DEMO_WALLETS.find((w) => w.address === friendWallet)) {
      const friend = DEMO_WALLETS.find((w) => w.address === friendWallet)!
      players.push({
        address: friend.address,
        username: friend.username,
        score: 0,
        isComputer: true, // Computer plays as this player
        avatar: friend.avatar,
        isOnline: true,
      })
    } else {
      for (let i = 1; i < playerCount; i++) {
        players.push({
          address: `computer_${i}`,
          username: `AI Bot ${i}`,
          score: 0,
          isComputer: true,
          avatar: "🤖",
          isOnline: true,
        })
      }
    }

    const newGame: MultiplayerGame = {
      players,
      gameType: selectedGame,
      betAmount,
      status: "playing",
      roomId: `room_${Date.now()}`,
    }

    setMultiplayerGame(newGame)
    setShowMultiplayerDialog(false)

    // Add to live games
    setLiveGames((prev) => [...prev, newGame])

    // Show animated alert
    setAlertMessage(
      `Created ${GAMES.find((g) => g.id === selectedGame)?.name} room! Ready to play against ${players[1].username} for ${betAmount} JUP.`,
    )
    setShowAnimatedAlert(true)

    toast({
      title: "Room Created! 🎮",
      description: "Go to the Games tab to start playing!",
    })

    playGame(selectedGame, true)
  }

  const convertCurrency = () => {
    if (convertAmount <= 0 || convertAmount > gameState.balances[convertFrom]) {
      toast({
        title: "Error",
        description: "Invalid conversion amount",
        variant: "destructive",
      })
      return
    }

    const fromRate = CURRENCY_RATES[convertFrom as keyof typeof CURRENCY_RATES]
    const toRate = CURRENCY_RATES[convertTo as keyof typeof CURRENCY_RATES]
    const convertedAmount = (convertAmount * fromRate) / toRate

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: "convert",
      amount: convertAmount,
      currency: `${convertFrom} → ${convertTo}`,
      description: `Converted ${convertAmount} ${convertFrom} to ${convertedAmount.toFixed(6)} ${convertTo}`,
      timestamp: new Date(),
      hash: `0x${Math.random().toString(16).substr(2, 8)}`,
      status: "completed",
    }

    setGameState((prev) => ({
      ...prev,
      balances: {
        ...prev.balances,
        [convertFrom]: prev.balances[convertFrom] - convertAmount,
        [convertTo]: prev.balances[convertTo] + convertedAmount,
      },
      transactions: [transaction, ...prev.transactions],
    }))

    toast({
      title: "Conversion Successful! ✅",
      description: `Converted ${convertAmount} ${convertFrom} to ${convertedAmount.toFixed(6)} ${convertTo}`,
    })

    setShowCurrencyDialog(false)
  }

  const claimRewards = () => {
    if (gameState.pendingRewards === 0) return

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: "claim",
      amount: gameState.pendingRewards,
      currency: "JUP",
      description: "Claimed pending rewards",
      timestamp: new Date(),
      hash: `0x${Math.random().toString(16).substr(2, 8)}`,
      status: "completed",
    }

    setGameState((prev) => {
      const newJupBalance = prev.balances.JUP + prev.pendingRewards

      // Automatically update all currency balances when claiming rewards
      const updatedBalances = {
        JUP: newJupBalance,
        SOL: newJupBalance * CURRENCY_RATES.SOL,
        USDC: newJupBalance * CURRENCY_RATES.USDC,
        BTC: newJupBalance * CURRENCY_RATES.BTC,
        ETH: newJupBalance * CURRENCY_RATES.ETH,
      }

      return {
        ...prev,
        jupiterTokens: prev.jupiterTokens + prev.pendingRewards,
        balances: updatedBalances,
        pendingRewards: 0,
        transactions: [transaction, ...prev.transactions],
      }
    })

    toast({
      title: "Rewards Claimed! 💰",
      description: `${gameState.pendingRewards} JUP tokens added to your wallet. All currencies updated!`,
    })
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(gameState.walletAddress)
    toast({
      title: "Address Copied! 📋",
      description: "Wallet address copied to clipboard",
    })
  }

  const renderCurrentGame = () => {
    if (!isPlaying || !currentGameData) return null

    const gameProps = {
      onGameEnd: handleGameEnd,
      isMultiplayer: currentGameData.type === "multiplayer",
      players: currentGameData.type === "multiplayer" ? multiplayerGame?.players || [] : [],
    }

    switch (selectedGame) {
      case "tic-tac-toe":
        return <TicTacToeGame {...gameProps} />
      case "memory-match":
        return <MemoryMatchGame {...gameProps} />
      case "strategy-battle":
        return <StrategyBattleGame {...gameProps} />
      default:
        return null
    }
  }

  const playGame = (gameId: string, isMultiplayer = false) => {
    setIsPlaying(true)
    setSelectedGame(gameId)
    setIsGameActive(true)

    // Initialize live leaderboard for multiplayer games
    if (isMultiplayer && multiplayerGame) {
      const initialLeaderboard = multiplayerGame.players.map((player) => ({
        username: player.username,
        address: player.address,
        score: 0,
        level: DEMO_WALLETS.find((w) => w.address === player.address)?.balance || 1,
        gamesWon: 0,
        avatar: player.avatar,
      }))
      setLiveLeaderboard(initialLeaderboard)
    }

    const gameData = {
      type: isMultiplayer ? "multiplayer" : "solo",
      gameId: gameId,
      players: isMultiplayer ? multiplayerGame?.players || [] : [],
    }

    setCurrentGameData(gameData)

    // Show game start notification
    toast({
      title: `🎮 ${GAMES.find((g) => g.id === gameId)?.name} Started!`,
      description: isMultiplayer ? "Multiplayer game is now live!" : "Solo game started - good luck!",
    })
  }

  const handleGameEnd = (score: number, winner?: string) => {
    setIsPlaying(false)
    setCurrentGameData(null)
    setIsGameActive(false)

    const reward = Math.round(score * 0.5)

    // Create game result for multiplayer games
    if (multiplayerGame && winner) {
      const playerScore = winner === "You" ? score : 0
      const opponentScore = winner === "Opponent" ? score : playerScore === 0 ? 100 : 0

      setGameResult({
        winner: winner,
        playerScore: playerScore,
        opponentScore: opponentScore,
        gameType: selectedGame,
        date: new Date(),
        reward: winner === "You" ? reward : 0,
      })
      setShowGameResult(true)

      // Add to game history
      const historyEntry: GameHistoryEntry = {
        id: Date.now().toString(),
        gameType: selectedGame,
        result: winner === "You" ? "won" : "lost",
        playerScore: playerScore,
        opponentScore: opponentScore,
        opponentName: multiplayerGame.players[1]?.username || "Opponent",
        reward: winner === "You" ? reward : 0,
        date: new Date(),
        isMultiplayer: true,
      }

      setGameState((prev) => ({
        ...prev,
        gameHistory: [historyEntry, ...prev.gameHistory],
      }))
    } else if (!multiplayerGame) {
      // Solo game history
      const gameResult = score > 50 ? "won" : "lost"
      const historyEntry: GameHistoryEntry = {
        id: Date.now().toString(),
        gameType: selectedGame,
        result: gameResult,
        playerScore: score,
        opponentScore: 0,
        opponentName: "AI",
        reward: reward,
        date: new Date(),
        isMultiplayer: false,
      }

      setGameState((prev) => ({
        ...prev,
        gameHistory: [historyEntry, ...prev.gameHistory],
      }))

      // Show win/lose notification for solo games
      toast({
        title: gameResult === "won" ? "🎉 You Won!" : "💀 You Lost!",
        description: `${gameResult === "won" ? "Great job!" : "Better luck next time!"} You earned ${reward} JUP tokens`,
      })
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: "earn",
      amount: reward,
      currency: "JUP",
      description: `Earned ${reward} JUP from ${selectedGame}`,
      timestamp: new Date(),
      hash: `0x${Math.random().toString(16).substr(2, 8)}`,
      status: "completed",
    }

    setGameState((prev) => {
      const newJupBalance = prev.balances.JUP + reward

      // Automatically update all currency balances based on new JUP amount
      const updatedBalances = {
        JUP: newJupBalance,
        SOL: newJupBalance * CURRENCY_RATES.SOL,
        USDC: newJupBalance * CURRENCY_RATES.USDC,
        BTC: newJupBalance * CURRENCY_RATES.BTC,
        ETH: newJupBalance * CURRENCY_RATES.ETH,
      }

      return {
        ...prev,
        jupiterTokens: prev.jupiterTokens + reward,
        balances: updatedBalances,
        totalEarned: prev.totalEarned + reward,
        pendingRewards: prev.pendingRewards + reward,
        experience: prev.experience + score,
        gameStats: {
          ...prev.gameStats,
          gamesPlayed: prev.gameStats.gamesPlayed + 1,
          gamesWon: prev.gameStats.gamesWon + (winner === "You" || (!winner && score > 50) ? 1 : 0),
          winStreak: winner === "You" || (!winner && score > 50) ? prev.gameStats.winStreak + 1 : 0,
          bestWinStreak: Math.max(
            prev.gameStats.bestWinStreak,
            winner === "You" || (!winner && score > 50) ? prev.gameStats.winStreak + 1 : 0,
          ),
        },
        transactions: [transaction, ...prev.transactions],
      }
    })

    // Show win/lose notification for multiplayer games
    if (multiplayerGame && winner) {
      setTimeout(() => {
        toast({
          title: winner === "You" ? "🎉 Victory!" : "💀 Defeat!",
          description:
            winner === "You"
              ? `Congratulations! You beat ${multiplayerGame.players[1]?.username}!`
              : `${multiplayerGame.players[1]?.username} won this round. Try again!`,
        })
      }, 500)
    }
  }

  // Add this useEffect for spectating game updates
  useEffect(() => {
    if (spectatingGame) {
      const interval = setInterval(() => {
        setLiveGames((prev) =>
          prev.map((game) => {
            if (game.roomId === spectatingGame.roomId) {
              const updatedGame = {
                ...game,
                players: game.players.map((player) => ({
                  ...player,
                  score: player.score + Math.floor(Math.random() * 5) + 1,
                })),
              }

              // Check if someone won (score > 100 for demo)
              const winner = updatedGame.players.find((p) => p.score > 100)
              if (winner && game.status === "playing") {
                updatedGame.status = "finished"
                updatedGame.winner = winner.username

                // Show winner notification
                setTimeout(() => {
                  toast({
                    title: `🏆 Game Finished!`,
                    description: `${winner.username} won the ${GAMES.find((g) => g.id === game.gameType)?.name} match!`,
                  })
                }, 1000)
              }

              // Update spectating game if it's the same
              if (spectatingGame.roomId === game.roomId) {
                setSpectatingGame(updatedGame)
              }

              return updatedGame
            }
            return game
          }),
        )
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [spectatingGame])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white">
      <AnimatedAlert />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Jupiter Gaming Platform</h1>
              <p className="text-gray-300">Play • Earn • Trade • Compete</p>
            </div>
          </div>

          {!gameState.connected ? (
            <div className="flex gap-2">
              <Select onValueChange={connectWallet}>
                <SelectTrigger className="w-48 bg-purple-600 border-purple-500">
                  <SelectValue placeholder="Connect Demo Wallet" />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_WALLETS.map((wallet) => (
                    <SelectItem key={wallet.address} value={wallet.address}>
                      {wallet.avatar} {wallet.username} ({wallet.balance} JUP)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => connectWallet()} className="bg-green-600 hover:bg-green-700">
                <Wallet className="w-4 h-4 mr-2" />
                Real Wallet
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-yellow-600">
                <Coins className="w-4 h-4 mr-1" />
                {gameState.jupiterTokens} JUP
              </Badge>
              <Badge variant="secondary" className="bg-green-600">
                <Gift className="w-4 h-4 mr-1" />
                {gameState.pendingRewards} Pending
              </Badge>
              <Badge variant="secondary" className="bg-blue-600">
                <Star className="w-4 h-4 mr-1" />
                Level {gameState.level}
              </Badge>
              <Button variant="outline" size="sm" onClick={copyAddress} className="text-xs">
                {DEMO_WALLETS.find((w) => w.address === gameState.walletAddress)?.avatar || "👤"}
                {gameState.walletAddress.slice(0, 6)}...{gameState.walletAddress.slice(-4)}
                <Copy className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {!gameState.connected ? (
          <Card className="bg-gray-900 border-gray-700 text-center py-12">
            <CardContent>
              <Wallet className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-2xl font-bold mb-2">Connect Your Jupiter Wallet</h2>
              <p className="text-gray-400 mb-6">Choose a demo wallet or connect your real wallet to start gaming!</p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Demo Wallets (100 JUP each):</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                    {DEMO_WALLETS.map((wallet) => (
                      <Button
                        key={wallet.address}
                        onClick={() => connectWallet(wallet.address)}
                        variant="outline"
                        className="text-sm p-4 h-auto flex flex-col items-center gap-2"
                      >
                        <span className="text-2xl">{wallet.avatar}</span>
                        <span className="font-medium">{wallet.username}</span>
                        <span className="text-xs text-gray-400">{wallet.address.slice(0, 8)}...</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-500 max-w-md mx-auto">
                  <p>
                    <strong>Demo Addresses for Testing:</strong>
                  </p>
                  <div className="mt-2 space-y-1 text-xs font-mono">
                    {DEMO_WALLETS.map((wallet) => (
                      <div key={wallet.address} className="flex justify-between">
                        <span>{wallet.username}:</span>
                        <span>{wallet.address}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="games" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800">
              <TabsTrigger value="games" className="data-[state=active]:bg-purple-600">
                <GamepadIcon className="w-4 h-4 mr-2" />
                Games
              </TabsTrigger>
              <TabsTrigger value="rewards" className="data-[state=active]:bg-purple-600">
                <Coins className="w-4 h-4 mr-2" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="multiplayer" className="data-[state=active]:bg-purple-600">
                <Users className="w-4 h-4 mr-2" />
                Multiplayer
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-purple-600">
                <User className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                Stats
              </TabsTrigger>
            </TabsList>

            {/* Games Tab */}
            <TabsContent value="games" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GamepadIcon className="w-5 h-5" />
                    Choose Your Game
                  </CardTitle>
                  <CardDescription>Play solo games to earn JUP tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  {isPlaying && currentGameData && (
                    <div className="mb-6">
                      <div className="flex justify-between mb-4">
                        <span>Playing {GAMES.find((g) => g.id === selectedGame)?.name}...</span>
                        <span>Score will determine rewards!</span>
                      </div>
                      {renderCurrentGame()}

                      {/* Static Leaderboard for Multiplayer - removed blinking animations */}
                      {currentGameData.type === "multiplayer" && liveLeaderboard.length > 0 && (
                        <Card className="mt-4 bg-gray-800 border-yellow-500">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">🏆 Game Leaderboard</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {liveLeaderboard
                                .sort((a, b) => b.score - a.score)
                                .map((entry, index) => (
                                  <div
                                    key={entry.address}
                                    className={`flex items-center justify-between p-2 rounded transition-all duration-300 ${
                                      index === 0 ? "bg-yellow-600" : "bg-gray-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{entry.avatar}</span>
                                      <span className="font-medium">{entry.username}</span>
                                      {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                                    </div>
                                    <div className="font-bold text-yellow-400">{entry.score}</div>
                                  </div>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Game Result Dialog */}
                  <Dialog open={showGameResult} onOpenChange={setShowGameResult}>
                    <DialogContent className="bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {gameResult?.winner === "You" ? "🎉 Victory!" : "💀 Defeat!"}
                        </DialogTitle>
                      </DialogHeader>
                      {gameResult && (
                        <div className="space-y-4">
                          <div className="text-center">
                            <div
                              className={`text-6xl mb-4 ${gameResult.winner === "You" ? "text-green-400" : "text-red-400"}`}
                            >
                              {gameResult.winner === "You" ? "🏆" : "😔"}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                              {gameResult.winner === "You" ? "Congratulations!" : "Better luck next time!"}
                            </h3>
                            <p className="text-gray-400">
                              {GAMES.find((g) => g.id === gameResult.gameType)?.name} •{" "}
                              {gameResult.date.toLocaleDateString()}
                            </p>
                          </div>

                          <div className="bg-gray-800 rounded-lg p-4">
                            <h4 className="font-bold mb-3 text-center">Final Scores</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">
                                    {DEMO_WALLETS.find((w) => w.address === gameState.walletAddress)?.avatar || "👤"}
                                  </span>
                                  <span>You</span>
                                </div>
                                <span className="font-bold text-yellow-400">{gameResult.playerScore}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{multiplayerGame?.players[1]?.avatar || "🤖"}</span>
                                  <span>{multiplayerGame?.players[1]?.username || "Opponent"}</span>
                                </div>
                                <span className="font-bold text-yellow-400">{gameResult.opponentScore}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-800 rounded-lg p-4 text-center">
                            <div className="text-sm text-gray-400 mb-1">Reward Earned</div>
                            <div className="text-2xl font-bold text-green-400">+{gameResult.reward} JUP</div>
                          </div>

                          <Button
                            onClick={() => {
                              setShowGameResult(false)
                              setGameResult(null)
                              setMultiplayerGame(null)
                            }}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            Continue Playing
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {GAMES.map((game) => (
                      <Card
                        key={game.id}
                        className="bg-gray-800 border-gray-600 hover:border-purple-500 transition-colors"
                      >
                        <CardHeader>
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${game.color} rounded-lg flex items-center justify-center mb-3`}
                          >
                            <game.icon className="w-6 h-6" />
                          </div>
                          <CardTitle className="text-lg">{game.name}</CardTitle>
                          <CardDescription>{game.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">Difficulty:</span>
                              <Badge variant="outline">{game.difficulty}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">Reward:</span>
                              <span className="text-sm font-medium text-yellow-400">{game.reward}</span>
                            </div>
                          </div>
                          <Button
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={() => playGame(game.id)}
                            disabled={isPlaying}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {isPlaying && selectedGame === game.id ? "Playing..." : "Play Now"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rewards Tab */}
            <TabsContent value="rewards" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-r from-green-800 to-emerald-800 border-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Pending Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">{gameState.pendingRewards} JUP</div>
                    <Button
                      onClick={claimRewards}
                      disabled={gameState.pendingRewards === 0}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Claim Rewards
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-800 to-purple-800 border-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="w-5 h-5" />
                      Total Earned
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">{gameState.totalEarned} JUP</div>
                    <div className="text-sm text-gray-300">Lifetime earnings from gaming</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {gameState.transactions.length === 0 ? (
                      <p className="text-gray-400">No transactions yet. Start playing to earn rewards!</p>
                    ) : (
                      gameState.transactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{tx.description}</div>
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {tx.timestamp.toLocaleString()}
                              <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="text-xs">
                                {tx.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 font-mono">{tx.hash}</div>
                          </div>
                          <div className={`font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                            {tx.amount > 0 ? "+" : ""}
                            {tx.amount} {tx.currency}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Multiplayer Tab */}
            <TabsContent value="multiplayer" className="space-y-6">
              {/* Live Leaderboard */}
              <Card className="bg-gradient-to-r from-purple-800 to-blue-800 border-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Live Leaderboard & Active Games
                  </CardTitle>
                  <CardDescription>Watch live games and see real-time results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Live Games */}
                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🔴 Live Games</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {liveGames.map((game) => (
                          <div key={game.roomId} className="bg-gray-800 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-sm">{GAMES.find((g) => g.id === game.gameType)?.name}</h4>
                                <p className="text-xs text-gray-400">Room: {game.roomId}</p>
                              </div>
                              <Badge
                                variant="default"
                                className={`${game.status === "finished" ? "bg-green-600" : "bg-red-600"}`}
                              >
                                {game.status === "finished" ? "🏁 FINISHED" : "🔴 LIVE"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span>{game.players[0].avatar}</span>
                                <span className="font-medium">{game.players[0].username}</span>
                                <span className="text-yellow-400">{game.players[0].score}</span>
                                {game.winner === game.players[0].username && (
                                  <Crown className="w-4 h-4 text-yellow-400" />
                                )}
                              </div>
                              <span className="text-gray-400 text-xs">VS</span>
                              <div className="flex items-center gap-2 text-sm">
                                {game.winner === game.players[1].username && (
                                  <Crown className="w-4 h-4 text-yellow-400" />
                                )}
                                <span className="text-yellow-400">{game.players[1].score}</span>
                                <span className="font-medium">{game.players[1].username}</span>
                                <span>{game.players[1].avatar}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-yellow-400">Bet: {game.betAmount} JUP</span>
                              {game.status === "finished" ? (
                                <Badge variant="outline" className="text-xs">
                                  Winner: {game.winner}
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => spectateGame(game)}
                                  className="text-xs"
                                >
                                  👀 Spectate
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Players */}
                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">🏆 Top Players</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {gameState.leaderboard.map((entry, index) => (
                          <div
                            key={entry.address}
                            className="flex items-center justify-between p-2 bg-gray-800 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  index === 0
                                    ? "bg-yellow-500"
                                    : index === 1
                                      ? "bg-gray-400"
                                      : index === 2
                                        ? "bg-orange-600"
                                        : "bg-gray-600"
                                }`}
                              >
                                {index < 3 ? <Crown className="w-3 h-3" /> : index + 1}
                              </div>
                              <span className="text-lg">{entry.avatar}</span>
                              <div>
                                <div className="font-medium text-sm">{entry.username}</div>
                                <div className="text-xs text-gray-400">Level {entry.level}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-yellow-400 text-sm">{entry.score}</div>
                              <div className="text-xs text-gray-400">{entry.gamesWon}W</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Spectating Game */}
              {spectatingGame && (
                <Card className="bg-gray-900 border-yellow-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      👀 Spectating: {GAMES.find((g) => g.id === spectatingGame.gameType)?.name}
                    </CardTitle>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{spectatingGame.players[0].avatar}</span>
                        <span className="font-bold">{spectatingGame.players[0].username}</span>
                        <Badge variant="secondary">{spectatingGame.players[0].score}</Badge>
                        {spectatingGame.winner === spectatingGame.players[0].username && (
                          <Crown className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                      <span className="text-gray-400">VS</span>
                      <div className="flex items-center gap-2">
                        {spectatingGame.winner === spectatingGame.players[1].username && (
                          <Crown className="w-5 h-5 text-yellow-400" />
                        )}
                        <Badge variant="secondary">{spectatingGame.players[1].score}</Badge>
                        <span className="font-bold">{spectatingGame.players[1].username}</span>
                        <span className="text-2xl">{spectatingGame.players[1].avatar}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <div className="text-center text-white mb-2">
                        <h3 className="text-lg font-bold">
                          {spectatingGame.status === "finished" ? "🏁 Game Finished!" : "🎮 Game in Progress"}
                        </h3>
                        <p className="text-sm text-gray-400">Bet Amount: {spectatingGame.betAmount} JUP</p>
                        {spectatingGame.winner && (
                          <p className="text-lg font-bold text-yellow-400 mt-2">🏆 Winner: {spectatingGame.winner}!</p>
                        )}
                      </div>
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-center">
                        <div className="text-white">
                          <div className="text-lg font-bold mb-2">Live Game View</div>
                          <div className="text-sm">
                            {spectatingGame.players[0].username} vs {spectatingGame.players[1].username}
                          </div>
                          <div className="mt-2 text-xs text-gray-200">
                            Current Score: {spectatingGame.players[0].score} - {spectatingGame.players[1].score}
                          </div>
                          {spectatingGame.status === "playing" && (
                            <div className="mt-2 text-xs text-yellow-300">Scores updating live...</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => setSpectatingGame(null)} variant="outline" className="w-full">
                      Stop Spectating
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Active Rooms */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Available Game Rooms
                  </CardTitle>
                  <CardDescription>Join existing games or create your own</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {activeRooms.map((room) => (
                      <Card key={room.roomId} className="bg-gray-800 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold">{GAMES.find((g) => g.id === room.gameType)?.name}</h4>
                              <p className="text-sm text-gray-400">Room: {room.roomId}</p>
                            </div>
                            <Badge variant={room.status === "waiting" ? "secondary" : "default"}>
                              {room.status === "waiting" ? "🟡 Open" : "🟢 Playing"}
                            </Badge>
                          </div>
                          <div className="space-y-2 mb-3">
                            {room.players.map((player, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{player.avatar}</span>
                                <span
                                  className={player.username === "Waiting for player..." ? "text-gray-400 italic" : ""}
                                >
                                  {player.username}
                                </span>
                                {player.isOnline && player.username !== "Waiting for player..." && (
                                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                                )}
                                {player.isComputer && player.username !== "Waiting for player..." && (
                                  <Badge variant="outline" className="text-xs">
                                    AI
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-yellow-400">Bet: {room.betAmount} JUP</span>
                            <div className="flex gap-2">
                              {room.status === "waiting" ? (
                                <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => {
                                        setSelectedRoom(room)
                                        setJoinBetAmount(room.betAmount)
                                        setShowJoinDialog(true)
                                      }}
                                    >
                                      Join Room
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-gray-900 border-gray-700">
                                    <DialogHeader>
                                      <DialogTitle>Join Game Room</DialogTitle>
                                      <DialogDescription>
                                        Join {selectedRoom?.players[0].username}'s{" "}
                                        {GAMES.find((g) => g.id === selectedRoom?.gameType)?.name} game
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="bg-gray-800 p-3 rounded">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="text-2xl">{selectedRoom?.players[0].avatar}</span>
                                          <div>
                                            <div className="font-bold">{selectedRoom?.players[0].username}</div>
                                            <div className="text-sm text-gray-400">
                                              {selectedRoom?.players[0].isComputer ? "Computer Player" : "Human Player"}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                          Game: {GAMES.find((g) => g.id === selectedRoom?.gameType)?.name}
                                        </div>
                                      </div>

                                      <div>
                                        <Label htmlFor="joinBet">Your Bet Amount (JUP)</Label>
                                        <Input
                                          id="joinBet"
                                          type="number"
                                          value={joinBetAmount}
                                          onChange={(e) => setJoinBetAmount(Number(e.target.value))}
                                          min="1"
                                          max={gameState.jupiterTokens}
                                          className="bg-gray-800 border-gray-600"
                                        />
                                        <div className="text-xs text-gray-400 mt-1">
                                          Winner gets {joinBetAmount * 2} JUP total
                                        </div>
                                      </div>

                                      <Button
                                        onClick={() => selectedRoom && joinRoom(selectedRoom)}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        disabled={joinBetAmount > gameState.jupiterTokens || joinBetAmount < 1}
                                      >
                                        <Play className="w-4 h-4 mr-2" />
                                        Join & Play ({joinBetAmount} JUP)
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => spectateGame(room)}>
                                  👀 Spectate
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Create New Game */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-bold mb-4">Create New Game Room</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {GAMES.map((game) => (
                        <Card key={game.id} className="bg-gray-800 border-gray-600">
                          <CardHeader>
                            <div
                              className={`w-12 h-12 bg-gradient-to-r ${game.color} rounded-lg flex items-center justify-center mb-3`}
                            >
                              <game.icon className="w-6 h-6" />
                            </div>
                            <CardTitle className="text-lg">{game.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Dialog open={showMultiplayerDialog} onOpenChange={setShowMultiplayerDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  className="w-full bg-purple-600 hover:bg-purple-700"
                                  onClick={() => {
                                    setSelectedGame(game.id)
                                    setShowMultiplayerDialog(true)
                                  }}
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  Create Room
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Gamepad2 className="w-5 h-5" />
                                    Create Game Room
                                  </DialogTitle>
                                  <DialogDescription>Setup a new multiplayer game</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="bet">Bet Amount (JUP)</Label>
                                    <Input
                                      id="bet"
                                      type="number"
                                      value={betAmount}
                                      onChange={(e) => setBetAmount(Number(e.target.value))}
                                      min="1"
                                      max={gameState.jupiterTokens}
                                      className="bg-gray-800 border-gray-600"
                                    />
                                    <div className="text-xs text-gray-400 mt-1">Winner gets {betAmount * 2} JUP</div>
                                  </div>

                                  <div>
                                    <Label htmlFor="friend">Select Opponent</Label>
                                    <Select value={friendWallet} onValueChange={setFriendWallet}>
                                      <SelectTrigger className="bg-gray-800 border-gray-600">
                                        <SelectValue placeholder="Choose your opponent" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="ai_opponent">🤖 AI Opponent</SelectItem>
                                        {DEMO_WALLETS.filter((w) => w.address !== gameState.walletAddress).map(
                                          (wallet) => (
                                            <SelectItem key={wallet.address} value={wallet.address}>
                                              {wallet.avatar} {wallet.username}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                    <div className="text-xs text-gray-400 mt-1">
                                      Computer will play as the selected player
                                    </div>
                                  </div>

                                  <Button
                                    onClick={startMultiplayerGame}
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                    disabled={betAmount > gameState.jupiterTokens}
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Create & Start Game
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="bg-gradient-to-br from-purple-800 to-blue-800 border-purple-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Player Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-6xl mb-4">
                      {DEMO_WALLETS.find((w) => w.address === gameState.walletAddress)?.avatar || "👤"}
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {DEMO_WALLETS.find((w) => w.address === gameState.walletAddress)?.username || "Player"}
                    </h3>
                    <Badge className="mb-4">Level {gameState.level}</Badge>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Experience:</span>
                        <span>{gameState.experience % 100}/100 XP</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${gameState.experience % 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Wallet Details */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Wallet Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-400">Wallet Address</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-gray-800 px-2 py-1 rounded text-sm flex-1 font-mono">
                          {gameState.walletAddress}
                        </code>
                        <Button size="sm" variant="outline" onClick={copyAddress}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-400">Portfolio Balance</Label>
                      <div className="space-y-3 mt-2">
                        {Object.entries(gameState.balances).map(([currency, balance]) => (
                          <div key={currency} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                                {currency.slice(0, 1)}
                              </div>
                              <span className="font-medium">{currency}</span>
                            </div>
                            <span className="text-yellow-400 font-mono">{balance.toFixed(6)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                          Convert Currency
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <ArrowUpDown className="w-5 h-5" />
                            Currency Converter
                          </DialogTitle>
                          <DialogDescription>
                            Convert between different currencies using Jupiter rates
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>From</Label>
                              <Select value={convertFrom} onValueChange={setConvertFrom}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(CURRENCY_RATES).map((currency) => (
                                    <SelectItem key={currency} value={currency}>
                                      {currency}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>To</Label>
                              <Select value={convertTo} onValueChange={setConvertTo}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(CURRENCY_RATES).map((currency) => (
                                    <SelectItem key={currency} value={currency}>
                                      {currency}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>Amount</Label>
                            <Input
                              type="number"
                              value={convertAmount}
                              onChange={(e) => setConvertAmount(Number(e.target.value))}
                              max={gameState.balances[convertFrom]}
                              className="bg-gray-800 border-gray-600"
                            />
                            <div className="text-sm text-gray-400 mt-1">
                              Available: {gameState.balances[convertFrom]?.toFixed(6)} {convertFrom}
                            </div>
                          </div>

                          {convertAmount > 0 && (
                            <div className="p-3 bg-gray-800 rounded">
                              <div className="text-sm">You will receive:</div>
                              <div className="text-lg font-bold text-green-400">
                                {(
                                  (convertAmount * CURRENCY_RATES[convertFrom as keyof typeof CURRENCY_RATES]) /
                                  CURRENCY_RATES[convertTo as keyof typeof CURRENCY_RATES]
                                ).toFixed(6)}{" "}
                                {convertTo}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Rate: 1 {convertFrom} ={" "}
                                {(
                                  CURRENCY_RATES[convertFrom as keyof typeof CURRENCY_RATES] /
                                  CURRENCY_RATES[convertTo as keyof typeof CURRENCY_RATES]
                                ).toFixed(8)}{" "}
                                {convertTo}
                              </div>
                            </div>
                          )}

                          <Button onClick={convertCurrency} className="w-full bg-blue-600 hover:bg-blue-700">
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            Convert Now
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Achievements & Stats */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Achievements & Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-400 mb-2 block">Game Statistics</Label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-800 p-2 rounded text-center">
                          <div className="font-bold text-blue-400">{gameState.gameStats.gamesPlayed}</div>
                          <div className="text-sm text-gray-400">Games Played</div>
                        </div>
                        <div className="bg-gray-800 p-2 rounded text-center">
                          <div className="font-bold text-green-400">{gameState.gameStats.gamesWon}</div>
                          <div className="text-sm text-gray-400">Games Won</div>
                        </div>
                        <div className="bg-gray-800 p-2 rounded text-center">
                          <div className="font-bold text-yellow-400">{gameState.gameStats.winStreak}</div>
                          <div className="text-sm text-gray-400">Win Streak</div>
                        </div>
                        <div className="bg-gray-800 p-2 rounded text-center">
                          <div className="font-bold text-purple-400">{gameState.gameStats.bestWinStreak}</div>
                          <div className="text-sm text-gray-400">Best Streak</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-400 mb-2 block">Achievements</Label>
                      <div className="space-y-2">
                        {ACHIEVEMENTS.map((achievement) => (
                          <div
                            key={achievement.id}
                            className={`flex items-center gap-3 p-2 rounded ${
                              gameState.achievements.includes(achievement.id)
                                ? "bg-gradient-to-r from-yellow-800 to-orange-800 border border-yellow-500"
                                : "bg-gray-800 border border-gray-600"
                            }`}
                          >
                            <span className="text-lg">{achievement.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{achievement.name}</div>
                              <div className="text-xs text-gray-400">{achievement.description}</div>
                            </div>
                            {gameState.achievements.includes(achievement.id) && (
                              <Badge variant="secondary" className="text-xs">
                                ✓
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Jupiter Ecosystem Links */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Jupiter Ecosystem
                  </CardTitle>
                  <CardDescription>Explore the full Jupiter ecosystem and tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a
                      href="https://terminal.jup.ag"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ExternalLink className="w-6 h-6" />
                      </div>
                      <span className="font-medium">Jupiter Terminal</span>
                      <span className="text-xs text-gray-400 text-center mt-1">Swap tokens with best rates</span>
                    </a>
                    <a
                      href="https://unified.jup.ag"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <span className="font-medium">Unified Wallet Kit</span>
                      <span className="text-xs text-gray-400 text-center mt-1">Connect any Solana wallet</span>
                    </a>
                    <a
                      href="https://www.jupiversekit.xyz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Gem className="w-6 h-6" />
                      </div>
                      <span className="font-medium">Jupiverse Kit</span>
                      <span className="text-xs text-gray-400 text-center mt-1">React component library</span>
                    </a>
                    <a
                      href="https://dev.jup.ag"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Settings className="w-6 h-6" />
                      </div>
                      <span className="font-medium">Developer Docs</span>
                      <span className="text-xs text-gray-400 text-center mt-1">Integration guides & APIs</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Stats Tab with Game History */}
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gray-900 border-gray-700 text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-400">{gameState.gameStats.gamesPlayed}</div>
                    <div className="text-sm text-gray-400">Games Played</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-700 text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-400">{gameState.gameStats.gamesWon}</div>
                    <div className="text-sm text-gray-400">Games Won</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-700 text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-400">{gameState.totalEarned}</div>
                    <div className="text-sm text-gray-400">Total JUP Earned</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-700 text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-400">{gameState.level}</div>
                    <div className="text-sm text-gray-400">Current Level</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Analytics */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Win Rate</span>
                          <span>
                            {gameState.gameStats.gamesPlayed > 0
                              ? Math.round((gameState.gameStats.gamesWon / gameState.gameStats.gamesPlayed) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                gameState.gameStats.gamesPlayed > 0
                                  ? (gameState.gameStats.gamesWon / gameState.gameStats.gamesPlayed) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Experience Progress</span>
                          <span>{gameState.experience % 100}/100 XP</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${gameState.experience % 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Current Win Streak</span>
                          <span>{gameState.gameStats.winStreak} games</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((gameState.gameStats.winStreak / 10) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Game History */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Recent Game History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {gameState.gameHistory.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">
                          No games played yet. Start playing to see your history!
                        </p>
                      ) : (
                        gameState.gameHistory.slice(0, 10).map((game) => (
                          <div key={game.id} className="bg-gray-800 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    game.result === "won"
                                      ? "bg-green-500"
                                      : game.result === "lost"
                                        ? "bg-red-500"
                                        : "bg-yellow-500"
                                  }`}
                                />
                                <span className="font-medium">{GAMES.find((g) => g.id === game.gameType)?.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {game.isMultiplayer ? "Multiplayer" : "Solo"}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-400">{game.date.toLocaleDateString()}</div>
                            </div>

                            <div className="flex justify-between items-center mb-2">
                              <div className="text-sm">
                                <span className="text-gray-400">vs </span>
                                <span className="font-medium">{game.opponentName}</span>
                              </div>
                              <div className="text-sm font-mono">
                                {game.playerScore} - {game.opponentScore}
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div
                                className={`text-sm font-bold ${
                                  game.result === "won"
                                    ? "text-green-400"
                                    : game.result === "lost"
                                      ? "text-red-400"
                                      : "text-yellow-400"
                                }`}
                              >
                                {game.result === "won"
                                  ? "🏆 Victory"
                                  : game.result === "lost"
                                    ? "💀 Defeat"
                                    : "🤝 Draw"}
                              </div>
                              <div className="text-sm text-yellow-400">+{game.reward} JUP</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
