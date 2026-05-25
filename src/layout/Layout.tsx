import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Toolbar, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar, { type SidebarItem } from './Sidebar'
import Navbar, { type NavbarConfig } from './Navbar'
import ChatButton from '../components/chatbot/ChatButton'
import ChatWindow from '../components/chatbot/ChatWindow'
import { getQuestionById } from '../components/chatbot/FormData'
import { getInitialMessages } from '../components/chatbot/ChatDefault'
import { CarDetailsAPI, CarListAPI, CategoryListAPI, FlightDetailsAPI, HotelsDetailsAPI, HotelsListAPI } from '../services/chatbotService'
import { ChatAPI } from '../services/authService'
import ChatFlowManager from '../components/chatbot/ChatFlowManager'
import { FlightListAPI } from '../services/chatbotService'
import { formatDateToISO } from '../helper/data'

// Types for chat messages
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

// Dynamic message types
interface DynamicChoiceMessage extends BaseMessage {
  chatVariant: 'dynamic_choice'
  question: string
  options: Array<{ label: string; value: any; nextStep?: string }>
  stepId: string
  field?: string
}
// Add this interface
interface DynamicFormMessage extends BaseMessage {
  chatVariant: 'dynamic_form'
  question: string
  field: string
  stepId: string
  validation?: (value: string) => boolean
}

// Update ChatMessage type to include DynamicFormMessage
type ChatMessage = DefaultMessage | ChoiceMessage | DynamicChoiceMessage | DynamicFormMessage

interface LayoutProps {
  sidebarItems: SidebarItem[]
  navbarConfig: NavbarConfig
}

/**
 * App shell: fixed navbar → toolbar spacer → sidebar + main.
 * Chat transcript is append-only: choice flows add user lines + new assistant lines (never replace).
 */
function Layout({ sidebarItems, navbarConfig }: LayoutProps) {
  const theme = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth >= theme.breakpoints.values.md,
  )

  const [chatOpen, setChatOpen] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [flowManager] = useState(() => new ChatFlowManager())
  const checkInDateRef = useRef<string>('');
const [currentBookingType, setCurrentBookingType] = useState<'flight' | 'hotel' | 'car' | null>(null)
    // Separate state for each booking type
  const [flightBooking, setFlightBooking] = useState({
    name: '',
    travelId: '',
    from: '',
    to: '',
    date: '',
    price: '',
    flightClass: '',
    seat: '',
    payment: '',
    passenger_name: ''
  })

  const [hotelBooking, setHotelBooking] = useState({
    name: '',
    travelId: '',
    city: '',
    checkIn: '',
    checkOut: '',
    brand: '',
    stars: '',
    price: 0,
    type: '',
    quest: 0,
    payment: ''
  })

const [carBooking, setCarBooking] = useState({
  name: '',
  travelId: '',
  pickupLocation: '',
  dropLocation: '',
  pickupDate: '',
  dropDate: '',
  carType: '',
  price: '',
  payment: '',
  passenger_name: '',  // Add this field
  city: ''  // Add this field
})

  // Reset function for each booking type
  const resetFlightBooking = () => {
    setFlightBooking({
      name: '',
      travelId: '',
      from: '',
      to: '',
      date: '',
      price: '',
      flightClass: '',
      seat: '',
      payment: '',
      passenger_name: ''
    })
  }

const resetHotelBooking = () => {
  setHotelBooking({
    name: '',
    travelId: '',
    city: '',
    checkIn: '',
    checkOut: '',
    brand: '',
    stars: '',
    price: 0,
    type: '',
    quest: 0,
    payment: ''
  });
  checkInDateRef.current = ''; // Reset the ref
}

const resetCarBooking = () => {
  setCarBooking({
    name: '',
    travelId: '',
    pickupLocation: '',
    dropLocation: '',
    pickupDate: '',
    dropDate: '',
    carType: '',
    price: '',
    payment: '',
    passenger_name: '',
    city: ''
  })
}
  const handleDrawerToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

 // Initialize chat with welcome message and categories
const initializeChat = useCallback(async () => {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  
  // Welcome message
  const welcomeMessage: DefaultMessage = {
    id: `welcome-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'default',
    text: 'Hi — Welcome to the Expense Assistant Demo! How can I help today?',
    timestamp: time,
  }
  
  // Fetch categories from API
  try {
    const response = await CategoryListAPI()
    const categories = response.data || [
      { name: 'Flight' },
      { name: 'Hotel' },
      { name: 'Car' },
      { name: 'Others' }
    ]
    
     // Create dynamic choice message for categories with _id
    const categoryOptions = categories.map((cat: any) => ({
      label: cat.name,
      value: { 
        name: cat.name, 
        categoryId: cat._id  // Store the category _id
      },
      nextStep: cat.name === 'Flight' ? 'flight_selection' : 
                cat.name === 'Hotel' ? 'hotel_selection' : 
                cat.name === 'Car' ? 'car_selection' : 'other_service'
    }))
    
    const categoryMessage: DynamicChoiceMessage = {
      id: `categories-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'Please select a category:',
      options: categoryOptions,
      stepId: 'category_selection',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    
    setMessages([welcomeMessage, categoryMessage])
  } catch (error) {
    console.error('Error fetching categories:', error)
   // Fallback categories if API fails
    const fallbackOptions = [
      { label: 'Flight', value: { name: 'Flight', categoryId: 'flight_fallback' }, nextStep: 'flight_selection' },
      { label: 'Hotel', value: { name: 'Hotel', categoryId: 'hotel_fallback' }, nextStep: 'hotel_selection' },
      { label: 'Car', value: { name: 'Car', categoryId: 'car_fallback' }, nextStep: 'car_selection' },
      { label: 'Others', value: { name: 'Others', categoryId: 'others_fallback' }, nextStep: 'other_service' }
    ]
    
    const categoryMessage: DynamicChoiceMessage = {
      id: `categories-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'Please select a category:',
      options: fallbackOptions,
      stepId: 'category_selection',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    
    setMessages([welcomeMessage, categoryMessage])
  }
}, [])

  // Handle chat button click
  const handleChatOpen = useCallback(() => {
    setMessages([]) // Clear existing messages
    initializeChat() // Initialize with welcome and categories
    setChatOpen(true)
  }, [initializeChat])

  /**
   * Locks the assistant option row, appends the user pick, then appends the next bot turn (or resolution).
   */
  const handleChoiceSelect = useCallback((assistantMessageId: string, { label, nextQuestionId }: { label: string; nextQuestionId: number | null }) => {
    setMessages((prev) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const locked = prev.map((m) =>
        m.id === assistantMessageId && m.chatVariant === 'choice'
          ? { ...m, optionsDisabled: true, selectedOptionLabel: label }
          : m,
      )

      const userMsg: DefaultMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        chatVariant: 'default',
        text: label,
        timestamp: time,
      }

      if (nextQuestionId == null) {
        return [...locked, userMsg]
      }

      const node = getQuestionById(nextQuestionId)
      if (!node) {
        return [...locked, userMsg]
      }

      if (node.options.length === 0 && node.resolution) {
        return [
          ...locked,
          userMsg,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            chatVariant: 'default',
            text: node.resolution,
            timestamp: time,
          } as DefaultMessage,
        ]
      }

      return [
        ...locked,
        userMsg,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          chatVariant: 'choice',
          questionId: nextQuestionId,
          optionsDisabled: false,
          selectedOptionLabel: null,
          timestamp: time,
        } as ChoiceMessage,
      ]
    })
  }, [])

const handleDynamicChoice = useCallback(async (stepId: string, choice: any, nextStep?: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    // Add user's choice as a message
    const userMsg: DefaultMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      chatVariant: 'default',
      text: choice.label,
      timestamp: time,
    }
    
    setMessages((prev) => [...prev, userMsg])
    
    // Handle category selection
  if (stepId === 'category_selection') {
  console.log(choice, "Selected category:", choice.value);
  
  // Store the category ID if needed
  const categoryId = choice.value.categoryId;
  const categoryName = choice.value.name;
  
  setCurrentBookingType(
    categoryName === 'Flight' ? 'flight' : 
    categoryName === 'Hotel' ? 'hotel' : 
    categoryName === 'Car' ? 'car' : null
  );
  
  setIsTyping(true)
  
  try {
    let response;
    let options = [];
    let questionText = '';
    let nextStepId = '';
    
    switch (categoryName) {
      case 'Flight':
        console.log('Calling FlightListAPI...');
        response = await FlightListAPI();
        console.log(response, "Flight List response>>>>>>");
        
        const flights = response.data || [];
        options = flights.map((flight: any) => ({
          label: flight.name,
          value: { 
            id: flight._id, 
            name: flight.name, 
            travelId: flight._id,
            categoryId: categoryId  // Include category ID
          },
          nextStep: 'flight_details_fetch'  // New step to fetch flight details
        }));
        questionText = 'Please select a flight:';
        nextStepId = 'flight_selection';
        break;
        
      case 'Hotel':
        response = await HotelsListAPI();
        const hotels = response.data || [];
        options = hotels.map((hotel: any) => ({
          label: hotel.name,
          value: { 
            id: hotel._id, 
            name: hotel.name, 
            travelId: hotel._id,
            categoryId: categoryId
          },
          nextStep: 'hotel_city'
        }));
        questionText = 'Please select a hotel:';
        nextStepId = 'hotel_selection';
        break;
        
      case 'Car':
        response = await CarListAPI();
        const cars = response.data || [];
        options = cars.map((car: any) => ({
          label: car.name,
          value: { 
            id: car._id, 
            name: car.name, 
            travelId: car._id,
            categoryId: categoryId
          },
          nextStep: 'car_pickup_location'
        }));
        questionText = 'Please select a car:';
        nextStepId = 'car_selection';
        break;
        
        case 'Others':
  // Show FAQ options instead of fetching from API
  const othersOptions = [
    { label: '❓ Frequently Asked Questions', value: 'faq', nextStep: 'faq_menu' },
    { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' }
  ];
  
  const othersMsg: DynamicChoiceMessage = {
    id: `others-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'How can we help you?',
    options: othersOptions,
    stepId: 'others_menu',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, othersMsg]);
  setIsTyping(false);
  return;

      default:
  // For any other categories, show FAQ/main menu options
  const fallbackOptions = [
    { label: '❓ Frequently Asked Questions', value: 'faq', nextStep: 'show_faq' },
    { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' }
  ];
  
  const fallbackMsg: DynamicChoiceMessage = {
    id: `others-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: `You selected ${categoryName}. How can we help you?`,
    options: fallbackOptions,
    stepId: 'others_menu',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, fallbackMsg]);
  setIsTyping(false);
  return;
    }
    
    const selectionMessage: DynamicChoiceMessage = {
      id: `${categoryName.toLowerCase()}-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: questionText,
      options: options,
      stepId: nextStepId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages((prev) => [...prev, selectionMessage]);
    
  } catch (error) {
    console.error(`Error fetching ${categoryName} list:`, error);
    const errorMsg: DefaultMessage = {
      id: `error-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: `Sorry, unable to fetch ${categoryName} list. Please try again.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setIsTyping(false);
  }
}
    
    // ==================== FLIGHT BOOKING FLOW ====================
else if (stepId === 'flight_selection' && choice.value.id) {
  setIsTyping(true);
  
  try {
    // Fetch flight details for the selected flight
    const payload = {
      name: choice.label,  // Flight name (e.g., "IndiGo")
      travelId: choice.value.categoryId  // Flight ID
    };
    
    console.log('Fetching flight details with payload:', payload);
    const response = await FlightDetailsAPI(payload);
    const flightData = response.data[0]; // Get the first flight from response
    
    console.log('Flight details response:', flightData);
    
    // Store the complete flight data
    setFlightBooking(prev => ({
      ...prev,
      name: flightData.name,
      travelId: flightData.travelId,
      from: flightData.from,
      to: flightData.to,
      date: flightData.date,
      price: flightData.price,
      flightClass: flightData.flightClass,
      seat: flightData.seat,
      passenger_name: flightData.passengers?.[0]?.name || '',
      payment: flightData.payment
    }));
    
    // Create dropdown options for departure locations (if multiple options available)
    // You can modify this based on your API response structure
    const departureOptions = [
      { label: flightData.from, value: flightData.from, nextStep: 'flight_arrival_selection' }
    ];
    
    const departureMsg: DynamicChoiceMessage = {
      id: `flight-departure-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'Select departure location:',
      options: departureOptions,
      stepId: 'flight_arrival_selection',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, departureMsg]);
    
  } catch (error) {
    console.error('Error fetching flight details:', error);
    const errorMsg: DefaultMessage = {
      id: `error-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: 'Sorry, unable to fetch flight details. Please try again.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setIsTyping(false);
  }
}
else if (stepId === 'flight_arrival_selection') {
  // Show arrival locations based on flight data
  const arrivalOptions = [
    { label: flightBooking.to, value: flightBooking.to, nextStep: 'flight_date_selection' }
  ];
  
  const arrivalMsg: DynamicChoiceMessage = {
    id: `flight-arrival-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Select arrival location:',
    options: arrivalOptions,
    stepId: 'flight_date_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, arrivalMsg]);
}
else if (stepId === 'flight_date_selection') {
  // Format date for display
  const formattedDate = new Date(flightBooking.date).toLocaleString();
  const dateOptions = [
    { label: formattedDate, value: flightBooking.date, nextStep: 'flight_class_selection' }
  ];
  
  const dateMsg: DynamicChoiceMessage = {
    id: `flight-date-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Select travel date:',
    options: dateOptions,
    stepId: 'flight_class_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, dateMsg]);
}
else if (stepId === 'flight_class_selection') {
  // Show flight class
  const classOptions = [
    { label: flightBooking.flightClass, value: flightBooking.flightClass, nextStep: 'flight_seat_selection' }
  ];
  
  const classMsg: DynamicChoiceMessage = {
    id: `flight-class-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Selected flight class:',
    options: classOptions,
    stepId: 'flight_seat_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, classMsg]);
}
else if (stepId === 'flight_seat_selection') {
  // Show seat preference
  const seatOptions = [
    { label: flightBooking.seat, value: flightBooking.seat, nextStep: 'flight_price_summary' }
  ];
  
  const seatMsg: DynamicChoiceMessage = {
    id: `flight-seat-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Selected seat preference:',
    options: seatOptions,
    stepId: 'flight_price_summary',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, seatMsg]);
}
   else if (stepId === 'flight_price_summary') {
  // Show price summary
  const priceMsg: DefaultMessage = {
    id: `flight-price-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'default',
    text: `📋 **Flight Booking Summary**\n\n` +
          `✈️ Airline: ${flightBooking.name}\n` +
          `📍 From: ${flightBooking.from}\n` +
          `📍 To: ${flightBooking.to}\n` +
          `📅 Date: ${new Date(flightBooking.date).toLocaleString()}\n` +
          `💺 Class: ${flightBooking.flightClass}\n` +
          `🪑 Seat: ${flightBooking.seat}\n` +
          `💰 Price: $${flightBooking.price}\n\n` +
          `Do you want to confirm this booking?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, priceMsg]);
  
  // Add confirmation options
  const confirmOptions = [
    { label: '✅ Yes, confirm booking', value: 'confirm', nextStep: 'flight_confirm_booking' },
    { label: '❌ No, cancel', value: 'cancel', nextStep: 'flight_cancel_booking' }
  ];
  
  const confirmMsg: DynamicChoiceMessage = {
    id: `flight-confirm-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Please confirm:',
    options: confirmOptions,
    stepId: 'flight_confirmation',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, confirmMsg]);
}
else if (stepId === 'flight_confirmation') {
  if (choice.value === 'confirm') {
    // Show passenger name input form
    const passengerMsg: any = {
      id: `flight-passenger-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_form',
      question: 'Please enter passenger name:',
      field: 'passenger_name',
      stepId: 'flight_passenger_input',
      validation: (value: string) => value.trim().length > 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, passengerMsg]);
  } else {
    // User cancelled
    const cancelMsg: DefaultMessage = {
      id: `cancelled-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: 'Booking cancelled. Returning to main menu...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, cancelMsg]);
    
    // Return to main menu
    const mainMenuOptions = [
      { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' }
    ];
    
    const mainMenuMsg: DynamicChoiceMessage = {
      id: `mainmenu-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'What would you like to do next?',
      options: mainMenuOptions,
      stepId: 'main_menu',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, mainMenuMsg]);
    
    // resetFlightBooking();
    // setCurrentBookingType(null);
  }
}
else if (stepId === 'flight_cancel_booking') {
  const cancelMsg: DefaultMessage = {
    id: `cancelled-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'default',
    text: 'Booking cancelled. Returning to main menu...',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, cancelMsg]);
  
  // Reset flight booking before going to main menu
  resetFlightBooking();
  setCurrentBookingType(null);
  
  // Go to main menu with proper category options
  const welcomeBackMsg: DefaultMessage = {
    id: `welcomeback-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'default',
    text: 'Welcome back! How can I help you today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, welcomeBackMsg]);
  
  setIsTyping(true);
  try {
    const response = await CategoryListAPI();
    const categories = response.data || [];
    
    const categoryOptions = categories.map((cat: any) => ({
      label: cat.name,
      value: { 
        name: cat.name, 
        categoryId: cat._id
      },
      nextStep: cat.name === 'Flight' ? 'flight_selection' : 
                cat.name === 'Hotel' ? 'hotel_selection' : 
                cat.name === 'Car' ? 'car_selection' : 'other_service'
    }));
    
    const categoryMessage: DynamicChoiceMessage = {
      id: `categories-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'Please select a category:',
      options: categoryOptions,
      stepId: 'category_selection',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, categoryMessage]);
  } catch (error) {
    console.error('Error fetching categories:', error);
  } finally {
    setIsTyping(false);
  }
}
else if (stepId === 'flight_passenger_input') {
  // Store passenger name
  setFlightBooking(prev => ({ ...prev, passenger_name: choice.label }));
  
  // Show payment options
  const paymentOptions = [
    { label: '💳 Credit/Debit Card', value: 'Card', nextStep: 'flight_payment' },
    { label: '📱 UPI', value: 'UPI', nextStep: 'flight_payment' },
    { label: '🏦 Net Banking', value: 'Net Banking', nextStep: 'flight_payment' },
    { label: '💰 Cash', value: 'Cash', nextStep: 'flight_payment' }
  ];
  
  const paymentMsg: DynamicChoiceMessage = {
    id: `flight-payment-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Please select payment method:',
    options: paymentOptions,
    stepId: 'flight_payment_method',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, paymentMsg]);
}
else if (stepId === 'flight_payment_method') {
  // Store payment method
  setFlightBooking(prev => ({ ...prev, payment: choice.label }));
  
  setIsTyping(true);
  
  try {
    // Prepare the complete payload for flight booking
    const payload = {
      name: flightBooking.name,
      travelId: flightBooking.travelId,
      from: flightBooking.from,
      to: flightBooking.to,
      date: flightBooking.date,
      price: flightBooking.price,
      flightClass: flightBooking.flightClass,
      seat: flightBooking.seat,
      payment: choice.label,
      passenger_name: flightBooking.passenger_name
    };
    
    console.log('🚀 Submitting Flight Booking payload:', payload);
    
    // Call the API to complete the booking
    const response = await FlightDetailsAPI(payload);
    console.log('✅ Flight booking response:', response);
    
    // Show success message
    const confirmationMsg: DefaultMessage = {
      id: `flight-confirmation-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: `✅ **Flight Booking Confirmed!**\n\n` +
            `Booking Details:\n` +
            `✈️ Airline: ${flightBooking.name}\n` +
            `👤 Passenger: ${flightBooking.passenger_name}\n` +
            `📍 From: ${flightBooking.from} → To: ${flightBooking.to}\n` +
            `📅 Date: ${new Date(flightBooking.date).toLocaleString()}\n` +
            `💺 Class: ${flightBooking.flightClass}\n` +
            `🪑 Seat: ${flightBooking.seat}\n` +
            `💰 Total Paid: $${flightBooking.price}\n` +
            `💳 Payment: ${choice.label}\n\n` +
            `${response.data?.message || response.message || 'Your flight has been successfully booked.'}\n\n` +
            `Thank you for choosing our service! A confirmation email has been sent to your registered email.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, confirmationMsg]);
    
    // Show main menu options
    const mainMenuOptions = [
      { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' },
      // { label: '📋 View My Bookings', value: 'view_bookings', nextStep: 'view_bookings' }
    ];
    
    const mainMenuMsg: DynamicChoiceMessage = {
      id: `flight-mainmenu-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'What would you like to do next?',
      options: mainMenuOptions,
      stepId: 'main_menu',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, mainMenuMsg]);
    
    // Reset flight booking state
    resetFlightBooking();
    setCurrentBookingType(null);
    
  } catch (error: any) {
    console.error('❌ Error completing flight booking:', error);
    
    const errorMsg: DefaultMessage = {
      id: `flight-error-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: `❌ **Flight Booking Failed**\n\n${error.response?.data?.message || error.message || 'Unable to complete booking. Please try again or contact support.'}\n\nWould you like to try again?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, errorMsg]);
    
    // Offer retry or main menu options
    const retryOptions = [
      { label: '🔄 Try Again', value: 'retry', nextStep: 'flight_price_summary' },
      { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' }
    ];
    
    const retryMsg: DynamicChoiceMessage = {
      id: `flight-retry-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'What would you like to do?',
      options: retryOptions,
      stepId: 'flight_error_handler',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, retryMsg]);
    
  } finally {
    setIsTyping(false);
  }
}
else if (stepId === 'flight_error_handler') {
  if (choice.value === 'retry') {
    // Retry the booking - show passenger name input again
    const passengerMsg: any = {
      id: `flight-passenger-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_form',
      question: 'Please enter passenger name:',
      field: 'passenger_name',
      stepId: 'flight_passenger_input',
      validation: (value: string) => value.trim().length > 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, passengerMsg]);
  } else {
    // Go to main menu
    const mainMenuOptions = [
      { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' }
    ];
    
    const mainMenuMsg: DynamicChoiceMessage = {
      id: `mainmenu-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'What would you like to do next?',
      options: mainMenuOptions,
      stepId: 'main_menu',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, mainMenuMsg]);
    resetFlightBooking();
    setCurrentBookingType(null);
  }
}
    
 // ==================== HOTEL BOOKING FLOW ====================
else if (stepId === 'hotel_selection' && choice.value.id) {
  setIsTyping(true);
  
  try {
    // Fetch hotel details for the selected hotel
    const payload = {
      name: choice.label,
      travelId: choice.value.categoryId
    };
    
    console.log('Fetching hotel details with payload:', payload);
    const response = await HotelsDetailsAPI(payload);
    console.log('Hotel details response:', response);
    
    // Handle response that might be an array or object
    const hotelData = Array.isArray(response.data) ? response.data[0] : response.data;
    
    if (!hotelData) {
      throw new Error('No hotel data received');
    }
    
    // Convert dates to ISO format if they exist
    const formattedCheckIn = hotelData.checkIn ? formatDateToISO(hotelData.checkIn) : '';
    const formattedCheckOut = hotelData.checkOut ? formatDateToISO(hotelData.checkOut) : '';
    
    // Store the complete hotel data from API response
    setHotelBooking(prev => ({
      ...prev,
      name: hotelData.name || choice.label,
      travelId: hotelData.travelId || choice.value.categoryId,
      city: hotelData.city || '',
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
      brand: hotelData.brand || '',
      stars: hotelData.stars || '',
      price: hotelData.price || 0,
      type: hotelData.type || '',
      quest: hotelData.quest || 0,
      payment: hotelData.payment || ''
    }));
    
    // Show city dropdown (from API response)
    const cityOptions = [
      { label: hotelData.city || 'New York', value: hotelData.city || 'New York', nextStep: 'hotel_checkin_selection' }
    ];
    
    const cityMsg: DynamicChoiceMessage = {
      id: `hotel-city-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'Select hotel city/location:',
      options: cityOptions,
      stepId: 'hotel_city_selection',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, cityMsg]);
    
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    const errorMsg: DefaultMessage = {
      id: `error-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: 'Sorry, unable to fetch hotel details. Please try again.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setIsTyping(false);
  }
}
else if (stepId === 'hotel_city_selection') {
  setHotelBooking(prev => ({ ...prev, city: choice.label }));
  
  // Format check-in date for display
  const formattedCheckIn = hotelBooking.checkIn 
    ? new Date(hotelBooking.checkIn).toLocaleString() 
    : 'Not available';
  
  // Show check-in date dropdown
  const checkInOptions = [
    { label: formattedCheckIn, value: hotelBooking.checkIn, nextStep: 'hotel_checkin_selection' }
  ];
  
  const checkInMsg: DynamicChoiceMessage = {
    id: `hotel-checkin-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Select check-in date and time:',
    options: checkInOptions,
    stepId: 'hotel_checkin_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, checkInMsg]);
}
else if (stepId === 'hotel_checkin_selection') {
  setHotelBooking(prev => ({ ...prev, checkIn: choice.label }));
  checkInDateRef.current = choice.label;
  
  // Format check-out date for display
  const formattedCheckOut = hotelBooking.checkOut 
    ? new Date(hotelBooking.checkOut).toLocaleString() 
    : 'Not available';
  
  // Show check-out date dropdown
  const checkOutOptions = [
    { label: formattedCheckOut, value: hotelBooking.checkOut, nextStep: 'hotel_brand_selection' }
  ];
  
  const checkOutMsg: DynamicChoiceMessage = {
    id: `hotel-checkout-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Select check-out date and time:',
    options: checkOutOptions,
    stepId: 'hotel_checkout_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, checkOutMsg]);
}
else if (stepId === 'hotel_checkout_selection') {
  setHotelBooking(prev => ({ ...prev, checkOut: choice.label }));
  
  // Show brand dropdown
  const brandOptions = [
    { label: hotelBooking.brand || 'Taj Group', value: hotelBooking.brand || 'Taj Group', nextStep: 'hotel_stars_selection' }
  ];
  
  const brandMsg: DynamicChoiceMessage = {
    id: `hotel-brand-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Select hotel brand:',
    options: brandOptions,
    stepId: 'hotel_brand_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, brandMsg]);
}
else if (stepId === 'hotel_brand_selection') {
  setHotelBooking(prev => ({ ...prev, brand: choice.label }));
  
  // Show stars dropdown
  const starOptions = [
    { label: `${hotelBooking.stars} Star`, value: hotelBooking.stars, nextStep: 'hotel_type_selection' }
  ];
  
  const starMsg: DynamicChoiceMessage = {
    id: `hotel-stars-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Select star rating:',
    options: starOptions,
    stepId: 'hotel_stars_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, starMsg]);
}
else if (stepId === 'hotel_stars_selection') {
  setHotelBooking(prev => ({ ...prev, stars: choice.label }));
  
  // Show type dropdown
  const typeOptions = [
    { label: hotelBooking.type || 'Luxury', value: hotelBooking.type || 'Luxury', nextStep: 'hotel_price_summary' }
  ];
  
  const typeMsg: DynamicChoiceMessage = {
    id: `hotel-type-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Select hotel type:',
    options: typeOptions,
    stepId: 'hotel_type_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, typeMsg]);
}
else if (stepId === 'hotel_type_selection') {
  setHotelBooking(prev => ({ ...prev, type: choice.label }));
  
  const formattedCheckIn = hotelBooking.checkIn ? formatDateToISO(hotelBooking.checkIn) : '';
    const formattedCheckOut = hotelBooking.checkOut ? formatDateToISO(hotelBooking.checkOut) : '';
  // Show price summary
  const priceMsg: DefaultMessage = {
    id: `hotel-price-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'default',
    text: `🏨 **Hotel Booking Summary**\n\n` +
          `🏨 Hotel: ${hotelBooking.name}\n` +
          `📍 City: ${hotelBooking.city}\n` +
          `📅 Check-in: ${new Date(formattedCheckIn).toLocaleString()}\n` +
          `📅 Check-out: ${new Date(formattedCheckOut).toLocaleString()}\n` +
          `⭐ Stars: ${hotelBooking.stars}\n` +
          `🏷️ Brand: ${hotelBooking.brand}\n` +
          `🏷️ Type: ${hotelBooking.type}\n` +
          `💰 Total Price: $${hotelBooking.price}\n\n` +
          `Do you want to confirm this booking?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, priceMsg]);
  
  // Add confirmation options
  const confirmOptions = [
    { label: '✅ Yes, confirm booking', value: 'confirm', nextStep: 'hotel_confirm' },
    { label: '❌ No, cancel', value: 'cancel', nextStep: 'hotel_cancel' }
  ];
  
  const confirmMsg: DynamicChoiceMessage = {
    id: `hotel-confirm-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Please confirm:',
    options: confirmOptions,
    stepId: 'hotel_confirmation',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, confirmMsg]);
}
else if (stepId === 'hotel_confirmation') {
  if (choice.value === 'confirm') {
    // Show guest count input
    const guestMsg: any = {
      id: `hotel-guests-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_form',
      question: 'How many guests will be staying?',
      field: 'quest',
      stepId: 'hotel_guest_input',
      validation: (value: string) => {
        const num = parseInt(value);
        return !isNaN(num) && num > 0 && num <= 10;
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, guestMsg]);
  } else {
    // User cancelled
    resetHotelBooking();
    checkInDateRef.current = '';
    setCurrentBookingType(null);
    
    const cancelMsg: DefaultMessage = {
      id: `cancelled-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: 'Booking cancelled. Returning to main menu...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, cancelMsg]);
    
    // Return to main menu
    const welcomeBackMsg: DefaultMessage = {
      id: `welcomeback-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: 'How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, welcomeBackMsg]);
    
    setIsTyping(true);
    try {
      const response = await CategoryListAPI();
      const categories = response.data || [];
      const categoryOptions = categories.map((cat: any) => ({
        label: cat.name,
        value: { name: cat.name, categoryId: cat._id },
        nextStep: cat.name === 'Flight' ? 'flight_selection' : 
                  cat.name === 'Hotel' ? 'hotel_selection' : 
                  cat.name === 'Car' ? 'car_selection' : 'other_service'
      }));
      
      const categoryMessage: DynamicChoiceMessage = {
        id: `categories-${Date.now()}`,
        role: 'assistant',
        chatVariant: 'dynamic_choice',
        question: 'Please select a category:',
        options: categoryOptions,
        stepId: 'category_selection',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, categoryMessage]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsTyping(false);
    }
  }
}
else if (stepId === 'hotel_guest_input') {
  setHotelBooking(prev => ({ ...prev, quest: parseInt(choice.label) }));
  
  // Show payment options
  const paymentOptions = [
    { label: '💳 Credit/Debit Card', value: 'Card', nextStep: 'hotel_payment_method' },
    { label: '📱 UPI', value: 'UPI', nextStep: 'hotel_payment_method' },
    { label: '🏦 Net Banking', value: 'Net Banking', nextStep: 'hotel_payment_method' },
    { label: '💰 Pay at Hotel', value: 'Pay at Hotel', nextStep: 'hotel_payment_method' }
  ];
  
  const paymentMsg: DynamicChoiceMessage = {
    id: `hotel-payment-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Please select payment method:',
    options: paymentOptions,
    stepId: 'hotel_payment_method',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, paymentMsg]);
}
else if (stepId === 'hotel_payment_method') {
  setHotelBooking(prev => ({ ...prev, payment: choice.label }));
  
  setIsTyping(true);
  
  try {
    // Ensure dates are in ISO format before sending
    const checkInISO = hotelBooking.checkIn ? formatDateToISO(hotelBooking.checkIn) : '';
    const checkOutISO = hotelBooking.checkOut ? formatDateToISO(hotelBooking.checkOut) : '';
    
    const payload = {
      name: hotelBooking.name,
      travelId: hotelBooking.travelId,
      city: hotelBooking.city,
      checkIn: checkInISO,
      checkOut: checkOutISO,
      brand: hotelBooking.brand,
      stars: hotelBooking.stars,
      price: hotelBooking.price,
      type: hotelBooking.type,
      quest: hotelBooking.quest,
      payment: choice.label
    };
    
    console.log('🏨 Submitting Hotel Booking payload:', payload);
    const response = await HotelsDetailsAPI(payload);
    console.log('✅ Hotel booking response:', response);
    
    
    // Payment display mapping
    const getPaymentDisplay = (paymentMethod: string): string => {
      const paymentMap: Record<string, string> = {
        'Card': '💳 Credit/Debit Card',
        'UPI': '📱 UPI',
        'Net Banking': '🏦 Net Banking',
        'Pay at Hotel': '💰 Pay at Hotel'
      };
      return paymentMap[paymentMethod] || paymentMethod;
    };
    
    const formattedCheckIn = hotelBooking.checkIn ? formatDateToISO(hotelBooking.checkIn) : '';
    const formattedCheckOut = hotelBooking.checkOut ? formatDateToISO(hotelBooking.checkOut) : '';
  // Show price summary
    const confirmationMsg: DefaultMessage = {
      id: `hotel-confirmation-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: `✅ **Hotel Booking Confirmed!**\n\n` +
            `**Booking Details:**\n` +
            `🏨 Hotel: ${hotelBooking.name}\n` +
            `📍 City: ${hotelBooking.city}\n` +
          `📅 Check-in: ${new Date(formattedCheckIn).toLocaleString()}\n` +
          `📅 Check-out: ${new Date(formattedCheckOut).toLocaleString()}\n` +
            `⭐ Stars: ${hotelBooking.stars}\n` +
            `🏷️ Brand: ${hotelBooking.brand}\n` +
            `🏷️ Type: ${hotelBooking.type}\n` +
            `👥 Guests: ${hotelBooking.quest}\n` +
            `💰 Total Price: $${hotelBooking.price}\n` +
            `💳 Payment: ${getPaymentDisplay(choice.label)}\n\n` +
            `${response.data?.message || response.message || 'Your hotel has been successfully booked.'}\n\n` +
            `Thank you for choosing our service! A confirmation email has been sent to your registered email.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, confirmationMsg]);
    
    const mainMenuOptions = [
      { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' }
    ];
    
    const mainMenuMsg: DynamicChoiceMessage = {
      id: `hotel-mainmenu-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'What would you like to do next?',
      options: mainMenuOptions,
      stepId: 'main_menu',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, mainMenuMsg]);
    
    resetHotelBooking();
    checkInDateRef.current = '';
    setCurrentBookingType(null);
    
  } catch (error: any) {
    console.error('❌ Error completing hotel booking:', error);
    
    const errorMsg: DefaultMessage = {
      id: `hotel-error-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: `❌ **Hotel Booking Failed**\n\n${error.response?.data?.message || error.message || 'Unable to complete booking. Please try again or contact support.'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setIsTyping(false);
  }
}
  
// ==================== CAR BOOKING FLOW ====================
else if (stepId === 'car_selection' && choice.value.id) {
  setIsTyping(true);
  
  try {
    // Fetch car details for the selected car
    const payload = {
      name: choice.label,
      travelId: choice.value.categoryId
    };
    
    console.log('Fetching car details with payload:', payload);
    const response = await CarDetailsAPI(payload);
    console.log('Car details response:', response);
    
    // Handle response that might be an array or object
    const carData = Array.isArray(response.data) ? response.data[0] : response.data;
    console.log(carData,"carData>>>>");
    
    
    if (!carData) {
      throw new Error('No car data received');
    }
    
    // Convert dates to ISO format if they exist
    const formattedPickUpDate = carData.pickUpDate ? formatDateToISO(carData.pickUpDate) : '';
    const formattedReturnDate = carData.returnDate ? formatDateToISO(carData.returnDate) : '';
    console.log(formattedPickUpDate,"formattedPickUpDate>>>");
    
    // Store the complete car data from API response
    setCarBooking(prev => ({
      ...prev,
      name: carData.name || choice.label,
      travelId: carData.travelId || choice.value.categoryId,
      city: carData.city || '',
      pickupLocation: carData.nearByLocation || '',
      dropLocation: carData.nearByLocation || '',
      pickupDate: formattedPickUpDate,
      dropDate: formattedReturnDate,
      carType: carData.name || '',
      price: carData.price || 0,
      payment: carData.payment || ''
    }));
    
    // Show city dropdown (from API response)
    const cityOptions = [
      { label: carData.city || 'Not available', value: carData.city || 'Not available', nextStep: 'car_pickup_location_selection' }
    ];
    
    const cityMsg: DynamicChoiceMessage = {
      id: `car-city-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'Select car pick-up city:',
      options: cityOptions,
      stepId: 'car_city_selection',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, cityMsg]);
    
  } catch (error) {
    console.error('Error fetching car details:', error);
    const errorMsg: DefaultMessage = {
      id: `error-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: 'Sorry, unable to fetch car details. Please try again.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setIsTyping(false);
  }
}
else if (stepId === 'car_city_selection') {
  setCarBooking(prev => ({ ...prev, city: choice.label }));
  
  // Show pickup location dropdown (nearByLocation)
  const pickupOptions = [
    { label: carBooking.pickupLocation || 'Not available', value: carBooking.pickupLocation || 'Not available', nextStep: 'car_drop_location_selection' }
  ];
  
  const pickupMsg: DynamicChoiceMessage = {
    id: `car-pickup-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Select pick-up location:',
    options: pickupOptions,
    stepId: 'car_pickup_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, pickupMsg]);
}
else if (stepId === 'car_pickup_selection') {
  setCarBooking(prev => ({ ...prev, pickupLocation: choice.label }));
  
  // Show drop location dropdown
  const dropOptions = [
    { label: carBooking.dropLocation || 'Not available', value: carBooking.dropLocation || 'Not available', nextStep: 'car_pickup_date_selection' }
  ];
  
  const dropMsg: DynamicChoiceMessage = {
    id: `car-drop-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Select drop-off location:',
    options: dropOptions,
    stepId: 'car_drop_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, dropMsg]);
}
else if (stepId === 'car_drop_selection') {
  setCarBooking(prev => ({ ...prev, dropLocation: choice.label }));
  
  // Format pick-up date for display
  const formattedPickUpDate = carBooking.pickupDate 
    ? new Date(carBooking.pickupDate).toLocaleString() 
    : 'Not available';
  
  // Show pick-up date dropdown
  const pickUpDateOptions = [
    { label: formattedPickUpDate, value: carBooking.pickupDate, nextStep: 'car_drop_date_selection' }
  ];
  
  const pickUpDateMsg: DynamicChoiceMessage = {
    id: `car-pickupdate-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Select pick-up date and time:',
    options: pickUpDateOptions,
    stepId: 'car_pickupdate_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, pickUpDateMsg]);
}
else if (stepId === 'car_pickupdate_selection') {
  setCarBooking(prev => ({ ...prev, pickupDate: choice.label }));
  
  // Format return date for display
  const formattedReturnDate = carBooking.dropDate 
    ? new Date(carBooking.dropDate).toLocaleString() 
    : 'Not available';
  
  // Show return date dropdown
  const returnDateOptions = [
    { label: formattedReturnDate, value: carBooking.dropDate, nextStep: 'car_price_summary' }
  ];
  
  const returnDateMsg: DynamicChoiceMessage = {
    id: `car-returndate-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Select return date and time:',
    options: returnDateOptions,
    stepId: 'car_returndate_selection',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, returnDateMsg]);
}
else if (stepId === 'car_returndate_selection') {
  setCarBooking(prev => ({ ...prev, dropDate: choice.label }));
  
  // Calculate number of days
  let days = 1;
  try {
    if (carBooking.pickupDate && carBooking.dropDate) {
      const pickupDate = new Date(carBooking.pickupDate);
      const dropDate = new Date(carBooking.dropDate);
      if (!isNaN(pickupDate.getTime()) && !isNaN(dropDate.getTime())) {
        const timeDiff = dropDate.getTime() - pickupDate.getTime();
        days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        if (days < 1) days = 1;
      }
    }
  } catch (error) {
    console.error('Error calculating days:', error);
    days = 1;
  }
  
  // Format dates for display using toLocaleString
  const formattedPickUpDate = carBooking.pickupDate 
    ? new Date(carBooking.pickupDate).toLocaleString() 
    : 'Not available';
  const formattedReturnDate = carBooking.dropDate 
    ? new Date(carBooking.dropDate).toLocaleString() 
    : 'Not available';
  
  // Show price summary
  const priceMsg: DefaultMessage = {
    id: `car-price-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'default',
    text: `🚗 **Car Booking Summary**\n\n` +
          `🚗 Car: ${carBooking.name}\n` +
          `📍 City: ${carBooking.city}\n` +
          `📍 Pick-up: ${carBooking.pickupLocation}\n` +
          `📍 Drop-off: ${carBooking.dropLocation}\n` +
          `📅 Pick-up Date: ${carBooking.pickupDate }\n` +
          `📅 Return Date: ${formattedReturnDate}\n` +
          `📆 Days: ${days}\n` +
          `💰 Total Price: $${carBooking.price}\n\n` +
          `Do you want to confirm this booking?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, priceMsg]);
  
  // Add confirmation options
  const confirmOptions = [
    { label: '✅ Yes, confirm booking', value: 'confirm', nextStep: 'car_confirm' },
    { label: '❌ No, cancel', value: 'cancel', nextStep: 'car_cancel' }
  ];
  
  const confirmMsg: DynamicChoiceMessage = {
    id: `car-confirm-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Please confirm:',
    options: confirmOptions,
    stepId: 'car_confirmation',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, confirmMsg]);
}
else if (stepId === 'car_confirmation') {
  if (choice.value === 'confirm') {
    // Show passenger name input
    const passengerMsg: any = {
      id: `car-passenger-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_form',
      question: 'Enter passenger name:',
      field: 'passenger_name',
      stepId: 'car_passenger_input',
      validation: (value: string) => value.trim().length > 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, passengerMsg]);
  } else {
    // User cancelled
    resetCarBooking();
    setCurrentBookingType(null);
    
    const cancelMsg: DefaultMessage = {
      id: `cancelled-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: 'Booking cancelled. Returning to main menu...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, cancelMsg]);
    
    // Return to main menu
    const welcomeBackMsg: DefaultMessage = {
      id: `welcomeback-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: 'How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, welcomeBackMsg]);
    
    setIsTyping(true);
    try {
      const response = await CategoryListAPI();
      const categories = response.data || [];
      const categoryOptions = categories.map((cat: any) => ({
        label: cat.name,
        value: { name: cat.name, categoryId: cat._id },
        nextStep: cat.name === 'Flight' ? 'flight_selection' : 
                  cat.name === 'Hotel' ? 'hotel_selection' : 
                  cat.name === 'Car' ? 'car_selection' : 'other_service'
      }));
      
      const categoryMessage: DynamicChoiceMessage = {
        id: `categories-${Date.now()}`,
        role: 'assistant',
        chatVariant: 'dynamic_choice',
        question: 'Please select a category:',
        options: categoryOptions,
        stepId: 'category_selection',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, categoryMessage]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsTyping(false);
    }
  }
}
else if (stepId === 'car_passenger_input') {
  // Store passenger name
  setCarBooking(prev => ({ ...prev, passenger_name: choice.label }));
  
  // Show payment options
  const paymentOptions = [
    { label: '💳 Credit/Debit Card', value: 'Card', nextStep: 'car_payment_method' },
    { label: '📱 UPI', value: 'UPI', nextStep: 'car_payment_method' },
    { label: '🏦 Net Banking', value: 'Net Banking', nextStep: 'car_payment_method' },
    { label: '💰 Cash', value: 'Cash', nextStep: 'car_payment_method' }
  ];
  
  const paymentMsg: DynamicChoiceMessage = {
    id: `car-payment-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Please select payment method:',
    options: paymentOptions,
    stepId: 'car_payment_method',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, paymentMsg]);
}
else if (stepId === 'car_payment_method') {
  setCarBooking(prev => ({ ...prev, payment: choice.label }));
  
  setIsTyping(true);
  
  try {
    // Ensure dates are in ISO format before sending
    const pickupDateISO = carBooking.pickupDate ? formatDateToISO(carBooking.pickupDate) : '';
    const dropDateISO = carBooking.dropDate ? formatDateToISO(carBooking.dropDate) : '';
    
    const payload = {
      name: carBooking.name,
      travelId: carBooking.travelId,
      city: carBooking.city,
      pickupLocation: carBooking.pickupLocation,
      dropLocation: carBooking.dropLocation,
      pickupDate: pickupDateISO,
      dropDate: dropDateISO,
      carType: carBooking.carType,
      price: carBooking.price,
      payment: choice.label,
      passenger_name: carBooking.passenger_name
    };
    
    console.log('🚗 Submitting Car Booking payload:', payload);
    const response = await CarDetailsAPI(payload);
    console.log('✅ Car booking response:', response);
    
    // Calculate number of days for display
    let days = 1;
    try {
      if (carBooking.pickupDate && carBooking.dropDate) {
        const pickupDate = new Date(carBooking.pickupDate);
        const dropDate = new Date(carBooking.dropDate);
        if (!isNaN(pickupDate.getTime()) && !isNaN(dropDate.getTime())) {
          const timeDiff = dropDate.getTime() - pickupDate.getTime();
          days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          if (days < 1) days = 1;
        }
      }
    } catch (error) {
      console.error('Error calculating days:', error);
      days = 1;
    }
    

    // Payment display mapping
    const getPaymentDisplay = (paymentMethod: string): string => {
      const paymentMap: Record<string, string> = {
        'Card': '💳 Credit/Debit Card',
        'UPI': '📱 UPI',
        'Net Banking': '🏦 Net Banking',
        'Cash': '💰 Cash'
      };
      return paymentMap[paymentMethod] || paymentMethod;
    };
    
    const confirmationMsg: DefaultMessage = {
      id: `car-confirmation-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: `✅ **Car Booking Confirmed!**\n\n` +
            `**Booking Details:**\n` +
            `🚗 Car: ${carBooking.name}\n` +
            `👤 Driver/Passenger: ${carBooking.passenger_name || 'Not specified'}\n` +
            `📍 City: ${carBooking.city}\n` +
            `📍 Pick-up Location: ${carBooking.pickupLocation}\n` +
            `📍 Drop-off Location: ${carBooking.dropLocation}\n` +
            `📅 Pick-up Date: ${carBooking.pickupDate}\n` +
            `📅 Return Date: ${carBooking.dropDate}\n` +
            `📆 Days: ${days}\n` +
            `💰 Total Price: $${carBooking.price}\n` +
            `💳 Payment: ${getPaymentDisplay(choice.label)}\n\n` +
            `${response.data?.message || response.message || 'Your car has been successfully booked.'}\n\n` +
            `Thank you for choosing our service! A confirmation email has been sent to your registered email.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, confirmationMsg]);
    
    const mainMenuOptions = [
      { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' }
    ];
    
    const mainMenuMsg: DynamicChoiceMessage = {
      id: `car-mainmenu-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'What would you like to do next?',
      options: mainMenuOptions,
      stepId: 'main_menu',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, mainMenuMsg]);
    
    resetCarBooking();
    setCurrentBookingType(null);
    
  } catch (error: any) {
    console.error('❌ Error completing car booking:', error);
    
    const errorMsg: DefaultMessage = {
      id: `car-error-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: `❌ **Car Booking Failed**\n\n${error.response?.data?.message || error.message || 'Unable to complete booking. Please try again or contact support.'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setIsTyping(false);
  }
}

// ==================== FAQ / OTHERS FLOW ====================
else if (stepId === 'others_menu') {
  // Remove any existing empty message issue
  if (choice.value === 'faq') {
    // Show FAQ questions
    const faqQuestions = [
      { label: 'What is AR HyperAutomation?', value: 'q1', nextStep: 'faq_answer' },
      { label: 'How does expense tracking work?', value: 'q2', nextStep: 'faq_answer' },
      { label: 'What are the key features?', value: 'q3', nextStep: 'faq_answer' },
      { label: 'How secure is my data?', value: 'q4', nextStep: 'faq_answer' },
      { label: 'Can I integrate with accounting software?', value: 'q5', nextStep: 'faq_answer' },
      { label: 'What support options are available?', value: 'q6', nextStep: 'faq_answer' },
      { label: 'How to generate expense reports?', value: 'q7', nextStep: 'faq_answer' },
      { label: 'What is the pricing structure?', value: 'q8', nextStep: 'faq_answer' },
      { label: 'Can I track multi-currency expenses?', value: 'q9', nextStep: 'faq_answer' },
      { label: 'How to setup approval workflows?', value: 'q10', nextStep: 'faq_answer' }
    ];
    
    const faqMsg: DynamicChoiceMessage = {
      id: `faq-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'Please select a question to learn more:',
      options: faqQuestions,
      stepId: 'faq_selection',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, faqMsg]);
  } else if (choice.value === 'main_menu') {
    // Go to main menu
    const welcomeBackMsg: DefaultMessage = {
      id: `welcomeback-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: 'Welcome back! How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, welcomeBackMsg]);
    
    setIsTyping(true);
    try {
      const response = await CategoryListAPI();
      const categories = response.data || [];
      const categoryOptions = categories.map((cat: any) => ({
        label: cat.name,
        value: { name: cat.name, categoryId: cat._id },
        nextStep: cat.name === 'Flight' ? 'flight_selection' : 
                  cat.name === 'Hotel' ? 'hotel_selection' : 
                  cat.name === 'Car' ? 'car_selection' : 'other_service'
      }));
      
      const categoryMessage: DynamicChoiceMessage = {
        id: `categories-${Date.now()}`,
        role: 'assistant',
        chatVariant: 'dynamic_choice',
        question: 'Please select a category:',
        options: categoryOptions,
        stepId: 'category_selection',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, categoryMessage]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsTyping(false);
    }
  }
}
else if (stepId === 'faq_selection') {
  // Generate answer based on selected question
  let answer = '';
  
  switch (choice.value) {
    case 'q1':
      answer = `**What is AR HyperAutomation?**\n\nAR HyperAutomation is an advanced expense management platform that combines artificial intelligence, robotic process automation, and machine learning to automate the entire expense management lifecycle. It helps organizations streamline expense reporting, approval workflows, reimbursement processes, and financial compliance with minimal manual intervention.`;
      break;
    case 'q2':
      answer = `**How does expense tracking work?**\n\nOur expense tracking system automatically captures receipts via email, SMS, or manual upload. Using OCR technology, it extracts key information like date, amount, vendor, and category. Expenses are then routed through configurable approval workflows, integrated with corporate cards for real-time tracking, and automatically synced with your accounting system.`;
      break;
    case 'q3':
      answer = `**Key Features of AR HyperAutomation:**\n\n• AI-powered receipt scanning and data extraction\n• Real-time expense tracking and categorization\n• Customizable approval workflows\n• Corporate card integration\n• Automated policy compliance checks\n• Multi-currency support\n• GST/tax calculation and reporting\n• Mobile app for on-the-go reporting\n• Advanced analytics and dashboards\n• Seamless accounting software integration`;
      break;
    case 'q4':
      answer = `**Data Security**\n\nAR HyperAutomation takes security seriously. We employ:\n\n• Bank-grade 256-bit encryption for all data\n• SOC 2 Type II certified data centers\n• Regular security audits and penetration testing\n• Role-based access controls\n• Two-factor authentication\n• GDPR and compliance ready\n• Automated backups and disaster recovery\n\nYour financial data is always protected with enterprise-grade security measures.`;
      break;
    case 'q5':
      answer = `**Integrations**\n\nYes, AR HyperAutomation integrates seamlessly with:\n\n• QuickBooks Online & Desktop\n• Xero\n• SAP Concur\n• Oracle NetSuite\n• Microsoft Dynamics\n• Zoho Books\n• Tally\n• And 50+ other accounting platforms via our API\n\nOur open API allows custom integrations with any third-party system.`;
      break;
    case 'q6':
      answer = `**Support Options**\n\nWe offer multiple support channels:\n\n• 24/7 Email Support: support@arhyperautomation.com\n• Live Chat: Available during business hours\n• Phone Support: Dedicated account managers for enterprise plans\n• Knowledge Base: Comprehensive documentation and video tutorials\n• Community Forum: Connect with other users\n• Onboarding: Free training sessions for new customers\n\nResponse times: Priority support within 2 hours, Standard within 24 hours.`;
      break;
    case 'q7':
      answer = `**Generating Expense Reports**\n\nTo generate expense reports:\n\n1. Log into your AR HyperAutomation dashboard\n2. Navigate to "Reports" section\n3. Select date range and filters (by department, project, category, etc.)\n4. Choose report format (PDF, Excel, CSV)\n5. Click "Generate Report"\n\nYou can also schedule automated weekly/monthly reports, set up custom report templates, and share reports with stakeholders directly from the platform.`;
      break;
    case 'q8':
      answer = `**Pricing Structure**\n\nAR HyperAutomation offers flexible pricing plans:\n\n• **Starter**: $29/month - Up to 50 expenses/month, basic features\n• **Professional**: $99/month - Up to 500 expenses/month, advanced features, API access\n• **Business**: $299/month - Up to 2000 expenses/month, priority support, custom workflows\n• **Enterprise**: Custom pricing - Unlimited expenses, dedicated support, on-premise deployment\n\nAll plans include a 14-day free trial. Annual billing offers 20% discount.`;
      break;
    case 'q9':
      answer = `**Multi-Currency Support**\n\nYes, AR HyperAutomation fully supports multi-currency expense tracking:\n\n• Track expenses in 160+ currencies\n• Automatic real-time exchange rate updates\n• Support for international travel expenses\n• Multi-currency approval workflows\n• Consolidated reporting in your base currency\n• Integration with corporate cards for foreign transactions\n• Configurable exchange rate sources (RBI, ECB, OANDA, etc.)\n\nPerfect for global teams and frequent international travelers.`;
      break;
    case 'q10':
      answer = `**Setting Up Approval Workflows**\n\nTo setup approval workflows:\n\n1. Go to Settings → Approval Workflows\n2. Click "Create New Workflow"\n3. Define triggers (expense amount, category, department, etc.)\n4. Add approval levels (Manager → Finance → Admin)\n5. Set time limits for each approval level\n6. Configure escalation rules for delayed approvals\n7. Save and activate the workflow\n\nYou can create multiple workflows for different scenarios like travel expenses, project expenses, or department-specific rules.`;
      break;
    default:
      answer = `Thank you for your question. Please visit our help center or contact support for more detailed information.`;
  }
  
  const answerMsg: DefaultMessage = {
    id: `faq-answer-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'default',
    text: answer,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, answerMsg]);
  
  // Show follow-up options
  const followUpOptions = [
    { label: '❓ More Questions', value: 'more_faq', nextStep: 'faq_followup' },
    { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' }
  ];
  
  const followUpMsg: DynamicChoiceMessage = {
    id: `faq-followup-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'dynamic_choice',
    question: 'Would you like to ask another question or return to main menu?',
    options: followUpOptions,
    stepId: 'faq_followup',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  setMessages((prev) => [...prev, followUpMsg]);
}
else if (stepId === 'faq_followup') {
  if (choice.value === 'more_faq') {
    // Show FAQ questions again
    const faqQuestions = [
      { label: 'What is AR HyperAutomation?', value: 'q1', nextStep: 'faq_answer' },
      { label: 'How does expense tracking work?', value: 'q2', nextStep: 'faq_answer' },
      { label: 'What are the key features?', value: 'q3', nextStep: 'faq_answer' },
      { label: 'How secure is my data?', value: 'q4', nextStep: 'faq_answer' },
      { label: 'Can I integrate with accounting software?', value: 'q5', nextStep: 'faq_answer' },
      { label: 'What support options are available?', value: 'q6', nextStep: 'faq_answer' },
      { label: 'How to generate expense reports?', value: 'q7', nextStep: 'faq_answer' },
      { label: 'What is the pricing structure?', value: 'q8', nextStep: 'faq_answer' },
      { label: 'Can I track multi-currency expenses?', value: 'q9', nextStep: 'faq_answer' },
      { label: 'How to setup approval workflows?', value: 'q10', nextStep: 'faq_answer' }
    ];
    
    const faqMsg: DynamicChoiceMessage = {
      id: `faq-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'Please select a question to learn more:',
      options: faqQuestions,
      stepId: 'faq_selection',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, faqMsg]);
  } else {
    // Go to main menu
    const welcomeBackMsg: DefaultMessage = {
      id: `welcomeback-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: 'Welcome back! How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, welcomeBackMsg]);
    
    setIsTyping(true);
    try {
      const response = await CategoryListAPI();
      const categories = response.data || [];
      const categoryOptions = categories.map((cat: any) => ({
        label: cat.name,
        value: { name: cat.name, categoryId: cat._id },
        nextStep: cat.name === 'Flight' ? 'flight_selection' : 
                  cat.name === 'Hotel' ? 'hotel_selection' : 
                  cat.name === 'Car' ? 'car_selection' : 'other_service'
      }));
      
      const categoryMessage: DynamicChoiceMessage = {
        id: `categories-${Date.now()}`,
        role: 'assistant',
        chatVariant: 'dynamic_choice',
        question: 'Please select a category:',
        options: categoryOptions,
        stepId: 'category_selection',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, categoryMessage]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsTyping(false);
    }
  }
}
// ==================== POST CHAT MENU HANDLER ====================
else if (stepId === 'post_chat_menu') {
   if (choice.value === 'others') {
    // Show FAQ/Others menu
    const othersOptions = [
      { label: '❓ Frequently Asked Questions', value: 'faq', nextStep: 'faq_menu' },
      { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' }
    ];
    
    const othersMsg: DynamicChoiceMessage = {
      id: `others-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'How can we help you?',
      options: othersOptions,
      stepId: 'others_menu',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, othersMsg]);
  }
  else if (choice.value === 'main_menu') {
    // Go to main menu
    const welcomeBackMsg: DefaultMessage = {
      id: `welcomeback-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'default',
      text: 'Welcome back! How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, welcomeBackMsg]);
    
    setIsTyping(true);
    try {
      const response = await CategoryListAPI();
      const categories = response.data || [];
      const categoryOptions = categories.map((cat: any) => ({
        label: cat.name,
        value: { name: cat.name, categoryId: cat._id },
        nextStep: cat.name === 'Flight' ? 'flight_selection' : 
                  cat.name === 'Hotel' ? 'hotel_selection' : 
                  cat.name === 'Car' ? 'car_selection' : 'other_service'
      }));
      
      const categoryMessage: DynamicChoiceMessage = {
        id: `categories-${Date.now()}`,
        role: 'assistant',
        chatVariant: 'dynamic_choice',
        question: 'Please select a category:',
        options: categoryOptions,
        stepId: 'category_selection',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, categoryMessage]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsTyping(false);
    }
  }
}
   // Handle Main Menu selection
else if (stepId === 'main_menu') {
  const welcomeBackMsg: DefaultMessage = {
    id: `welcomeback-${Date.now()}`,
    role: 'assistant',
    chatVariant: 'default',
    text: 'Welcome back! How can I help you today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  
  setIsTyping(true);
  try {
    const response = await CategoryListAPI();
    const categories = response.data || [
      { name: 'Flight', _id: 'flight_fallback' },
      { name: 'Hotel', _id: 'hotel_fallback' },
      { name: 'Car', _id: 'car_fallback' },
      { name: 'Others', _id: 'others_fallback' }
    ];
    
    // Fix: Create category options with the correct value object structure
    const categoryOptions = categories.map((cat: any) => ({
      label: cat.name,
      value: { 
        name: cat.name, 
        categoryId: cat._id  // Store the category _id
      },
      nextStep: cat.name === 'Flight' ? 'flight_selection' : 
                cat.name === 'Hotel' ? 'hotel_selection' : 
                cat.name === 'Car' ? 'car_selection' : 'other_service'
    }));
    
    const categoryMessage: DynamicChoiceMessage = {
      id: `categories-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'Please select a category:',
      options: categoryOptions,
      stepId: 'category_selection',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages((prev) => [...prev, welcomeBackMsg, categoryMessage]);
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback categories with correct structure
    const fallbackOptions = [
      { label: 'Flight', value: { name: 'Flight', categoryId: 'flight_fallback' }, nextStep: 'flight_selection' },
      { label: 'Hotel', value: { name: 'Hotel', categoryId: 'hotel_fallback' }, nextStep: 'hotel_selection' },
      { label: 'Car', value: { name: 'Car', categoryId: 'car_fallback' }, nextStep: 'car_selection' },
      { label: 'Others', value: { name: 'Others', categoryId: 'others_fallback' }, nextStep: 'other_service' }
    ];
    
    const categoryMessage: DynamicChoiceMessage = {
      id: `categories-${Date.now()}`,
      role: 'assistant',
      chatVariant: 'dynamic_choice',
      question: 'Please select a category:',
      options: fallbackOptions,
      stepId: 'category_selection',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages((prev) => [...prev, welcomeBackMsg, categoryMessage]);
  } finally {
    setIsTyping(false);
  }
}
  }, [flightBooking, hotelBooking, carBooking])


 const handleSend = useCallback(async (text: string) => {
  const time = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const userMsg: DefaultMessage = {
    id: `u-${Date.now()}`,
    role: 'user',
    chatVariant: 'default',
    text,
    timestamp: time,
  }

  setMessages((prev) => [...prev, userMsg])

  // 🔥 SHOW TYPING
  setIsTyping(true)
  
  try {
    const payload = {
      message: text,
    }
    
    const response = await ChatAPI(payload)
    console.log(response, "response>>>")
    
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          chatVariant: 'default',
          text: response.data,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ])
      
      // After showing the response, add main menu options
      setTimeout(() => {
        const mainMenuOptions = [
          { label: '❓ FAQ / Others', value: 'others', nextStep: 'others_menu' },
          { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' }
        ];
        
        const mainMenuMsg: DynamicChoiceMessage = {
          id: `main-menu-${Date.now()}`,
          role: 'assistant',
          chatVariant: 'dynamic_choice',
          question: 'What would you like to do next?',
          options: mainMenuOptions,
          stepId: 'post_chat_menu',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, mainMenuMsg]);
      }, 500);
      
    }, 1200)
  } catch (error) {
    console.error('Chat API error:', error)
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        chatVariant: 'default',
        text: '⚠️ Failed to connect to server',
        timestamp: time,
      },
    ])
    // Still show main menu even on error
    setTimeout(() => {
      const mainMenuOptions = [
        { label: '✈️ Book Flight', value: 'flight', nextStep: 'flight_booking' },
        { label: '🏨 Book Hotel', value: 'hotel', nextStep: 'hotel_booking' },
        { label: '🚗 Book Car', value: 'car', nextStep: 'car_booking' },
        { label: '❓ FAQ / Others', value: 'others', nextStep: 'others_menu' },
        { label: '🏠 Main Menu', value: 'main_menu', nextStep: 'category_selection' }
      ];
      
      const mainMenuMsg: DynamicChoiceMessage = {
        id: `main-menu-${Date.now()}`,
        role: 'assistant',
        chatVariant: 'dynamic_choice',
        question: 'What would you like to do next?',
        options: mainMenuOptions,
        stepId: 'post_chat_menu',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, mainMenuMsg]);
    }, 500);
  } finally {
    // Don't set isTyping false here as it's handled in setTimeout
  }
}, [messages]);

  return (
    <Box className="flex min-h-screen w-full max-w-full flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar
        config={navbarConfig}
        onMenuClick={handleDrawerToggle}
        sidebarOpen={sidebarOpen}
      />

      <Toolbar />

      <Box className="flex min-h-0 min-w-0 flex-1 w-full">
        <Sidebar
          items={sidebarItems}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={() => setSidebarOpen(false)}
        />

        <Box
          component="main"
          className="flex-1 min-h-0 min-w-0 overflow-auto px-4 py-4 sm:px-6 sm:py-6"
          id="main-content"
        >
          <Outlet />
        </Box>
      </Box>

      <ChatButton onClick={handleChatOpen} />
      
      <ChatWindow
        open={chatOpen}
        onClose={() => {
          setChatOpen(false)
          setMessages([])
        }}
        title="Chatbot"
        messages={messages}
        onSend={handleSend}
        onChoiceSelect={handleChoiceSelect}
        onDynamicChoice={handleDynamicChoice}
        isTyping={isTyping}
      />
    </Box>
  )
}

export default Layout