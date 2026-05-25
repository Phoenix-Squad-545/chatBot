// src/components/chatbot/ChatFlowManager.ts

export type FlowStep = {
  id: string
  type: 'question' | 'choice' | 'form' | 'confirmation'
  question?: string
  options?: Array<{ label: string; value: any; nextStep?: string }>
  field?: string
  nextStep?: string
  apiCall?: (data: any) => Promise<any>
  validation?: (value: any) => boolean
}

export type BookingData = {
  category?: string
  flight?: {
    id: string
    name: string
  }
  from?: string
  to?: string
  date?: string
  flightClass?: string
  price?: string
  passengers?: Array<{
    name: string
    passport: string
    meal: string
    status: string
  }>
  payment?: string
  amountPaid?: string
  bookingComplete?: boolean
}

class ChatFlowManager {
  private currentStep: string = 'category_selection'
  private bookingData: BookingData = {}
  private stepHandlers: Map<string, (data?: any) => Promise<any>> = new Map()

  constructor() {
    this.initializeSteps()
  }

  private initializeSteps() {
    // Step 1: Category Selection
    this.stepHandlers.set('category_selection', async () => {
      const categories = await this.getCategories()
      return {
        type: 'choice',
        question: 'What would you like to book?',
        options: categories.map((cat: any) => ({
          label: cat.name,
          value: cat.name.toLowerCase(),
          nextStep: cat.name.toLowerCase() === 'flight' ? 'flight_selection' : 'other_service'
        }))
      }
    })

    // Step 2: Flight Selection
    this.stepHandlers.set('flight_selection', async () => {
      const flights = await this.getFlights()
      return {
        type: 'choice',
        question: 'Please select a flight:',
        options: flights.map((flight: any) => ({
          label: flight.name,
          value: { id: flight._id, name: flight.name },
          nextStep: 'departure_location'
        }))
      }
    })

    // Step 3: Departure Location
    this.stepHandlers.set('departure_location', async () => {
      return {
        type: 'form',
        question: 'Enter departure city:',
        field: 'from',
        nextStep: 'arrival_location',
        validation: (value: string) => value.trim().length > 0
      }
    })

    // Step 4: Arrival Location
    this.stepHandlers.set('arrival_location', async () => {
      return {
        type: 'form',
        question: 'Enter arrival city:',
        field: 'to',
        nextStep: 'date_selection',
        validation: (value: string) => value.trim().length > 0
      }
    })

    // Step 5: Date Selection
    this.stepHandlers.set('date_selection', async () => {
      return {
        type: 'form',
        question: 'Select travel date and time (YYYY-MM-DD HH:MM):',
        field: 'date',
        nextStep: 'class_selection',
        validation: (value: string) => {
          const date = new Date(value)
          return !isNaN(date.getTime()) && date > new Date()
        }
      }
    })

    // Step 6: Class Selection
    this.stepHandlers.set('class_selection', async () => {
      return {
        type: 'choice',
        question: 'Select flight class:',
        options: [
          { label: 'Economy Class', value: 'economy', nextStep: 'price_confirmation' },
          { label: 'Business Class', value: 'business', nextStep: 'price_confirmation' },
          { label: 'First Class', value: 'first class', nextStep: 'price_confirmation' }
        ]
      }
    })

    // Step 7: Price Confirmation
    this.stepHandlers.set('price_confirmation', async () => {
      // Calculate price based on class and distance
      const price = this.calculatePrice()
      return {
        type: 'confirmation',
        question: `The total price is $${price}. Would you like to proceed?`,
        options: [
          { label: 'Yes, proceed', value: true, nextStep: 'passenger_details' },
          { label: 'No, cancel', value: false, nextStep: 'cancel_booking' }
        ]
      }
    })

    // Step 8: Passenger Details
    this.stepHandlers.set('passenger_details', async () => {
      return {
        type: 'form',
        question: 'Enter passenger name:',
        field: 'passenger_name',
        nextStep: 'passenger_passport',
        validation: (value: string) => value.trim().length > 0
      }
    })

    this.stepHandlers.set('passenger_passport', async () => {
      return {
        type: 'form',
        question: 'Enter passport number:',
        field: 'passport',
        nextStep: 'passenger_meal',
        validation: (value: string) => value.trim().length > 0
      }
    })

    this.stepHandlers.set('passenger_meal', async () => {
      return {
        type: 'choice',
        question: 'Select meal preference:',
        field: 'meal',
        options: [
          { label: 'Vegetarian', value: 'veg', nextStep: 'more_passengers' },
          { label: 'Non-Vegetarian', value: 'non-veg', nextStep: 'more_passengers' },
          { label: 'No meal', value: 'none', nextStep: 'more_passengers' }
        ]
      }
    })

    this.stepHandlers.set('more_passengers', async () => {
      return {
        type: 'choice',
        question: 'Add another passenger?',
        options: [
          { label: 'Yes', value: true, nextStep: 'passenger_details' },
          { label: 'No', value: false, nextStep: 'payment_method' }
        ]
      }
    })

    // Step 9: Payment Method
    this.stepHandlers.set('payment_method', async () => {
      return {
        type: 'choice',
        question: 'Select payment method:',
        options: [
          { label: 'Credit/Debit Card', value: 'Card', nextStep: 'payment_amount' },
          { label: 'UPI', value: 'UPI', nextStep: 'payment_amount' },
          { label: 'Net Banking', value: 'Net Banking', nextStep: 'payment_amount' }
        ]
      }
    })

    // Step 10: Payment Amount
    this.stepHandlers.set('payment_amount', async () => {
      const price = this.bookingData.price || '0'
      return {
        type: 'form',
        question: `Please enter the amount to pay (Total: $${price}):`,
        field: 'amount_paid',
        nextStep: 'verify_payment',
        validation: (value: string) => {
          const amount = parseFloat(value)
          const total = parseFloat(this.bookingData.price || '0')
          return amount === total
        }
      }
    })

    // Step 11: Verify Payment & Complete Booking
    this.stepHandlers.set('verify_payment', async () => {
      try {
        const result = await this.completeBooking()
        return {
          type: 'confirmation',
          question: result.success 
            ? '✅ Booking confirmed! Your flight has been successfully booked. Thank you for choosing our service!'
            : '❌ Booking failed. Please try again or contact support.',
          nextStep: 'end'
        }
      } catch (error) {
        return {
          type: 'confirmation',
          question: '❌ An error occurred. Please try again.',
          nextStep: 'end'
        }
      }
    })
  }

  private async getCategories() {
    try {
      const { CategoryListAPI } = await import('../../services/chatbotService')
      const response = await CategoryListAPI()
      return response.data || [{ name: 'Flight' }, { name: 'Hotels' }, { name: 'Car' }, { name: 'Others' }]
    } catch (error) {
      return [{ name: 'Flight' }, { name: 'Hotels' }, { name: 'Car' }, { name: 'Others' }]
    }
  }

  private async getFlights() {
    try {
      const { FlightListAPI } = await import('../../services/chatbotService')
      const response = await FlightListAPI()
      return response.data || []
    } catch (error) {
      return []
    }
  }

  private async updateFlightDetails(payload: any) {
    try {
      const { FlightDetailsAPI } = await import('../../services/chatbotService')
      const response = await FlightDetailsAPI(payload)
      return response
    } catch (error) {
      throw error
    }
  }

  private calculatePrice(): string {
    // Implement price calculation logic
    const basePrice = 5000
    const classMultiplier = {
      'economy': 1,
      'business': 2,
      'first class': 3
    }
    const multiplier = classMultiplier[this.bookingData.flightClass as keyof typeof classMultiplier] || 1
    return (basePrice * multiplier).toString()
  }

  private async completeBooking() {
    try {
      const payload = {
        name: this.bookingData.flight?.name,
        travelId: this.bookingData.flight?.id,
        from: this.bookingData.from,
        to: this.bookingData.to,
        date: this.bookingData.date,
        flightClass: this.bookingData.flightClass,
        price: this.bookingData.price,
        passengers: this.bookingData.passengers,
        payment: this.bookingData.payment,
        amountPaid: this.bookingData.amountPaid
      }
      
      await this.updateFlightDetails(payload)
      this.bookingData.bookingComplete = true
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  }

  async getNextStep(stepId: string, userInput?: any): Promise<any> {
    const handler = this.stepHandlers.get(stepId)
    if (!handler) {
      return {
        type: 'confirmation',
        question: 'Thank you for using our service! How can we help you further?',
        nextStep: 'end'
      }
    }

    // Store user input if provided
    if (userInput !== undefined) {
      await this.storeUserInput(stepId, userInput)
    }

    const step = await handler(userInput)
    this.currentStep = step.nextStep || stepId
    
    return step
  }

  private async storeUserInput(stepId: string, value: any) {
    switch(stepId) {
      case 'category_selection':
        this.bookingData.category = value
        break
      case 'flight_selection':
        this.bookingData.flight = value
        break
      case 'departure_location':
        this.bookingData.from = value
        break
      case 'arrival_location':
        this.bookingData.to = value
        break
      case 'date_selection':
        // Convert to UTC format
        const date = new Date(value)
        this.bookingData.date = date.toISOString()
        break
      case 'class_selection':
        this.bookingData.flightClass = value
        // Update price after class selection
        this.bookingData.price = this.calculatePrice()
        break
      case 'price_confirmation':
        if (value === false) {
          this.currentStep = 'end'
        }
        break
      case 'passenger_details':
        if (!this.bookingData.passengers) {
          this.bookingData.passengers = []
        }
        this.bookingData.passengers.push({
          name: value,
          passport: '',
          meal: '',
          status: 'pending'
        })
        this.currentPassengerIndex = this.bookingData.passengers.length - 1
        break
      case 'passenger_passport':
        if (this.bookingData.passengers && this.currentPassengerIndex !== undefined) {
          this.bookingData.passengers[this.currentPassengerIndex].passport = value
        }
        break
      case 'passenger_meal':
        if (this.bookingData.passengers && this.currentPassengerIndex !== undefined) {
          this.bookingData.passengers[this.currentPassengerIndex].meal = value
        }
        break
      case 'payment_method':
        this.bookingData.payment = value
        break
      case 'payment_amount':
        this.bookingData.amountPaid = value
        break
    }
  }

  private currentPassengerIndex?: number

  getCurrentStep(): string {
    return this.currentStep
  }

  getBookingData(): BookingData {
    return this.bookingData
  }

  reset() {
    this.currentStep = 'category_selection'
    this.bookingData = {}
    this.currentPassengerIndex = undefined
  }

  canGoBack(): boolean {
    const steps = Array.from(this.stepHandlers.keys())
    const currentIndex = steps.indexOf(this.currentStep)
    return currentIndex > 0
  }

  goBack(): string | null {
    const steps = Array.from(this.stepHandlers.keys())
    const currentIndex = steps.indexOf(this.currentStep)
    if (currentIndex > 0) {
      this.currentStep = steps[currentIndex - 1]
      return this.currentStep
    }
    return null
  }
}

export default ChatFlowManager