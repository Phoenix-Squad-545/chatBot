import { useContext } from 'react'
import { ChatbotThemeContext } from './ChatbotThemeContext'
import type { ChatbotThemeValue } from './ChatbotThemeContext'

export function useChatbotTheme(): ChatbotThemeValue {
  const ctx = useContext(ChatbotThemeContext)
  if (!ctx) {
    throw new Error('useChatbotTheme must be used within ChatbotThemeProvider')
  }
  return ctx
}

export function useChatbotThemeOptional(): ChatbotThemeValue | null {
  return useContext(ChatbotThemeContext)
}