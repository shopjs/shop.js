import {
  ContactForm,
  PaymentForm,
} from './components/index'

export * from './components/index'

if (typeof window !== 'undefined') {
  (window as any).ContactForm = ContactForm
  // (window as any).PaymentForm = PaymentForm
}
