import { Paper, Typography } from '@mui/material'
import SmartToyIcon from '@mui/icons-material/SmartToy'

/**
 * Chatbot route — contextual copy for the assistant feature.
 * The floating chat UI lives in `Layout.jsx` so it stays visible on every page.
 */
function Pages() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
          <SmartToyIcon />
        </div>
        <div>
          <Typography variant="h4" component="h1" className="font-semibold tracking-tight">
            Chatbot
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            Use the floating button in the bottom-right corner to open the assistant from any
            screen. This page describes the feature; the reusable UI is under{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">components/chatbot</code>.
          </Typography>
        </div>
      </div>

      <Paper
        elevation={0}
        className="rounded-2xl border border-slate-200/80 p-4 sm:p-6 dark:border-slate-700/80"
      >
        <Typography variant="body2" color="text.secondary">
          Next steps: connect <strong>ChatWindow</strong> to your LLM or support API, persist
          transcripts, and add streaming responses as needed.
        </Typography>
      </Paper>
    </div>
  )
}

export default Pages
