"use client";
import { useAccountContext } from "@/providers/Account";
import Button from "./Button";
import { LuCopy } from "react-icons/lu";
import { toast } from "react-toastify";
import { useState } from "react";

export default function Account() {
  const { accountId, createAccount, importAccount, accountLoading, balance } =
    useAccountContext();

  const [seedPhrase, setSeedPhrase] = useState<string>();

  async function handleCreateAccount() {
    const seedPhrase = await createAccount();
    setSeedPhrase(seedPhrase);
  }

  function formatAddress(v: string) {
    return `${v.slice(0, 6)}...${v.slice(-4)}`;
  }

  function DescriptionItem({
    label,
    className,
    children,
  }: {
    label: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div className={className}>
        <div className="mb-1 text-gray-400">{label}</div>
        <div>{children}</div>
      </div>
    );
  }

  function Copy({
    text,
    children,
  }: {
    text: string;
    children?: React.ReactNode;
  }) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex-1">{children}</span>
        <LuCopy
          onClick={() => {
            navigator.clipboard.writeText(text);
            toast.success("Copied!");
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="text-xs">
        {!accountLoading &&
          (accountId ? (
            <>
              <div className="p-2 border-b border-gray-500 flex flex-col gap-2 sticky top-0">
                {seedPhrase && (
                  <DescriptionItem label="Seed Phrase">
                    <Copy text={seedPhrase}>{seedPhrase}</Copy>
                  </DescriptionItem>
                )}
                <div className="flex items-center justify-between">
                  <DescriptionItem label="Account address">
                    <Copy text={accountId}>{formatAddress(accountId)}</Copy>
                  </DescriptionItem>
                  <DescriptionItem label="NEAR Balance">
                    {balance}
                  </DescriptionItem>
                </div>
                {Number(balance || 0) <= 1 && (
                  <div className="text-red-500">
                    Insufficient balance，Keep at least 1 NEAR in your account
                  </div>
                )}
              </div>
           
            </>
          ) : (
            <div className="flex flex-col justify-center items-center gap-3 text-base absolute left-0 right-0 top-0 bottom-0">
              <Button onClick={handleCreateAccount}>Create Account</Button>
              or
              <Button onClick={importAccount}>Import Account</Button>
            </div>
          ))}
      </div>
    </>
  );
}
