import { useCallback, useMemo, useState } from 'react'
import { ChatbotThemeContext, type ChatbotThemeValue, type ChatThemeMode } from './ChatbotThemeContext'
import { CHAT_DEFAULT_PRIMARY } from './ChatThemePresets'

/**
 * Chat panel theme: `mode` (default / dark / custom) + `primaryColor` for accents in custom mode.
 * Persists for the session; consumed by ChatWindow chrome and ChatMessage bubbles/options.
 */
export function ChatbotThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ChatThemeMode>('default')
  const [primaryColor, setPrimaryColor] = useState<string>(CHAT_DEFAULT_PRIMARY)

  const setChatTheme = useCallback((patch: Partial<Pick<ChatbotThemeValue, 'mode' | 'primaryColor'>>) => {
    if (patch.mode != null) setMode(patch.mode)
    if (patch.primaryColor != null) setPrimaryColor(patch.primaryColor)
  }, [])

  const value = useMemo<ChatbotThemeValue>(
    () => ({
      mode,
      primaryColor,
      setChatTheme,
    }),
    [mode, primaryColor, setChatTheme],
  )

  return (
    <ChatbotThemeContext.Provider value={value}>
      {children}
    </ChatbotThemeContext.Provider>
  )
}