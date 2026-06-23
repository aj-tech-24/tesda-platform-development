'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { MessageSquare, X, Send, User, Mail, Sparkles, HelpCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

type Category = 'training_center' | 'assessment_center' | 'general'

interface Message {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: Date
}

const FAQS = [
  {
    id: 'faq_reqs',
    question: '📋 What are the requirements for enrollment?',
    answer: 'To enroll in TESDA programs, you typically need:\n1. Duly accomplished enrollment form\n2. Copy of Birth Certificate (PSA)\n3. High school or college diploma/card\n4. 1x1 or passport size pictures\n\nSome qualifications may have specific prerequisite guidelines. Contact your preferred center for exact program details!',
  },
  {
    id: 'faq_fees',
    question: '💰 Are training courses free?',
    answer: 'Many TESDA programs are fully funded under various government scholarship schemes (like TWSP, STEP, or PESFA). These scholarships cover tuition fees and sometimes include a training allowance. Check with the accredited Training Center for slot availability.',
  },
  {
    id: 'faq_cert',
    question: '🎓 How do I get certified?',
    answer: 'Upon finishing your training program, you can apply for assessment at any accredited Assessment Center. Once you pass the national assessment, you will be issued a National Certificate (NC I, NC II, etc.) or a Certificate of Competency (COC).',
  },
  {
    id: 'faq_duration',
    question: '⏱️ How long do programs take?',
    answer: 'Course duration varies depending on the specific qualification. Standard NC II programs typically range from 80 hours (approx. 2 weeks) to 300+ hours (approx. 1-2 months) of combined theoretical and practical training.',
  },
]

export function InquiryWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '👋 Mabuhay! Welcome to the TESDA Davao del Sur Assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ])

  const [activeMenu, setActiveMenu] = useState<'initial' | 'faqs'>('initial')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState<'chat' | 'form'>('chat')

  // Form states
  const [category, setCategory] = useState<Category>('general')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  // Hide the widget entirely on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

  const addMessage = (sender: 'bot' | 'user', text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender,
        text,
        timestamp: new Date(),
      },
    ])
  }

  const handleShowFaqs = () => {
    addMessage('user', 'Show FAQs')
    setActiveMenu('faqs')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      addMessage('bot', 'Here are some of our Frequently Asked Questions. Select a question below to see its details instantly:')
    }, 800)
  }

  const handleFaqClick = (faq: typeof FAQS[0]) => {
    addMessage('user', faq.question)
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      addMessage('bot', faq.answer)
    }, 1000)
  }

  const handleStartInquiry = () => {
    setCategory('general')
    setMode('form')
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !messageText) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, category, message: messageText }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry')

      toast.success('Inquiry submitted successfully!')
      
      // Reset form and go back to chat
      setMode('chat')
      addMessage('user', `Submitted an inquiry about ${getCategoryLabel(category)}: "${messageText}"`)
      setIsTyping(true)

      setTimeout(() => {
        setIsTyping(false)
        addMessage(
          'bot',
          `Thank you, ${name}! Your inquiry has been sent to our administrator. We will reply to your email address (${email}) as soon as possible.`
        )
        resetFormInputs()
        setActiveMenu('initial')
      }, 1000)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit inquiry')
    } finally {
      setLoading(false)
    }
  }

  const resetFormInputs = () => {
    setName('')
    setEmail('')
    setMessageText('')
  }

  const getCategoryLabel = (cat: Category) => {
    switch (cat) {
      case 'training_center':
        return 'Training Centers'
      case 'assessment_center':
        return 'Assessment Centers'
      case 'general':
        return 'General Questions'
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 rounded-full bg-linear-to-r from-primary to-accent text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group active:scale-95"
        >
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition-transform" />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="w-80 sm:w-96 border border-border/50 shadow-2xl overflow-hidden rounded-2xl animate-scale-in">
          {/* Header */}
          <CardHeader className="bg-linear-to-r from-primary to-accent text-white p-4 flex flex-row items-center justify-between space-y-0 shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold leading-none">TESDA Assistant</CardTitle>
                <span className="text-[10px] text-white/85 font-medium mt-0.5 block">Davao del Sur Portal</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </CardHeader>

          {/* Body */}
          <CardContent className="p-0 bg-slate-50 dark:bg-card">
            {mode === 'chat' ? (
              <div className="flex flex-col h-[400px]">
                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] text-[12px] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-xs ${
                          msg.sender === 'user'
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-white dark:bg-muted border border-border/40 text-foreground rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-muted border border-border/40 text-foreground rounded-2xl rounded-tl-none p-3.5 max-w-[80%] shadow-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Options Panel */}
                <div className="p-4 border-t border-border/40 bg-white/70 dark:bg-card/70 backdrop-blur-xs space-y-3 shrink-0">
                  {activeMenu === 'initial' && !isTyping && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={handleShowFaqs}
                        className="flex items-center justify-center p-3 bg-white dark:bg-muted border border-border/60 rounded-xl hover:border-primary hover:bg-primary/5 text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        Show FAQs
                      </button>
                      <button
                        onClick={handleStartInquiry}
                        className="flex items-center justify-center p-3 bg-linear-to-r from-primary to-accent text-white rounded-xl text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        Send Inquiry
                      </button>
                    </div>
                  )}

                  {activeMenu === 'faqs' && !isTyping && (
                    <div className="space-y-2">
                      <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {FAQS.map((faq) => (
                          <button
                            key={faq.id}
                            onClick={() => handleFaqClick(faq)}
                            className="text-left text-[11px] p-2.5 bg-white dark:bg-muted border border-border/40 rounded-xl hover:border-primary hover:bg-primary/5 transition-all font-semibold cursor-pointer"
                          >
                            {faq.question}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/20">
                        <button
                          onClick={() => setActiveMenu('initial')}
                          className="text-center text-xs text-muted-foreground hover:text-foreground py-1 cursor-pointer font-medium"
                        >
                          Back to Menu
                        </button>
                        <button
                          onClick={handleStartInquiry}
                          className="text-center text-xs text-primary hover:underline py-1 cursor-pointer font-bold"
                        >
                          Send Inquiry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Custom Inquiry Form Mode */
              <div className="p-5 space-y-4 h-[400px] overflow-y-auto">
                <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
                  <button
                    onClick={() => setMode('chat')}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4.5 h-4.5" />
                  </button>
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">
                    Submit Inquiry Form
                  </span>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Inquiry Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full h-11 px-3 rounded-xl border border-input text-xs bg-white dark:bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all cursor-pointer"
                    >
                      <option value="general">General</option>
                      <option value="training_center">Training Centers</option>
                      <option value="assessment_center">Assessment Centers</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground/80" />
                      <Input
                        type="text"
                        placeholder="Your Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-9 h-11 rounded-xl text-xs bg-white dark:bg-card"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground/80" />
                      <Input
                        type="email"
                        placeholder="yourname@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-9 h-11 rounded-xl text-xs bg-white dark:bg-card"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Message
                    </label>
                    <Textarea
                      placeholder="Ask your question or leave a message here..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      required
                      disabled={loading}
                      rows={4}
                      className="rounded-xl p-3 text-xs bg-white dark:bg-card resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-linear-to-r from-primary to-accent text-white font-semibold text-xs gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    {loading ? 'Submitting Inquiry...' : 'Submit Inquiry'}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
