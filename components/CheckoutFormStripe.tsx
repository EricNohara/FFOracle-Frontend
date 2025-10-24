//This form will display all prompts and input options for when a user makes a 
// card payment with stripe.

'use client';   //indicates that this is client-side, not server-side

//Import the stripe components:
// - CardElement: shows a card data input field
// - useStripe: allows creation of a Stripe object with an interface for calling stripe
//  functions
// - useElements: gives access to Stripe Elements to build the UI
//Import useState to store state data; mainly the transaction status
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';

//export keyword allows this to be used in other scripts within the app
//default keyword makes this the primary functionality of this file; when importing 
// this file, this entity will automatically be provided and can be renamed at import.
export default function CheckoutForm() {
  //get backend URL from the env file
    const backendUrl = process.env.NEXT_PUBLIC_API_URL!;

    const stripe = useStripe(); //has an interface to access stripe methods
    const elements = useElements(); //can be used to reference stripe elements in UI
    
    //loading is a state to represent payment processing. True when payment is
    // mid-processing. setloading is a method to update it.
    const [loading, setLoading] = useState(false);
    //message is a state for the payment status message
    //setMessage is a method to uodate message
    const [message, setMessage] = useState<string | null>(null);

    //a lambda for a method to handle client-side events when the form is submitted.
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); //By default, submitting a form reloads the page. Disable this.
      setLoading(true); //Set the loading state to true since the processing has begun.
      setMessage(null); //clear the status message.

      //Call the backend to initiate creating a payment intent for this payment.
      //Reference the base URL in the env file.
      const res = await fetch(`${backendUrl}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        //populate the JSON with lines to match the expected input format for the
        // function that makes payment intents. That is, provide the price in cents USD
        // with the label "amount".
        body: JSON.stringify({ amount: 1000 }) 
      });

      //The request to the backend should provide a client secret to identify the payment
      // in question. Wait on a response and store it here.
      const { clientSecret } = await res.json();

      //Now that a payment intent has been created in the Stripe servers, read the client's
      // payment info and attempt to complete the payment.

      //Pull entered info from the existing card element.
      const card = elements?.getElement(CardElement);
      //If the stripe object and the card element do not exist yet, stop immediately.
      // A payment cannot occur if the stripe components have not loaded in.
      if (!stripe || !card) {
        setMessage('Stripe has not loaded yet.');
        setLoading(false);
        return;
      }

      //Send the card data with the client secret DIRECTLY to Stripe (no need to go
      // through the backend) to verify the payment.
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      });

      //Now the payment data has been read and sent to stripe. The form needs to wait
      // for stripe to respond and act based on that response.

      //Display a failure or success message depending on if the payment went through or
      // experienced an error on stripe's end.
      if (result.error) {
        setMessage(result.error.message ?? 'Payment failed.');
      } else if (result.paymentIntent?.status === 'succeeded') {
        setMessage('Payment succeeded!');
      }
      //Once the payment has completed (successfully or not), set the loading state to false.
      setLoading(false);
    };

  //This section is for ectually building the UI for the form.
  return (
    //Set the handleSubmit lambda to run when the form is submitted.
    //Create a card element for the user to enter card data into.
    //Create a button to submit the form, but disable it when the loading state is true
    // or when the stripe object is not yet assigned (since no payment can occur if
    // the form is not yet able to connect to stripe).
    //Set the button label to change depending on the loading state.
    //Display the status message.
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Test Payment</h2>
      <CardElement className="p-2 border rounded mb-4" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay $10'}
      </button>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </form>
  );
}