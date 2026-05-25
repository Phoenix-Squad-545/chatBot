import { memo, useMemo } from 'react'
import { alpha } from '@mui/material/styles'
import { Box, Button, Fade, Typography, TextField } from '@mui/material'
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

// Dynamic message types
export interface DynamicChoiceMessage extends BaseMessage {
  chatVariant: 'dynamic_choice'
  question: string
  options: Array<{ label: string; value: any; nextStep?: string }>
  stepId: string
  field?: string
}

export interface DynamicFormMessage extends BaseMessage {
  chatVariant: 'dynamic_form'
  question: string
  field: string
  stepId: string
  validation?: (value: string) => boolean
}

export interface DynamicConfirmationMessage extends BaseMessage {
  chatVariant: 'dynamic_confirmation'
  question: string
  stepId: string
}

// Union type for all message types
export type ChatMessageType = 
  | DefaultMessage 
  | ChoiceMessage 
  | DynamicChoiceMessage 
  | DynamicFormMessage 
  | DynamicConfirmationMessage

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

interface DynamicChoiceMessageBodyProps {
  message: DynamicChoiceMessage
  onDynamicChoice?: (stepId: string, choice: any, nextStep?: string) => void
}

interface DynamicFormMessageBodyProps {
  message: DynamicFormMessage
  formValue: string
  formError: string
  onFormValueChange: (value: string) => void
  onFormSubmit: (stepId: string, field: string, value: string, validation?: (val: string) => boolean) => void
}

interface ChatMessageProps {
  message: ChatMessageType
  onChoiceSelect?: (messageId: string, choice: { label: string; nextQuestionId: number | null }) => void
  onDynamicChoice?: (stepId: string, choice: any, nextStep?: string) => void
  onDynamicFormSubmit?: (stepId: string, field: string, value: string, validation?: (val: string) => boolean) => void
  formValue?: string
  formError?: string
  onFormValueChange?: (value: string) => void
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
console.log(text,"texttext>>>");

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
          sx={{ fontSize: "11px", fontWeight: 500 }}
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
          sx={{ fontSize: "11px", fontWeight: 500 }}
        >
          {timestamp}
        </Typography>
      )}
    </Box>
  )
}

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
          sx={{ fontSize: "11px", fontWeight: 500 }}
        >
          {timestamp}
        </Typography>
      )}
    </Box>
  )
}

function DynamicChoiceMessageBody({ message, onDynamicChoice }: DynamicChoiceMessageBodyProps) {
  const { bubbleSx, timeClass } = useBubbleStyles(false)

  return (
    <Box className="flex flex-col items-start max-w-[95%] mb-4">
      <Box
        className="rounded-2xl rounded-bl-md px-3 py-3 shadow-sm transition-all duration-300 ease-out"
        sx={bubbleSx}
      >
        <Typography variant="body2" className="mb-3 font-medium whitespace-pre-wrap break-words">
          {message.question}
        </Typography>
        <Box className="flex flex-col gap-2">
          {message.options.map((opt, idx) => (
            <Button
              key={idx}
              variant="outlined"
              size="small"
              onClick={() => onDynamicChoice?.(message.stepId, opt, opt.nextStep)}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', borderRadius: 3 }}
            >
              {opt.label}
            </Button>
          ))}
        </Box>
      </Box>
      {message.timestamp && (
        <Typography
          variant="caption"
          className={`mt-2 text-right text-slate-600 dark:text-slate-400 ${timeClass}`}
          sx={{ fontSize: "11px", fontWeight: 500 }}
        >
          {message.timestamp}
        </Typography>
      )}
    </Box>
  )
}

function DynamicFormMessageBody({ message, formValue, formError, onFormValueChange, onFormSubmit }: DynamicFormMessageBodyProps) {
  const { bubbleSx, timeClass } = useBubbleStyles(false)

  return (
    <Box className="flex flex-col items-start max-w-[95%] mb-4">
      <Box
        className="rounded-2xl rounded-bl-md px-3 py-3 shadow-sm transition-all duration-300 ease-out"
        sx={bubbleSx}
      >
        <Typography variant="body2" className="mb-2 whitespace-pre-wrap break-words">
          {message.question}
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={formValue}
          onChange={(e) => onFormValueChange(e.target.value)}
          error={!!formError}
          helperText={formError}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onFormSubmit(message.stepId, message.field, formValue, message.validation)
            }
          }}
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={() => onFormSubmit(message.stepId, message.field, formValue, message.validation)}
        >
          Submit
        </Button>
      </Box>
      {message.timestamp && (
        <Typography
          variant="caption"
          className={`mt-2 text-right text-slate-600 dark:text-slate-400 ${timeClass}`}
          sx={{ fontSize: "11px", fontWeight: 500 }}
        >
          {message.timestamp}
        </Typography>
      )}
    </Box>
  )
}

function DynamicConfirmationMessageBody({ message }: { message: DynamicConfirmationMessage }) {
  const { bubbleSx, timeClass } = useBubbleStyles(false)

  return (
    <Box className="flex flex-col items-start max-w-[95%] mb-4">
      <Box
        className="rounded-2xl rounded-bl-md px-3 py-3 shadow-sm transition-all duration-300 ease-out"
        sx={bubbleSx}
      >
        <Typography variant="body2" className="whitespace-pre-wrap break-words">
          {message.question}
        </Typography>
      </Box>
      {message.timestamp && (
        <Typography
          variant="caption"
          className={`mt-2 text-right text-slate-600 dark:text-slate-400 ${timeClass}`}
          sx={{ fontSize: "11px", fontWeight: 500 }}
        >
          {message.timestamp}
        </Typography>
      )}
    </Box>
  )
}

/**
 * Single transcript row. Handles all message types.
 */
function ChatMessage({ 
  message, 
  onChoiceSelect, 
  onDynamicChoice, 
  onDynamicFormSubmit,
  formValue = '',
  formError = '',
  onFormValueChange 
}: ChatMessageProps) {
  const isUser = message.role === 'user'
  const chatVariant = message.chatVariant ?? 'default'

  // User message (always default type)
  if (isUser && chatVariant === 'default') {
    const userMessage = message as DefaultMessage
    console.log(userMessage,"userMessage>>>");
    
    return (
      <Fade in timeout={280}>
        <Box className="flex w-full mb-4 last:mb-2 items-start justify-end">
          <DefaultMessageBody text={userMessage.text} timestamp={userMessage.timestamp} />
          <Avatar sx={{ width: 32, height: 32, ml: 1, bgcolor: "#4f46e5", color: "#fff" }}>
            <PersonOutlineIcon fontSize="small" />
          </Avatar>
        </Box>
      </Fade>
    )
  }

  // Assistant message with static choices
  if (!isUser && chatVariant === 'choice') {
    const choiceMessage = message as ChoiceMessage
    return (
      <Fade in timeout={280}>
        <Box className="flex w-full mb-4 last:mb-2 items-start justify-start">
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: "#e2e8f0", color: "#334155" }}>
            <SmartToyOutlinedIcon fontSize="small" />
          </Avatar>
          <ChoiceMessageBody
            messageId={choiceMessage.id}
            questionId={choiceMessage.questionId}
            optionsDisabled={choiceMessage.optionsDisabled}
            selectedOptionLabel={choiceMessage.selectedOptionLabel}
            timestamp={choiceMessage.timestamp}
            onChoiceSelect={onChoiceSelect}
          />
        </Box>
      </Fade>
    )
  }

  // Assistant message with dynamic choices (from API)
  if (!isUser && chatVariant === 'dynamic_choice') {
    const dynamicMessage = message as DynamicChoiceMessage
    return (
      <Fade in timeout={280}>
        <Box className="flex w-full mb-4 last:mb-2 items-start justify-start">
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: "#e2e8f0", color: "#334155" }}>
            <SmartToyOutlinedIcon fontSize="small" />
          </Avatar>
          <DynamicChoiceMessageBody 
            message={dynamicMessage} 
            onDynamicChoice={onDynamicChoice} 
          />
        </Box>
      </Fade>
    )
  }

  // Assistant message with form input
  if (!isUser && chatVariant === 'dynamic_form') {
    const formMessage = message as DynamicFormMessage
    return (
      <Fade in timeout={280}>
        <Box className="flex w-full mb-4 last:mb-2 items-start justify-start">
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: "#e2e8f0", color: "#334155" }}>
            <SmartToyOutlinedIcon fontSize="small" />
          </Avatar>
          <DynamicFormMessageBody
            message={formMessage}
            formValue={formValue}
            formError={formError}
            onFormValueChange={onFormValueChange || (() => {})}
            onFormSubmit={onDynamicFormSubmit || (() => {})}
          />
        </Box>
      </Fade>
    )
  }

  // Assistant message with confirmation
  if (!isUser && chatVariant === 'dynamic_confirmation') {
    const confirmationMessage = message as DynamicConfirmationMessage
    return (
      <Fade in timeout={280}>
        <Box className="flex w-full mb-4 last:mb-2 items-start justify-start">
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: "#e2e8f0", color: "#334155" }}>
            <SmartToyOutlinedIcon fontSize="small" />
          </Avatar>
          <DynamicConfirmationMessageBody message={confirmationMessage} />
        </Box>
      </Fade>
    )
  }

  // Default assistant text message
  if (!isUser && chatVariant === 'default') {
    const assistantMessage = message as DefaultMessage
    return (
      <Fade in timeout={280}>
        <Box className="flex w-full mb-4 last:mb-2 items-start justify-start">
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: "#e2e8f0", color: "#334155" }}>
            <SmartToyOutlinedIcon fontSize="small" />
          </Avatar>
          <AssistantTextBody text={assistantMessage.text} timestamp={assistantMessage.timestamp} />
        </Box>
      </Fade>
    )
  }

  // Fallback
  return null
}

export default memo(ChatMessage)