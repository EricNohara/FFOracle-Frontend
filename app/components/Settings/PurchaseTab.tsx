"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { headerFont } from "@/app/localFont";
import { PrimaryColorButton } from "@/app/components/Buttons";
import CheckoutWrapper from "../Payment/CheckOutWrapper";

const PurchaseContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: 100%;
  overflow-y: auto;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: var(--color-primary);
  margin: 0;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: var(--color-txt-3);
  font-size: 1rem;
  margin: 0;
  margin-bottom: 1rem;
`;

const TokenPackagesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const TokenPackage = styled.div<{ $isSelected: boolean }>`
  background-color: var(--color-base-dark-2);
  border: 2px solid ${({ $isSelected }) => 
    $isSelected ? "var(--color-primary)" : "var(--color-base-dark-3)"};
  border-radius: var(--global-border-radius);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: border-color 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
  cursor: pointer;
  position: relative;

  ${({ $isSelected }) => $isSelected && `
    background-color: rgba(var(--color-primary-rgb), 0.1);
  `}

  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-4px);
  }

  &::after {
    content: ${({ $isSelected }) => $isSelected ? '"✓"' : '""'};
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    color: var(--color-primary);
    font-weight: bold;
  }
`;

const PackageName = styled.h3`
  font-size: 1.5rem;
  color: white;
  margin: 0;
`;

const TokenIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
  
  img {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }
`;

const TokenAmount = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-primary);
  margin: 0.5rem 0;
`;

const Price = styled.div`
  font-size: 1.25rem;
  color: var(--color-txt-3);
  margin-bottom: 1rem;
`;

const PackageDescription = styled.p`
  font-size: 0.9rem;
  color: var(--color-txt-3);
  margin: 0;
  flex-grow: 1;
`;

const ConfirmButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem 0;
  margin-top: auto;
  border-top: 2px solid var(--color-base-dark-3);
`;

interface IPurchaseTabProps {
  onSelectPackage?: (packageData: {
    id: string;
    name: string;
    tokens: number;
    price: number;
  }) => void;
  onClose?: () => void;
}

export const tokenPackages = [
  {
    id: "starter",
    name: "Starter Pack",
    tokens: 100,
    price: 9.99,
    description: "Perfect for getting started with AI-powered fantasy advice"
  },
  {
    id: "pro",
    name: "Pro Pack",
    tokens: 500,
    price: 39.99,
    description: "Great for serious fantasy players who want consistent advice"
  },
  {
    id: "elite",
    name: "Elite Pack",
    tokens: 1000,
    price: 69.99,
    description: "Best value! For dedicated fantasy football enthusiasts"
  }
];

export default function PurchaseTab({ onSelectPackage }: IPurchaseTabProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleConfirmPurchase = () => {
    if (selectedPackage) {
      const selectedPkg = tokenPackages.find(pkg => pkg.id === selectedPackage);
      if (selectedPkg && onSelectPackage) {
        onSelectPackage(selectedPkg);
      }
      setShowCheckout(true);
    }
  };

  const handleCancelPurchase = () => {
    setShowCheckout(false);
    setSelectedPackage(null);
  }

  const selectedPkg = tokenPackages.find(pkg => pkg.id === selectedPackage);

  if (showCheckout && selectedPkg) {
    return (
      <PurchaseContainer>
        <CheckoutWrapper 
          packageData={selectedPkg}
          onBack={handleCancelPurchase}
        />
      </PurchaseContainer>
    );
  }

  return (
    <PurchaseContainer>
      <div>
        <Title className={headerFont.className}>Purchase Tokens</Title>
        <Description>
          Tokens are used to generate AI-powered fantasy football advice and insights. 
          Choose a package that fits your needs.
        </Description>
      </div>

      <TokenPackagesContainer>
        {tokenPackages.map((pkg) => (
          <TokenPackage 
            key={pkg.id} 
            $isSelected={selectedPackage === pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
          >
            <PackageName className={headerFont.className}>{pkg.name}</PackageName>
            <TokenIcon>
              <img src="images/token-icon.png" alt="Token Icon" />
            </TokenIcon>
            <TokenAmount className={headerFont.className}>
              {pkg.tokens} Tokens
            </TokenAmount>
            <Price className={headerFont.className}>${pkg.price}</Price>
            <PackageDescription>{pkg.description}</PackageDescription>
          </TokenPackage>
        ))}
      </TokenPackagesContainer>

      <ConfirmButtonContainer>
        <PrimaryColorButton 
          onClick={handleConfirmPurchase}
          disabled={!selectedPackage}
        >
          {selectedPackage 
            ? `Confirm Purchase - $${selectedPkg?.price}` 
            : "Select a Package"}
        </PrimaryColorButton>
      </ConfirmButtonContainer>
    </PurchaseContainer>
  );
}
