import { Fab } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'

interface ChatButtonProps {
  onClick: () => void
  'aria-label'?: string
}

/**
 * Floating action — fixed bottom-right, visible on all layout pages.
 */
function ChatButton({ onClick, 'aria-label': ariaLabel = 'Open chat assistant' }: ChatButtonProps) {
  return (
    <Fab
      color="primary"
      aria-label={ariaLabel}
      onClick={onClick}
      className="!fixed bottom-5 right-5 z-[1300] shadow-lg"
      size="large"
    >
      <ChatIcon />
    </Fab>
  )
}

export default ChatButton