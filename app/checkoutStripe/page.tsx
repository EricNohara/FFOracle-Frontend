'use client';   //indicates that this is client-side and will be using browser APIs

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
//Import the checkout form written in components/CheckoutForm.tsx
import CheckoutForm from '../../components/CheckoutFormStripe';

// Initialize stripe with the PUBLIC key in the end file
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

//a function to render a checkout page in which to submit a payment
export default function CheckoutPage() {
  return (
    //Stripe components can only actually be used within the <Elements> tag provided by stripe.
    // As such, in order to display the checkout form it needs to be wrapped in
    // <Elements>.
    //Make sure to pass the stripe connection in as well.
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
