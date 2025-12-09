"use client";

import { useState } from "react";
import {
  useStripe,
  useElements,
  CardElement
} from '@stripe/react-stripe-js'
import styled from 'styled-components';
import { headerFont } from "@/app/localFont";
import { PrimaryColorButton } from "@/app/components/Buttons";
import { authFetch } from "@/lib/supabase/authFetch";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const CheckoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: var(--color-txt-3);
  font-size: 1rem;
  margin: 0 0 2rem 0;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1rem;
`;

const CardElementContainer = styled.div`
  background-color: var(--color-base-dark-2);
  border: 2px solid var(--color-base-dark-3);
  border-radius: var(--global-border-radius);
  padding: 1.5rem;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
  }

  &:focus-within {
    border-color: var(--color-primary);
  }
`;

const Message = styled.div<{ $isError?: boolean }>`
  padding: 1rem;
  border-radius: var(--global-border-radius);
  background-color: ${({ $isError }) =>
    $isError ? 'rgba(207, 83, 83, 0.1)' : 'rgba(42, 183, 79, 0.1)'};
  border: 2px solid ${({ $isError }) =>
    $isError ? 'var(--color-red)' : 'var(--color-green)'};
  color: ${({ $isError }) =>
    $isError ? 'var(--color-red)' : 'var(--color-green)'};
  text-align: center;
  font-weight: 500;
`;

const Spinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const PackageSummary = styled.div`
  background-color: var(--color-base-dark-2);
  border: 2px solid var(--color-base-dark-3);
  border-radius: var(--global-border-radius);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-txt-secondary);
  font-size: 1rem;

  &:last-child {
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-base-dark-3);
    font-weight: bold;
    font-size: 1.25rem;
  }
`;

const SummaryLabel = styled.span`
  color: var(--color-txt-3);
`;

const SummaryValue = styled.span`
  color: white;
  font-weight: 500;
`;

interface PackageData {
  id: string;
  name: string;
  tokens: number;
  price: number;
}

interface CheckoutFormProps {
  packageData: PackageData;
  onBack: () => void;
}

export default function CheckoutForm({ packageData, onBack }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/Stripe/create-payment-intent`, {
        method: 'POST',
        body: JSON.stringify({
          packageId: packageData.id,
          amount: Math.round(packageData.price * 100),
          tokens: packageData.tokens,
          packageName: packageData.name,
        }),
      });

      const { clientSecret } = await res.json();

      //Pull entered info from the existing card element.
      const card = elements?.getElement(CardElement);
      //If the stripe object and the card element do not exist yet, stop immediately.
      // A payment cannot occur if the stripe components have not loaded in.
      if (!stripe || !card) {
        setMessage('Stripe has not loaded yet.');
        setIsError(true);
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
        setIsError(true);
      } else if (result.paymentIntent?.status === 'succeeded') {
        setMessage('Payment succeeded! Your tokens will be added shortly.');
        setIsError(false);
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
      setIsError(true);
      console.error(error);
    }
    //Once the payment has completed (successfully or not), set the loading state to false.
    setLoading(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#9b9b9b',
        },
        iconColor: '#c75000',
      },
      invalid: {
        color: '#cf5353',
        iconColor: '#cf5353',
      },
    },
  };

  return (
    <CheckoutContainer>
      <div>
        <Title className={headerFont.className}>Complete Your Purchase</Title>
        <Description>
          Review your order and enter your payment details below
        </Description>
      </div>

      <PackageSummary>
        <SummaryRow>
          <SummaryLabel>Package:</SummaryLabel>
          <SummaryValue>{packageData.name}</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>Tokens:</SummaryLabel>
          <SummaryValue>{packageData.tokens} Tokens</SummaryValue>
        </SummaryRow>
        <SummaryRow>
          <SummaryLabel>Total:</SummaryLabel>
          <SummaryValue>${packageData.price}</SummaryValue>
        </SummaryRow>
      </PackageSummary>

      <FormContainer id="payment-form" onSubmit={handleSubmit}>
        <CardElementContainer>
          <CardElement id="card-element" options={cardElementOptions} />
        </CardElementContainer>

        {message && <Message $isError={isError}>{message}</Message>}

        <ButtonContainer>
          <PrimaryColorButton
            type="button"
            onClick={onBack}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Back
          </PrimaryColorButton>
          <PrimaryColorButton
            type="submit"
            disabled={loading || !stripe || !elements}
            style={{ flex: 2 }}
          >
            {loading ? <Spinner /> : `Pay $${packageData.price}`}
          </PrimaryColorButton>
        </ButtonContainer>
      </FormContainer>
    </CheckoutContainer>
  )
}
