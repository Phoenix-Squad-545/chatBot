// Update src/components/chatbot/ChatWindow.tsx

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Divider,
  Fade,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Popover,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import CheckIcon from '@mui/icons-material/Check'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { alpha } from '@mui/material/styles'
import ChatMessage, { ChatMessageType } from './ChatMessage'
import { ChatbotThemeProvider } from './ChatbotThemeProvider'
import { useChatbotTheme, useChatbotThemeOptional } from './UseChatBotTheme'
import { CHAT_CUSTOM_PALETTE, CHAT_DEFAULT_PRIMARY } from './ChatThemePresets'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import ChatFlowManager, { BookingData } from './ChatFlowManager'

// Define extended message types (not extending ChatMessageType directly)
// Instead, we'll use composition or define them separately
interface ExtendedDynamicChoiceMessage extends Omit<DynamicChoiceMessageType, 'chatVariant'> {
  chatVariant: 'dynamic_choice'
}

interface ExtendedDynamicFormMessage extends Omit<DynamicFormMessageType, 'chatVariant'> {
  chatVariant: 'dynamic_form'
}

interface ExtendedDynamicConfirmationMessage extends Omit<DynamicConfirmationMessageType, 'chatVariant'> {
  chatVariant: 'dynamic_confirmation'
}

type ExtendedMessageType = ChatMessageType | ExtendedDynamicChoiceMessage | ExtendedDynamicFormMessage | ExtendedDynamicConfirmationMessage

interface ChatWindowProps {
  open: boolean
  onClose: () => void
  title?: string
  messages: ExtendedMessageType[]
  onSend?: (text: string) => void
  onChoiceSelect?: (messageId: string, choice: { label: string; nextQuestionId: number | null }) => void
  placeholder?: string
  isTyping?: boolean
  onDynamicChoice?: (stepId: string, choice: any, nextStep?: string) => void
  flowManager?: ChatFlowManager
}

// Remove the interface extensions that were causing the error
// We'll use type aliases instead
type DynamicChoiceMessageType = {
  id: string
  role: 'assistant'
  timestamp: string
  chatVariant: 'dynamic_choice'
  question: string
  options: Array<{ label: string; value: any; nextStep?: string }>
  stepId: string
  field?: string
}

type DynamicFormMessageType = {
  id: string
  role: 'assistant'
  timestamp: string
  chatVariant: 'dynamic_form'
  question: string
  field: string
  stepId: string
  validation?: (value: string) => boolean
}

type DynamicConfirmationMessageType = {
  id: string
  role: 'assistant'
  timestamp: string
  chatVariant: 'dynamic_confirmation'
  question: string
  stepId: string
}

 interface ColorOption {
  id: string
  label: string
  hex: string
}

/**
 * Theme popover: mode (default / dark / custom) + optional accent palette for custom.
 */
function ChatThemeControls() {
  const { mode, primaryColor, setChatTheme } = useChatbotTheme()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const handleClose = () => setAnchorEl(null)

  return (
    <>
      <Tooltip title="Theme">
       <IconButton
  size="small"
  aria-label="Open chat theme settings"
  aria-haspopup="true"
  aria-expanded={open}
  onClick={(e) => setAnchorEl(e.currentTarget)}
  sx={{
    color: '#fff',
    '&:hover': {
      color: '#fff',
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
  }}
>
  <PaletteOutlinedIcon sx={{ fontSize: 20 }} />
</IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            className: 'mt-1 w-[min(100vw-2rem,280px)] p-2 rounded-xl shadow-lg',
          },
        }}
      >
        <Typography variant="caption" className="px-2 py-1 text-slate-500 block">
          Appearance
        </Typography>
        <MenuItem
          dense
          selected={mode === 'default'}
          onClick={() => {
            setChatTheme({ mode: 'default', primaryColor: CHAT_DEFAULT_PRIMARY })
            handleClose()
          }}
        >
          <ListItemIcon>
            <LightModeOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2' }}>
            Default theme
          </ListItemText>
          {mode === 'default' ? <CheckIcon fontSize="small" className="text-indigo-600" /> : null}
        </MenuItem>
        <MenuItem
          dense
          selected={mode === 'dark'}
          onClick={() => {
            setChatTheme({ mode: 'dark' })
            handleClose()
          }}
        >
          <ListItemIcon>
            <DarkModeOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2' }}>Dark theme</ListItemText>
          {mode === 'dark' ? <CheckIcon fontSize="small" className="text-indigo-600" /> : null}
        </MenuItem>
        <MenuItem
          dense
          selected={mode === 'custom'}
          onClick={() => {
            setChatTheme({ mode: 'custom', primaryColor: primaryColor || CHAT_DEFAULT_PRIMARY })
            /* Keep popover open so user can pick a color */
          }}
        >
          <ListItemIcon>
            <PaletteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'body2' }}>Custom theme</ListItemText>
          {mode === 'custom' ? <CheckIcon fontSize="small" className="text-indigo-600" /> : null}
        </MenuItem>

        {mode === 'custom' && (
          <Box className="px-2 pt-2 pb-1 border-t border-slate-200/80 mt-1">
            <Typography variant="caption" className="text-slate-500 mb-2 block">
              Select your theme color
            </Typography>
            <Box className="flex flex-wrap gap-2">
              {CHAT_CUSTOM_PALETTE.map((c: ColorOption) => {
                const active = primaryColor.toLowerCase() === c.hex.toLowerCase()
                return (
                  <Tooltip title={c.label} key={c.id}>
                    <button
                      type="button"
                      aria-label={c.label}
                      aria-pressed={active}
                      onClick={() => setChatTheme({ primaryColor: c.hex })}
                      className={[
                        'relative h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        active ? 'border-slate-900 ring-2 ring-offset-1 ring-slate-400' : 'border-white shadow-md',
                      ].join(' ')}
                      style={{ backgroundColor: c.hex }}
                    >
                      {active ? (
                        <CheckIcon
                          className="absolute inset-0 m-auto text-white drop-shadow-md"
                          sx={{ fontSize: 18 }}
                        />
                      ) : null}
                    </button>
                  </Tooltip>
                )
              })}
            </Box>
          </Box>
        )}
      </Popover>
    </>
  ) 
}

  function ChatWindowContent({
  open,
  onClose,
  title = 'Assistant',
  messages,
  onSend,
  onChoiceSelect,
  placeholder = 'Type a message…',
  isTyping,
  onDynamicChoice,
  flowManager
}: ChatWindowProps) {
  const { mode, primaryColor } = useChatbotTheme()
  const [draft, setDraft] = useState<string>('')
  // Change from single formValue to an object keyed by message id
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const endRef = useRef<HTMLDivElement>(null)
  const [confirmClose, setConfirmClose] = useState(false)
  console.log(messages, "messages>>>>");

  const handleDynamicChoice = async (stepId: string, choice: any, nextStep?: string) => {
    // Just pass the selection up to Layout - don't add messages here
    onDynamicChoice?.(stepId, choice, nextStep)
  }

    const handleDynamicFormSubmit = async (messageId: string, stepId: string, field: string, value: string, validation?: (val: string) => boolean) => {
    if (validation && !validation(value)) {
      setFormErrors(prev => ({ ...prev, [messageId]: 'Invalid input. Please try again.' }))
      return
    }
    
    setFormErrors(prev => ({ ...prev, [messageId]: '' }))
    setFormValues(prev => ({ ...prev, [messageId]: '' }))
    // Pass form submission up to Layout
    onDynamicChoice?.(stepId, { label: value, value }, 'form_submit')
  }

  const handleFormValueChange = (messageId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [messageId]: value }))
    // Clear error when user starts typing
    if (formErrors[messageId]) {
      setFormErrors(prev => ({ ...prev, [messageId]: '' }))
    }
  }

  const headerSx = useMemo(() => {
    if (mode === 'dark') {
      return { bgcolor: '#1e293b', color: '#f8fafc' }
    }
    if (mode === 'custom') {
      return { bgcolor: primaryColor, color: '#fff' }
    }
    return { bgcolor: '#4f46e5', color: '#fff' }
  }, [mode, primaryColor])

  const paperSx = useMemo(() => {
    // Use a px string — numeric values are multiplied by theme.shape.borderRadius (see MUI `sx` docs).
    const base = {
      position: 'fixed' as const,
      zIndex: 1200,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      borderRadius: '16px',
      bottom: 96,
      right: 20,
      width: 'min(100vw - 2rem, 400px)',
      maxHeight: 'min(70vh, 560px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      animation: 'fadeIn 0.2s ease',
    }
    if (!open) {
      return {
        ...base,
        opacity: 0,
        pointerEvents: 'none' as const,
        transform: 'translateY(32px) scale(0.95)',
      }
    }
    if (mode === 'dark') {
      return {
        ...base,
        opacity: 1,
        pointerEvents: 'auto' as const,
        transform: 'translateY(0) scale(1)',
        border: '1px solid',
        borderColor: '#475569',
        bgcolor: '#0f172a',
        color: '#f1f5f9',
      }
    }
    if (mode === 'custom') {
      return {
        ...base,
        opacity: 1,
        pointerEvents: 'auto' as const,
        transform: 'translateY(0) scale(1)',
        border: '1px solid',
        borderColor: alpha(primaryColor, 0.45),
        bgcolor: '#fafafa',
        color: '#0f172a',
      }
    }
    return {
      ...base,
      opacity: 1,
      pointerEvents: 'auto' as const,
      transform: 'translateY(0) scale(1)',
      border: '1px solid',
      borderColor: 'rgba(226,232,240,0.9)',
      bgcolor: '#fff',
    }
  }, [mode, primaryColor, open])

  const transcriptBg =
    mode === 'dark' ? 'bg-slate-950/50' : mode === 'custom' ? 'bg-white' : 'bg-white dark:bg-slate-900'

  const footerClass =
    mode === 'dark'
      ? 'bg-slate-950/50'
      : mode === 'custom'
        ? 'bg-slate-50/90'
        : 'bg-slate-50/80 dark:bg-slate-950/40'

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, messages])

 const renderDynamicMessage = (message: any) => {
    const { bubbleSx, timeClass } = useBubbleStyles(false)
    
    switch(message.chatVariant) {
      case 'dynamic_choice':
        return (
          <Fade in timeout={280}>
            <Box className="flex w-full mb-4 last:mb-2 flex-col items-start">
              <Box className="flex w-full items-start">
                <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: "#e2e8f0", color: "#334155" }}>
                  <SmartToyOutlinedIcon fontSize="small" />
                </Avatar>
                <Box className="flex flex-col items-start max-w-[85%]">
                  <Box className="rounded-2xl rounded-bl-md px-3 py-3 shadow-sm" sx={bubbleSx}>
                    <Typography variant="body2" className="mb-3 font-medium">
                      {message.question}
                    </Typography>
                    <Box className="flex flex-col gap-2">
                      {message.options.map((opt: any) => (
                        <Button
                          key={`${message.id}-${opt.label}`}
                          variant="outlined"
                          size="small"
                          onClick={() => onDynamicChoice?.(message.stepId, opt, opt.nextStep)}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                  {message.timestamp && (
                    <Typography
                      variant="caption"
                      className={`mt-2 text-slate-600 dark:text-slate-400 ${timeClass}`}
                      sx={{ fontSize: "11px", fontWeight: 500 }}
                    >
                      {message.timestamp}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Fade>
        )
      
      case 'dynamic_form':
        const currentValue = formValues[message.id] || ''
        const currentError = formErrors[message.id] || ''
        
        return (
          <Fade in timeout={280}>
            <Box className="flex w-full mb-4 last:mb-2 flex-col items-start">
              <Box className="flex w-full items-start">
                <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: "#e2e8f0", color: "#334155" }}>
                  <SmartToyOutlinedIcon fontSize="small" />
                </Avatar>
                <Box className="flex flex-col items-start max-w-[85%]">
                  <Box className="rounded-2xl rounded-bl-md px-3 py-3 shadow-sm" sx={bubbleSx}>
                    <Typography variant="body2" className="mb-2">
                      {message.question}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={currentValue}
                      onChange={(e) => handleFormValueChange(message.id, e.target.value)}
                      error={!!currentError}
                      // helperText={currentError || 'Format: YYYY-MM-DD HH:MM'}
                      placeholder="Enter your name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleDynamicFormSubmit(message.id, message.stepId, message.field, currentValue, message.validation)
                        }
                      }}
                      sx={{ mb: 1 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleDynamicFormSubmit(message.id, message.stepId, message.field, currentValue, message.validation)}
                    >
                      Submit
                    </Button>
                  </Box>
                  {message.timestamp && (
                    <Typography
                      variant="caption"
                      className={`mt-2 text-slate-600 dark:text-slate-400 ${timeClass}`}
                      sx={{ fontSize: "11px", fontWeight: 500 }}
                    >
                      {message.timestamp}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Fade>
        )
      
      case 'dynamic_confirmation':
        return (
          <Fade in timeout={280}>
            <Box className="flex w-full mb-4 last:mb-2 flex-col items-start">
              <Box className="flex w-full items-start">
                <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: "#e2e8f0", color: "#334155" }}>
                  <SmartToyOutlinedIcon fontSize="small" />
                </Avatar>
                <Box className="flex flex-col items-start max-w-[85%]">
                  <Box className="rounded-2xl rounded-bl-md px-3 py-3 shadow-sm" sx={bubbleSx}>
                    <Typography variant="body2">
                      {message.question}
                    </Typography>
                  </Box>
                  {message.timestamp && (
                    <Typography
                      variant="caption"
                      className={`mt-2 text-slate-600 dark:text-slate-400 ${timeClass}`}
                      sx={{ fontSize: "11px", fontWeight: 500 }}
                    >
                      {message.timestamp}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Fade>
        )
      
      default:
        return null
    }
  }

  const handleSendMessage = () => {
    if (draft.trim() && onSend) {
      onSend(draft)
      setDraft('')
    }
  }

  return (
    <Paper elevation={8} className="!rounded-2xl" sx={paperSx} role="dialog" aria-modal="true" aria-hidden={!open}>
      <Box className="flex items-center justify-between gap-2 px-2 py-2 sm:px-3" sx={headerSx}>
       {/* LEFT SIDE — Avatar + Title */}
        <Box className="flex items-center gap-2 min-w-0">
          <div className="mt-0.5 rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
            <SmartToyIcon />
          </div>
          <Box className="flex flex-col leading-tight min-w-0">
            <Typography variant="subtitle2" className="font-semibold truncate">
              AR HyperAutomation
            </Typography>
            <Typography variant="caption" className="text-white/80 truncate">
              Online • Ready to help
            </Typography>
          </Box>
        </Box>
        
  {/* RIGHT SIDE — Buttons */}
        <Box className="flex items-center gap-0.5 shrink-0">
          <ChatThemeControls />
          <IconButton
            size="small"
            aria-label="Close chat"
            onClick={() => setConfirmClose(true)}
            sx={{ color: '#fff', '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Divider className={mode === 'dark' ? 'border-slate-700' : ''} />

      <Box className={['chat-scroll flex-1 overflow-y-auto px-3 py-3 min-h-[200px] max-h-[360px] scroll-smooth', transcriptBg].join(' ')}>
        {messages?.length ? (
          messages.map((m) => {
            // Handle dynamic messages
            if (m.chatVariant?.toString().startsWith('dynamic')) {
              return (
                <Box key={m.id}>
                  {renderDynamicMessage(m)}
                </Box>
              )
            }
            
            // Handle regular messages (user and assistant default messages)
            return (
              <ChatMessage
                key={m.id}
                message={m}
                onChoiceSelect={onChoiceSelect}
                onDynamicChoice={onDynamicChoice}
              />
            )
          })
        ) : (
          <Typography variant="body2" color="text.secondary" className="text-center py-6">
            Ask anything to get started.
          </Typography>
        )}
        {isTyping && <TypingIndicator />}
        <div ref={endRef} />
      </Box>

      <Box className="p-2 border-t" sx={{ borderColor: mode === 'dark' ? '#475569' : '#e2e8f0' }}>
        <Box className="flex gap-2">
          <TextField
            fullWidth
            size="small"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            disabled={!draft.trim()}
            sx={{ bgcolor: alpha(primaryColor, 0.1), '&:hover': { bgcolor: alpha(primaryColor, 0.2) } }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {confirmClose && (
        <Box className="absolute inset-0 flex items-center justify-center" sx={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', zIndex: 10 }}>
          <Box className="bg-white dark:bg-slate-900 rounded-xl shadow-lg" sx={{ p: 2.5, width: '85%', maxWidth: 300 }}>
            <Typography variant="subtitle2" className="font-semibold text-center" sx={{ mb: 1 }}>
              End Chat Session?
            </Typography>
            <Typography variant="body2" color="text.secondary" className="text-center" sx={{ mb: 2 }}>
              Are you sure you want to end this session?
            </Typography>
            <Box className="flex justify-center" sx={{ gap: 1 }}>
              <Button variant="outlined" size="small" sx={{ px: 1.5, py: 0.5, minWidth: 70, textTransform: 'none', fontSize: '0.75rem' }} onClick={() => setConfirmClose(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="error" size="small" sx={{ px: 1.5, py: 0.5, minWidth: 70, textTransform: 'none', fontSize: '0.75rem' }} onClick={() => { setConfirmClose(false); onClose(); }}>
                End
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  )
}

function useBubbleStyles(isUser: boolean) {
  const ctx = useChatbotThemeOptional()
  const mode = ctx?.mode ?? 'default'
  const primary = ctx?.primaryColor ?? CHAT_DEFAULT_PRIMARY

  return useMemo(() => {
    if (isUser) {
      if (mode === 'dark') {
        return {
          bubbleSx: { bgcolor: '#6366f1', color: '#fff' },
          timeClass: 'text-indigo-100',
        }
      }
      if (mode === 'custom') {
        return {
          bubbleSx: { bgcolor: primary, color: '#fff' },
          timeClass: 'text-white/80',
        }
      }
      return {
        bubbleSx: { bgcolor: '#4f46e5', color: '#fff' },
        timeClass: 'text-indigo-100',
      }
    }

    if (mode === 'dark') {
      return {
        bubbleSx: {
          bgcolor: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid',
          borderColor: 'rgba(148,163,184,0.35)',
        },
        timeClass: 'text-slate-400',
      }
    }
    if (mode === 'custom') {
      return {
        bubbleSx: {
          bgcolor: alpha(primary, 0.12),
          color: '#0f172a',
          border: '1px solid',
          borderColor: alpha(primary, 0.35),
        },
        timeClass: 'text-slate-600',
      }
    }
    return {
      bubbleSx: { bgcolor: '#f1f5f9', color: '#0f172a' },
      timeClass: 'text-slate-500',
    }
  }, [isUser, mode, primary])
}

function TypingIndicator() {
  return (
    <Box className="flex items-start mb-3">
      <Box className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-3 py-2 rounded-2xl rounded-bl-md">

        {/* Animated dots */}
        <Box className="flex gap-1">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </Box>
      </Box>
    </Box>
  )
}

function ChatWindow(props: ChatWindowProps) {
  return (
    <ChatbotThemeProvider>
      <ChatWindowContent 
        {...props} 
      />
    </ChatbotThemeProvider>
  )
}

export default ChatWindow