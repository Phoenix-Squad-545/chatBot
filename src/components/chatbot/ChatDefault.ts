interface BaseMessage {
  id: string
  role: 'user' | 'assistant'
  timestamp: string
}
interface DefaultMessage extends BaseMessage {
  chatVariant: 'default'
  text: string
}

interface ChoiceMessage extends BaseMessage {
  chatVariant: 'choice'
  questionId: number
  optionsDisabled: boolean
  selectedOptionLabel: string | null
}

type ChatMessage = DefaultMessage | ChoiceMessage

export  const getInitialMessages = (): ChatMessage[] => {
 const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return [
      {
        id: 'welcome',
        role: 'assistant',
        chatVariant: 'default',
        text: 'Hi — Welcome to the Expense Assistant Demo! How can I help today?',
        timestamp: time,
      },
      {
        id: 'help-tree',
        role: 'assistant',
        chatVariant: 'choice',
        questionId: 1,
        optionsDisabled: false,
        selectedOptionLabel: null,
        timestamp: time,
      },
    ]
    }