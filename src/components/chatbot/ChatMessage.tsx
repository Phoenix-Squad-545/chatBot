import { memo, useMemo } from 'react'
import { alpha } from '@mui/material/styles'
import { Box, Button, Fade, Typography } from '@mui/material'
import { getQuestionById } from './FormData'
import { useChatbotThemeOptional } from './UseChatBotTheme'
import { CHAT_DEFAULT_PRIMARY } from './ChatThemePresets'
import { Avatar } from "@mui/material"
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined"
import PersonOutlineIcon from "@mui/icons-material/PersonOutline"

// Types
interface BaseMessage {
  id: string
  role: 'user' | 'assistant'
  timestamp: string
}

export interface DefaultMessage extends BaseMessage {
  chatVariant: 'default'
  text: string
}

export interface ChoiceMessage extends BaseMessage {
  chatVariant: 'choice'
  questionId: number
  optionsDisabled: boolean
  selectedOptionLabel: string | null
}

export type ChatMessageType = DefaultMessage | ChoiceMessage

interface BubbleStyles {
  bubbleSx: Record<string, any>
  timeClass: string
}

interface DefaultMessageBodyProps {
  text: string
  timestamp?: string
}

interface AssistantTextBodyProps {
  text: string
  timestamp?: string
}

interface ChoiceMessageBodyProps {
  messageId: string
  questionId: number
  optionsDisabled: boolean
  selectedOptionLabel: string | null
  timestamp?: string
  onChoiceSelect?: (messageId: string, choice: { label: string; nextQuestionId: number | null }) => void
}

interface ChatMessageProps {
  message: ChatMessageType
  onChoiceSelect?: (messageId: string, choice: { label: string; nextQuestionId: number | null }) => void
}

interface Option {
  label: string
  nextQuestionId: number | null
}

interface QuestionNode {
  id: number
  question?: string
  options: Option[]
  resolution?: string
}

/**
 * Bubble colors from chat theme context (default / dark / custom + primary hex).
 */
function useBubbleStyles(isUser: boolean): BubbleStyles {
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

function DefaultMessageBody({ text, timestamp }: DefaultMessageBodyProps) {
  const { bubbleSx, timeClass } = useBubbleStyles(true)

  return (
    <Box className="flex flex-col items-end max-w-[85%]">
      {/* Chat Bubble */}
      <Box
        className="rounded-2xl rounded-br-md px-3 py-2 shadow-sm transition-all duration-300 ease-out"
        sx={bubbleSx}
      >
        <Typography variant="body2" className="whitespace-pre-wrap break-words">
          {text}
        </Typography>
      </Box>

      {/* Timestamp BELOW bubble */}
      {timestamp && (
      <Typography
  variant="caption"
  className={`mt-2 text-right text-slate-600 dark:text-slate-400 ${timeClass}`}
  sx={{
    fontSize: "11px",
    fontWeight: 500,
  }}
>
  {timestamp}
</Typography>
      )}
    </Box>
  )
}

function AssistantTextBody({ text, timestamp }: AssistantTextBodyProps) {
  const { bubbleSx, timeClass } = useBubbleStyles(false)

  return (
    <Box className="flex flex-col items-start max-w-[85%]">
      {/* Chat Bubble */}
      <Box
        className="rounded-2xl rounded-bl-md px-3 py-2 shadow-sm transition-all duration-300 ease-out"
        sx={bubbleSx}
      >
        <Typography variant="body2" className="whitespace-pre-wrap break-words">
          {text}
        </Typography>
      </Box>

      {/* Timestamp BELOW bubble */}
      {timestamp && (
         <Typography
  variant="caption"
  className={`mt-2 text-right text-slate-600 dark:text-slate-400 ${timeClass}`}
  sx={{
    fontSize: "11px",
    fontWeight: 500,
  }}
>
          {timestamp}
        </Typography>
      )}
    </Box>
  )
}

/**
 * Assistant turn with options: parent appends history; here we only render + fire `onChoiceSelect`.
 * After selection, parent sets optionsDisabled and selectedOptionLabel on this message id.
 */
function ChoiceMessageBody({
  messageId,
  questionId,
  optionsDisabled,
  selectedOptionLabel,
  timestamp,
  onChoiceSelect,
}: ChoiceMessageBodyProps) {
  const { bubbleSx, timeClass } = useBubbleStyles(false)
  const ctx = useChatbotThemeOptional()
  const mode = ctx?.mode ?? 'default'
  const primary = ctx?.primaryColor ?? CHAT_DEFAULT_PRIMARY

  const node = useMemo(() => getQuestionById(questionId) as QuestionNode | undefined, [questionId])

  const accentSx = useMemo(() => {
    if (mode === 'custom') {
      return {
        borderColor: alpha(primary, 0.55),
        color: primary,
        '&:hover': { bgcolor: alpha(primary, 0.08) },
      }
    }
    return {
      borderColor: 'rgba(148,163,184,0.55)',
      '&:hover': { bgcolor: 'action.hover' },
    }
  }, [mode, primary])

  const selectedSx = useMemo(() => {
    if (mode === 'custom') {
      return {
        bgcolor: `${primary} !important`,
        color: '#fff !important',
        borderColor: `${primary} !important`,
        '&:hover': { bgcolor: `${primary} !important` },
      }
    }
    return {
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      borderColor: 'primary.main',
    }
  }, [mode, primary])

  if (!node) {
    return (
      <Box className="max-w-[95%] rounded-2xl px-3 py-2 text-sm shadow-sm bg-amber-50 text-amber-900">
        This conversation flow is unavailable (missing question id).
      </Box>
    )
  }

  const showResolution = node.options.length === 0 && node.resolution

  return (
    <Box className="flex flex-col items-start max-w-[95%]">
    <Box
      className="rounded-2xl rounded-bl-md px-3 py-3 shadow-sm transition-all duration-300 ease-out"
      sx={bubbleSx}
    >
      {showResolution ? (
        <Typography variant="body2" className="whitespace-pre-wrap break-words">
          {node.resolution}
        </Typography>
      ) : (
        <>
          {node.question ? (
            <Typography variant="body2" className="mb-3 font-medium whitespace-pre-wrap break-words">
              {node.question}
            </Typography>
          ) : null}

          <Box className="flex flex-col gap-2">
            {node.options.map((opt: Option) => {
              const isSelected = selectedOptionLabel === opt.label
              const locked = optionsDisabled
              return (
                <Button
                  key={`${node.id}-${opt.label}`}
                  variant={isSelected ? 'contained' : 'outlined'}
                  size="small"
                  disabled={locked}
                  onClick={() =>
                    onChoiceSelect?.(messageId, {
                      label: opt.label,
                      nextQuestionId: opt.nextQuestionId,
                    })
                  }
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    textTransform: 'none',
                    borderRadius: 3,
                    ...(isSelected ? selectedSx : accentSx),
                  }}
                >
                  {opt.label}
                </Button>
              )
            })}
          </Box>
        </>
      )}
 </Box>
      {timestamp && (
          <Typography
  variant="caption"
  className={`mt-2 text-right text-slate-600 dark:text-slate-400 ${timeClass}`}
  sx={{
    fontSize: "11px",
    fontWeight: 500,
  }}>
          {timestamp}
        </Typography>
      )}
    </Box>
  )
}

/**
 * Single transcript row. `message` matches Layout chat history items.
 */
function ChatMessage({ message, onChoiceSelect }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const chatVariant = message.chatVariant ?? 'default'

  const inner = isUser ? (
    <DefaultMessageBody text={(message as DefaultMessage).text} timestamp={message.timestamp} />
  ) : chatVariant === 'choice' ? (
    <ChoiceMessageBody
      messageId={message.id}
      questionId={(message as ChoiceMessage).questionId ?? 1}
      optionsDisabled={Boolean((message as ChoiceMessage).optionsDisabled)}
      selectedOptionLabel={(message as ChoiceMessage).selectedOptionLabel ?? null}
      timestamp={message.timestamp}
      onChoiceSelect={onChoiceSelect}
    />
  ) : (
    <AssistantTextBody text={(message as DefaultMessage).text} timestamp={message.timestamp} />
  )

  return (
  <Fade in timeout={280}>
    <Box
  className={`flex w-full mb-4 last:mb-2 items-start ${
    isUser ? 'justify-end' : 'justify-start'
  }`}
>
      {/* BOT ICON (LEFT SIDE) */}
      {!isUser && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            mr: 1,
            bgcolor: "#e2e8f0",
            color: "#334155",
          }}
        >
          <SmartToyOutlinedIcon fontSize="small" />
        </Avatar>
      )}

      {/* MESSAGE BODY */}
      {inner}

      {/* USER ICON (RIGHT SIDE) */}
      {isUser && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            ml: 1,
            bgcolor: "#4f46e5",
            color: "#fff",
          }}
        >
          <PersonOutlineIcon fontSize="small" />
        </Avatar>
      )}
    </Box>
  </Fade>
)
}

export default memo(ChatMessage)