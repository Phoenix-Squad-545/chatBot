/**
 * Decision-tree data for the interactive "choice" chat variant.
 * Branching only — rendering is append-only in Layout state (see `handleChoiceSelect`).
 */

export type ChatOption = {
  label: string
  nextQuestionId: number | null
}

export type ChatQuestion = {
  id: number
  question: string
  options: ChatOption[]
  resolution?: string
}

export const chatFlow: ChatQuestion[] = [
  {
    id: 1,
    question: 'What do you need help with?',
    options: [
      { label: 'Billing', nextQuestionId: 3 },
      { label: 'Technical', nextQuestionId: 4 },
      { label: 'Account', nextQuestionId: 2 },
      { label: 'Other', nextQuestionId: 5 },
    ],
  },
  {
    id: 2,
    question: 'Which account topic applies?',
    options: [
      { label: 'Login or password', nextQuestionId: 20 },
      { label: 'Profile or email change', nextQuestionId: 20 },
      { label: 'Delete my account', nextQuestionId: 20 },
      { label: 'Something else', nextQuestionId: 20 },
    ],
  },
  {
    id: 3,
    question: 'Please select billing issue type',
    options: [
      { label: 'Invoice issue', nextQuestionId: 30 },
      { label: 'Refund issue', nextQuestionId: 30 },
      { label: 'Payment failed', nextQuestionId: 30 },
      { label: 'Other billing', nextQuestionId: 30 },
    ],
  },
  {
    id: 4,
    question: 'What kind of technical issue?',
    options: [
      { label: 'App crashes or errors', nextQuestionId: 40 },
      { label: 'Slow performance', nextQuestionId: 40 },
      { label: 'Integration / API', nextQuestionId: 40 },
      { label: 'Feature not working', nextQuestionId: 40 },
    ],
  },
  {
    id: 5,
    question: 'How should we follow up?',
    options: [
      { label: 'Email me', nextQuestionId: 50 },
      { label: 'Schedule a call', nextQuestionId: 50 },
      { label: 'Live chat later', nextQuestionId: 50 },
      { label: 'Just browsing', nextQuestionId: 50 },
    ],
  },
  {
    id: 20,
    question: '',
    options: [],
    resolution:
      'Thanks — for account changes, visit Settings → Account or contact support with your user ID.',
  },
  {
    id: 30,
    question: '',
    options: [],
    resolution:
      'Billing team tip: check your payment method under Billing → Payment methods, then retry the charge or open a ticket with your invoice number.',
  },
  {
    id: 40,
    question: '',
    options: [],
    resolution:
      'For technical issues, try clearing cache, updating the app, and including screenshots or error codes when you contact engineering.',
  },
  {
    id: 50,
    question: '',
    options: [],
    resolution:
      'We recorded your preference. You will get a confirmation in-app shortly.',
  },
]

const byId = new Map(chatFlow.map((q) => [q.id, q]))

export function getQuestionById(id: number): ChatQuestion | undefined {
  return byId.get(id)
}
