import { createContext } from 'react'

export type ChatThemeMode = 'default' | 'dark' | 'custom'

export interface ChatbotThemeValue {
  mode: ChatThemeMode
  primaryColor: string
  setChatTheme: (patch: Partial<{ mode: ChatThemeMode; primaryColor: string }>) => void
}

export const ChatbotThemeContext = createContext<ChatbotThemeValue | null>(null)