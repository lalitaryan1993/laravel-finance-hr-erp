import { useState, useRef, useEffect } from 'react'
import { Head, router } from '@inertiajs/react'
import axios from 'axios'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Bot, User, Sparkles, TrendingUp, BarChart3, AlertCircle, Plus, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const QUICK_PROMPTS = [
    'What is my revenue this month?',
    'Show outstanding invoices',
    'Analyze my cash flow',
    'Which expenses are highest?',
    'Forecast next 3 months revenue',
    'Any overdue payments?',
]

export default function AIAssistant({ conversations = [] }) {
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: "Hello! I'm your AI Financial Assistant. I have access to your company's financial data and can help you analyze revenue, expenses, cash flow, invoices, and more. What would you like to know?",
    }])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [conversationId, setConversationId] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState(null)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (text) => {
        const msg = text || input.trim()
        if (!msg || loading) return
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: msg }])
        setLoading(true)
        try {
            const { data } = await axios.post('/ai/chat', { message: msg, conversation_id: conversationId })
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
            if (data.conversation_id) setConversationId(data.conversation_id)
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
        } finally {
            setLoading(false)
        }
    }

    const runAnalysis = async () => {
        setAnalyzing(true)
        try {
            const { data } = await axios.post('/ai/analyze')
            setAnalysis(data.analysis)
        } catch {
            setAnalysis('Analysis failed. Please check your OpenAI configuration.')
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <AppLayout>
            <Head title="AI Financial Assistant" />
            <div className="flex gap-6 h-[calc(100vh-8rem)]">
                {/* Sidebar */}
                <div className="w-72 flex flex-col gap-4 flex-shrink-0">
                    <Button variant="outline" className="w-full justify-start" onClick={() => {
                        setMessages([{ role: 'assistant', content: "New conversation started. How can I help?" }])
                        setConversationId(null)
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> New Conversation
                    </Button>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-yellow-500" /> Quick Prompts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-1">
                            {QUICK_PROMPTS.map((p) => (
                                <button key={p} onClick={() => sendMessage(p)}
                                    className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                    {p}
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-500" /> Financial Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <Button variant="outline" size="sm" className="w-full" onClick={runAnalysis} disabled={analyzing}>
                                {analyzing ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <TrendingUp className="w-3 h-3 mr-2" />}
                                Run Health Check
                            </Button>
                            {analysis && (
                                <div className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto leading-relaxed">
                                    {analysis}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {conversations.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Recent Chats</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-1">
                                {conversations.map((c) => (
                                    <button key={c.id}
                                        onClick={() => { setConversationId(c.id); setMessages([]) }}
                                        className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                                            conversationId === c.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground')}>
                                        <div className="truncate font-medium">{c.title}</div>
                                        <div className="text-xs opacity-60">{formatDate(c.updated_at)}</div>
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-border flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="font-semibold">AI Financial Assistant</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                                Connected to your financial data
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                                {m.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className={cn('max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                                    m.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                        : 'bg-muted text-foreground rounded-tl-sm')}>
                                    <div className="whitespace-pre-wrap">{m.content}</div>
                                </div>
                                {m.role === 'user' && (
                                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border">
                        <div className="flex gap-3">
                            <Input
                                placeholder="Ask about your finances... (e.g. What is my profit this month?)"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                disabled={loading}
                                className="flex-1"
                            />
                            <Button onClick={() => sendMessage()} disabled={!input.trim() || loading} size="icon">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            AI responses are based on your actual financial data. Always verify important decisions.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
