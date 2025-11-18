"use client";

import { useState } from "react";
import styled from "styled-components";
import TextInput from "@/app/components/TextInput";
import ToggleSwitch from "@/app/components/ToggleSwitch";
import { PrimaryColorButton, SecondaryColorButton } from "@/app/components/Buttons";
import Overlay from "@/app/components/Overlay";
import PurchaseTab from "./PurchaseTab";

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

interface IGeneralTabProps {
  email: string;
  phoneNumber: string;
  fullname: string;
  allowEmails: boolean;
  onEmailChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onFullnameChange: (value: string) => void;
  onAllowEmailsChange: (value: boolean) => void;
}

export default function GeneralTab({
  email,
  phoneNumber,
  fullname,
  allowEmails,
  onEmailChange,
  onPhoneNumberChange,
  onFullnameChange,
  onAllowEmailsChange,
}: IGeneralTabProps) {
  const [openPurchase, setOpenPurchase] = useState(false);
  const [purchaseKey, setPurchaseKey] = useState(0); // To reset purchase tab

  const handlePurchase = (packageId: string) => {
    // TODO: Implement actual purchase logic
    console.log("Purchasing package:", packageId);
    alert(`Purchase initiated for package: ${packageId}`);
    setOpenPurchase(false);
  };

  const handleClosePurchase = () => {
    setOpenPurchase(false);
    setTimeout(() => {
      setPurchaseKey(prev => prev + 1);
    }, 300); // Small delay for smooth transition
  };

  const handleReset = () => {
    console.log("Payment process reset");
  };

  const handleChangePassword = () => {
    // TODO: Implement change password logic
    console.log("Change password clicked");
    alert("Change password functionality coming soon!");
  };

  return (
    <>
      <TabContent>
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={email}
          placeholder="dev@gmail.com"
          onChange={(e) => onEmailChange(e.target.value)}
        />

      <TextInput
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        value={phoneNumber}
        placeholder="636-337-4833"
        onChange={(e) => onPhoneNumberChange(e.target.value)}
      />

      <TextInput
        label="Full Name"
        name="fullname"
        value={fullname}
        placeholder="John Doe"
        onChange={(e) => onFullnameChange(e.target.value)}
      />

      <TextInput 
       label = "Tokens Left"
       name = "tokensLeft"
       value = "0"
       placeholder = "0"
       onChange = {() => {}}
       compact = {true}
       disabled = {true}
      />

      <ToggleSwitch
        label="Allow Auto-generated Articles"
        checked={allowEmails}
        onChange={onAllowEmailsChange}
      />

      <ButtonContainer>
        <PrimaryColorButton onClick={() => setOpenPurchase(true)}>
          Purchase Tokens
        </PrimaryColorButton>
        <SecondaryColorButton onClick={handleChangePassword}>
          Change Password
        </SecondaryColorButton>
      </ButtonContainer>
    </TabContent>

    <Overlay isOpen={openPurchase} onClose={handleClosePurchase}>
      <PurchaseTab key = {purchaseKey}/>
    </Overlay>
    </>
  );
}
