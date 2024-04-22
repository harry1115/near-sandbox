import bs58 from "bs58"
import { Account as NearAccount, connect, KeyPair, keyStores, providers, utils } from "near-api-js"
import { generateSeedPhrase, parseSeedPhrase } from "near-seed-phrase"

interface Account {
    account_id: string
    public_key: string
    private_key: string
}

const nearConnectConfig = {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://testnet.mynearwallet.com/',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
    indexerUrl: 'https://testnet-api.kitwallet.app'
}

const networkId = 'testnet'
const storageKeyAccountIds = `near-${networkId}-accountIds`
const storageKeyActiveAccountId = `near-${networkId}-activeAccountId`
const storageKeyAccount = (accountId: string) => `near-${networkId}-account:${accountId}`

export const accountServices = {
    accountConnection: undefined as NearAccount | undefined,
    createAccount(accountId?: string) {
        const { seedPhrase, publicKey, secretKey } = generateSeedPhrase()
        accountId = accountId || this.generateAccountId(publicKey);
        this.saveAccount(accountId, publicKey, secretKey)
        return { seedPhrase, accountId };
    },
    generateAccountId(publicKey: string) {
        return Buffer.from(bs58.decode(publicKey.replace('ed25519:', ''))).toString('hex')
    },
    async connectAccount(accountId?: string) {
        if(this.accountConnection) return this.accountConnection

        accountId = accountId || this.getActiveAccountId()
        if (!accountId) throw new Error('Account not found')
        const privateKey = this.getAccount(accountId)?.private_key
        if (!privateKey) throw new Error('Private key not found')
        const keyPair = KeyPair.fromString(privateKey)
        const keyStore = new keyStores.BrowserLocalStorageKeyStore()
        keyStore.setKey(networkId, accountId, keyPair)

        const nearConnection = await connect({ ...nearConnectConfig, keyStore })
        const accountConnection = await nearConnection.account(accountId)

        this.accountConnection = accountConnection

        this.setActiveAccountId(accountId)

        return accountConnection
    },

    downloadSeedPhrase(accountId: string, text: string) {
        const element = document.createElement('a')
        const file = new Blob([text], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = `${accountId}.txt`
        document.body.appendChild(element)
        element.click()
    },
    saveAccount(accountId: string, publicKey: string, secretKey: string) {
        const jsonText = {
            account_id: accountId,
            public_key: publicKey,
            private_key: secretKey,
        }
        localStorage.setItem(storageKeyAccount(accountId), JSON.stringify(jsonText))
        const accountIds = JSON.parse(localStorage.getItem(storageKeyAccountIds) || '[]')
        if (!accountIds.includes(accountId)) {
            accountIds.push(accountId)
            localStorage.setItem(storageKeyAccountIds, JSON.stringify(accountIds))
        }
    },

    getActiveAccountId() {
        return localStorage.getItem(storageKeyActiveAccountId) || undefined
    },

    setActiveAccountId(accountId: string) {
        localStorage.setItem(storageKeyActiveAccountId, accountId)
    },

    getAccount(accountId: string) {
        return JSON.parse(localStorage.getItem(storageKeyAccount(accountId)) || '{}') || {}
    },

    async getNearBalance() {
        try {
            const account = await this.connectAccount()
            const { available } = await account.getAccountBalance()
            const formattedValue = utils.format.formatNearAmount(available)
            return { available: formattedValue }
        } catch (error) {
            return { available: 0 }
        }
    },

    async importAccountBySeedPhrase(seedPhrase: string) {
        if(seedPhrase.split(' ').length !== 12){
            alert('Provided seed phrase must be at least 12 words long')
            throw new Error('Provided seed phrase must be at least 12 words long')
        }
        const { publicKey, secretKey } = parseSeedPhrase(seedPhrase)
        const accountId = await this.generateAccountId(publicKey);
        if (!accountId) {
            throw new Error('Account not found')
        }
        this.saveAccount(accountId, publicKey, secretKey)
        return {accountId}
    },
    

    // async checkAccountExist(accountId: string) {
    //     try {
    //         const provider = new providers.JsonRpcProvider({ url: nearConnectConfig.nodeUrl });
    //         const res = await provider.query({
    //             request_type: 'view_account',
    //             account_id: accountId,
    //             finality: 'final',
    //         });
    //         console.log('checkAccountExist', res);
    //         return !!res
    //     } catch (error) {
    //         console.error('checkAccountExist error', error);
    //         return false;
    //     }
    // },

   
}




