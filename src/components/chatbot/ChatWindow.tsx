import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Divider,
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
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import CheckIcon from '@mui/icons-material/Check'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import { alpha } from '@mui/material/styles'
import ChatMessage, { ChatMessageType } from './ChatMessage'
import { ChatbotThemeProvider } from './ChatbotThemeProvider'
import { useChatbotTheme } from './UseChatBotTheme'
import { CHAT_CUSTOM_PALETTE, CHAT_DEFAULT_PRIMARY } from './ChatThemePresets'
import SmartToyIcon from '@mui/icons-material/SmartToy'

interface ChatWindowProps {
  open: boolean
  onClose: () => void
  title?: string
  messages: ChatMessageType[]
  onSend?: (text: string) => void
  onChoiceSelect?: (messageId: string, choice: { label: string; nextQuestionId: number | null }) => void
  placeholder?: string
  isTyping?: boolean  
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
  isTyping
}: ChatWindowProps) {
  const { mode, primaryColor } = useChatbotTheme()
  const [draft, setDraft] = useState<string>('')
  const endRef = useRef<HTMLDivElement>(null)
const [confirmClose, setConfirmClose] = useState(false)

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

  const handleSend = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onSend?.(trimmed)
    setDraft('')
  }

  const sendIconSx =
    mode === 'custom'
      ? { color: primaryColor }
      : mode === 'dark'
        ? { color: '#a5b4fc' }
        : {}

  return (
    <Paper
      elevation={8}
      className="!rounded-2xl"
      sx={paperSx}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
    <Box
  className="flex items-center justify-between gap-2 px-2 py-2 sm:px-3"
  sx={headerSx}
>
  {/* LEFT SIDE — Avatar + Title */}
  <Box className="flex items-center gap-2 min-w-0">
     <div className="mt-0.5 rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
          <SmartToyIcon />
        </div>
    <Box className="flex flex-col leading-tight min-w-0">
      <Typography
        variant="subtitle2"
        className="font-semibold truncate"
      >
        Expense Assistant
      </Typography>

      <Typography
        variant="caption"
        className="text-white/80 truncate"
      >
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
  sx={{
    color: '#fff',
    '&:hover': {
      color: '#fff',
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
  }}
>
  <CloseIcon fontSize="small" />
</IconButton>
  </Box>
</Box>

      <Divider className={mode === 'dark' ? 'border-slate-700' : ''} />

     <Box
  className={[
    'chat-scroll flex-1 overflow-y-auto px-3 py-3 min-h-[200px] max-h-[360px] scroll-smooth',
    transcriptBg,
  ].join(' ')}
>
        {messages?.length ? (
          messages.map((m) => (
            <ChatMessage key={m.id} message={m} onChoiceSelect={onChoiceSelect} />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" className="text-center py-6">
            Ask anything to get started.
          </Typography>
        )}
 {isTyping && (
  <TypingIndicator />
)}

<div ref={endRef} />
      </Box>

      <Divider className={mode === 'dark' ? 'border-slate-700' : ''} />

      <Box className={`flex items-end gap-2 p-3 ${footerClass}`}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          sx={
            mode === 'dark'
              ? {
                  bgcolor: '#0f172a',
                  '& .MuiOutlinedInput-root': { color: '#f1f5f9' },
                }
              : {}
          }
          className={mode === 'custom' ? 'bg-white' : mode === 'dark' ? '' : 'bg-white dark:bg-slate-900'}
        />
        <IconButton
          aria-label="Send message"
          onClick={handleSend}
          className="shrink-0"
          sx={sendIconSx}
          color={mode === 'custom' ? 'default' : 'primary'}
          disabled={!draft.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
   {confirmClose && (
  <Box
    className="absolute inset-0 flex items-center justify-center"
    sx={{
      backgroundColor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(2px)',
      zIndex: 10,
    }}
  >
    <Box
      className="bg-white dark:bg-slate-900 rounded-xl shadow-lg"
      sx={{
        p: 2.5,            //  reduced padding
        width: '85%',
        maxWidth: 300,
      }}
    >
      <Typography
        variant="subtitle2"     //  smaller title
        className="font-semibold text-center"
        sx={{ mb: 1 }}
      >
        End Chat Session?
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        className="text-center"
        sx={{ mb: 2 }}      //  smaller spacing
      >
        Are you sure you want to end this session?
      </Typography>

      <Box
        className="flex justify-center"
        sx={{ gap: 1 }}     //  smaller gap
      >
        <Button
          variant="outlined"
          size="small"      //  smaller button
          sx={{
            px: 1.5,        //  reduce width
            py: 0.5,        //  reduce height
            minWidth: 70,
            textTransform: 'none',
            fontSize: '0.75rem',
          }}
          onClick={() => setConfirmClose(false)}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          size="small"
          sx={{
            px: 1.5,
            py: 0.5,
            minWidth: 70,
            textTransform: 'none',
            fontSize: '0.75rem',
          }}
          onClick={() => {
            setConfirmClose(false)
            onClose()
          }}
        >
          End
        </Button>
      </Box>
    </Box>
  </Box>
)}
    </Paper>
  )
}

/**
 * Slide-up chat panel with scoped theme context (mode + custom accent).
 */
function ChatWindow(props: ChatWindowProps) {
  return (
    <ChatbotThemeProvider>
      <ChatWindowContent {...props} />
    </ChatbotThemeProvider>
  )
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

export default ChatWindow