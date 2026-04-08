import { useCallback, useState } from 'react'
import { Box, Toolbar, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar, { type SidebarItem } from './Sidebar'
import Navbar, { type NavbarConfig } from './Navbar'
import ChatButton from '../components/chatbot/ChatButton'
import ChatWindow from '../components/chatbot/ChatWindow'
import { getQuestionById } from '../components/chatbot/FormData'

// Types for chat messages
interface BaseMessage {
  id: string
  role: 'user' | 'assistant'
  timestamp: string
}

interface DefaultMessage extends BaseMessage {
  chatVariant: 'default'
  text: string
}

interface ChoiceMessage extends BaseMessage {
  chatVariant: 'choice'
  questionId: number
  optionsDisabled: boolean
  selectedOptionLabel: string | null
}

type ChatMessage = DefaultMessage | ChoiceMessage

interface LayoutProps {
  sidebarItems: SidebarItem[]
  navbarConfig: NavbarConfig
}

/**
 * App shell: fixed navbar → toolbar spacer → sidebar + main.
 * Chat transcript is append-only: choice flows add user lines + new assistant lines (never replace).
 */
function Layout({ sidebarItems, navbarConfig }: LayoutProps) {
  const theme = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth >= theme.breakpoints.values.md,
  )

  const [chatOpen, setChatOpen] = useState<boolean>(false)

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return [
      {
        id: 'welcome',
        role: 'assistant',
        chatVariant: 'default',
        text: 'Hi — I am your in-app assistant. How can I help today?',
        timestamp: time,
      },
      {
        id: 'help-tree',
        role: 'assistant',
        chatVariant: 'choice',
        questionId: 1,
        optionsDisabled: false,
        selectedOptionLabel: null,
        timestamp: time,
      },
    ]
  })

  const handleDrawerToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  /**
   * Locks the assistant option row, appends the user pick, then appends the next bot turn (or resolution).
   */
  const handleChoiceSelect = useCallback((assistantMessageId: string, { label, nextQuestionId }: { label: string; nextQuestionId: number | null }) => {
    setMessages((prev) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const locked = prev.map((m) =>
        m.id === assistantMessageId && m.chatVariant === 'choice'
          ? { ...m, optionsDisabled: true, selectedOptionLabel: label }
          : m,
      )

      const userMsg: DefaultMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        chatVariant: 'default',
        text: label,
        timestamp: time,
      }

      if (nextQuestionId == null) {
        return [...locked, userMsg]
      }

      const node = getQuestionById(nextQuestionId)
      if (!node) {
        return [...locked, userMsg]
      }

      if (node.options.length === 0 && node.resolution) {
        return [
          ...locked,
          userMsg,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            chatVariant: 'default',
            text: node.resolution,
            timestamp: time,
          } as DefaultMessage,
        ]
      }

      return [
        ...locked,
        userMsg,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          chatVariant: 'choice',
          questionId: nextQuestionId,
          optionsDisabled: false,
          selectedOptionLabel: null,
          timestamp: time,
        } as ChoiceMessage,
      ]
    })
  }, [])

  const handleSend = useCallback((text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: DefaultMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      chatVariant: 'default',
      text,
      timestamp: time,
    }
    setMessages((prev) => [...prev, userMsg])
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          chatVariant: 'default',
          text: `You said: "${text}". (Connect this panel to your backend when ready.)`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        } as DefaultMessage,
      ])
    }, 400)
  }, [])

  return (
    <Box className="flex min-h-screen w-full max-w-full flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar
        config={navbarConfig}
        onMenuClick={handleDrawerToggle}
        sidebarOpen={sidebarOpen}
      />

      <Toolbar />

      <Box className="flex min-h-0 min-w-0 flex-1 w-full">
        <Sidebar
          items={sidebarItems}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={() => setSidebarOpen(false)}
        />

        <Box
          component="main"
          className="flex-1 min-h-0 min-w-0 overflow-auto px-4 py-4 sm:px-6 sm:py-6"
          id="main-content"
        >
          <Outlet />
        </Box>
      </Box>

      <ChatButton onClick={() => setChatOpen(true)} />
      <ChatWindow
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Chatbot"
        messages={messages}
        onSend={handleSend}
        onChoiceSelect={handleChoiceSelect}
      />
    </Box>
  )
}

export default Layout