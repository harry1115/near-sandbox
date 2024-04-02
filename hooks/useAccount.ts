import { accountServices } from "@/services/account";
import { useEffect, useState } from "react";
import { useDebouncedEffect, useRequest } from "@/hooks/useHooks";

export default function useAccount() {
    const [accountId, setAccountId] = useState<string>()

    const [accountConnection, setAccountConnection] = useState<any>()

    const [loading, setLoading] = useState(true)

    const { data: balance, run: refreshBalance } = useRequest(async () => {
        const { available } = await accountServices.getNearBalance()
        return available
    }, {
        refreshDeps: [accountId],
        before: () => !!accountId,
        pollingInterval: 10000
    })

    useDebouncedEffect(() => {
        setLoading(true)
        const accountId = accountServices.getActiveAccountId();
        console.log('accountId', accountId)
        if (accountId) {
            setAccountId(accountId)
            connectAccount(accountId).finally(() => setLoading(false))
        } else {
            setLoading(false)
        }

    }, [], 500)

    async function createAccount() {
        const { seedPhrase, accountId } = accountServices.createAccount()
        console.log(seedPhrase)
        await connectAccount(accountId);
        setAccountId(accountId)
        return seedPhrase
    }

    async function importAccount() {
        const seedPhrase = prompt('Enter your seed phrase')
        if (!seedPhrase) {
            return
        }
        const { accountId } = await accountServices.importAccountBySeedPhrase(seedPhrase)
        await connectAccount(accountId)
        setAccountId(accountId)
    }

    async function connectAccount(accountId: string) {
        const account = await accountServices.connectAccount(accountId)
        setAccountConnection(account)
    }



    return { accountLoading: loading, accountId, accountConnection, createAccount, importAccount, connectAccount, refreshBalance, balance }
}