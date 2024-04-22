import { accountServices } from "@/services/account";
import { useEffect, useRef, useState } from "react";
import { useDebouncedEffect, useRequest } from "@/hooks/useHooks";
import { useMessageBoxContext } from "@/providers/MessageBoxProvider";
import Input from "@/components/Input";

export default function useAccount() {
  const [accountId, setAccountId] = useState<string>();

  const [accountConnection, setAccountConnection] = useState<any>();

  const [loading, setLoading] = useState(true);

  const { data: balance, run: refreshBalance } = useRequest(
    async () => {
      const { available } = await accountServices.getNearBalance();
      return available;
    },
    {
      refreshDeps: [accountId],
      before: () => !!accountId,
      pollingInterval: 10000,
    }
  );

  useDebouncedEffect(
    () => {
      setLoading(true);
      const accountId = accountServices.getActiveAccountId();
      console.log("accountId", accountId);
      if (accountId) {
        setAccountId(accountId);
        connectAccount(accountId).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    },
    [],
    500
  );

  async function createAccount() {
    const { seedPhrase, accountId } = accountServices.createAccount();
    console.log(seedPhrase);
    await connectAccount(accountId);
    setAccountId(accountId);
    return seedPhrase;
  }

  const { confirm } = useMessageBoxContext();
  const seedPhrase = useRef<string>();
  async function importAccount() {
    await confirm(
      <>
        <Input
          type="text"
          className="w-full"
          onChange={(e) => (seedPhrase.current = e.target.value)}
        />
      </>,
      "Enter your seed phrase"
    );
    if (!seedPhrase.current) {
      return;
    }
    const { accountId } = await accountServices.importAccountBySeedPhrase(
      seedPhrase.current
    );
    await connectAccount(accountId);
    setAccountId(accountId);
  }

  async function connectAccount(accountId: string) {
    const account = await accountServices.connectAccount(accountId);
    setAccountConnection(account);
  }

  return {
    accountLoading: loading,
    accountId,
    accountConnection,
    createAccount,
    importAccount,
    connectAccount,
    refreshBalance,
    balance,
  };
}
