import BN from "bn.js";
import { Account, utils } from "near-api-js";

export const CONTRACT_ID = "mcs-demo.testnet";

export type Token = {
  token_id: string;
  owner_id: string;
  metadata: {
    title: string;
    description?: string;
    media?: string;
    media_hash?: string;
    copies?: number;
    issued_at?: Date;
    expires_at?: Date;
    starts_at?: Date;
    updated_at?: Date;
    extra?: any;
    reference?: string;
    reference_hash?: string;
  };
  approved_account_ids: Record<string, any>;
};

/**
near call mcs-demo.testnet sign ‘{“token_id”:“{\“chain\“:60,\“meta\“:{\“id\“:0}}“, “payload”:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], “key_version”:0}’ --accountId mcs-user.testnet --gas 300000000000000
[
  ‘03181998B1BB9972EDC7A18745F6CE531ABDE0819CDA17786DAF980EDA5A69E8B7’,
  ‘3117E273E3C76578266C1469D833E52A26741277DE1F13C882E2459E83543E1C’
]
 */

export async function signMPC(
  account: Account,
  payload: number[],
  tokenId: string
): Promise<
  | {
      r: string;
      s: string;
    }
  | undefined
> {
  const result = await account.functionCall({
    contractId: CONTRACT_ID,
    methodName: "sign",
    args: {
      token_id:tokenId,
      payload: payload.slice().reverse(),
      key_version: 0
    },
    gas: new BN("300000000000000"),
    attachedDeposit: new BN("0"),
  });

  if ("SuccessValue" in (result.status as any)) {
    const successValue = (result.status as any).SuccessValue;
    const decodedValue = Buffer.from(successValue, "base64").toString("utf-8");
    const parsedJSON = JSON.parse(decodedValue) as [string, string];

    return {
      r: parsedJSON[0].slice(2),
      s: parsedJSON[1],
    };
  }

  return undefined;
}

/**
 * near call mcs-demo.testnet add_derivation_path ‘{“alias”:“eth-01", “chain”:60}’ --deposit 1 --accountId mcs-user.testnet
 */
export async function addDP(
  account: Account,
  alias: string,
  chain: number
){
  // const isRegistered = await account.viewFunction({
  //   contractId: CONTRACT_ID,
  //   methodName: "storage_balance_of",
  //   args: {
  //     account_id: account.accountId,
  //   },
  // })
  // console.log('isRegistered', isRegistered)
  // if(!isRegistered){
  //  const res=  await account.functionCall({
  //     contractId: CONTRACT_ID,
  //     methodName: "storage_deposit",
  //     args: {},
  //     gas: new BN("300000000000000"),
  //     // 1 NEAR
  //     attachedDeposit: new BN(utils.format.parseNearAmount('1')!),
  //   });
  //   console.log('storage_deposit res', res)
  // }

  await account.functionCall({
    contractId: CONTRACT_ID,
    methodName: "add_derivation_path",
    args: {
      alias,
      chain
    },
    gas: new BN("300000000000000"),
    attachedDeposit: new BN(utils.format.parseNearAmount('0.01')!),
  });
}

export async function updateDp(
  account: Account,
  alias: string,
  tokenId: string
){
  await account.functionCall({
    contractId: CONTRACT_ID,
    methodName: "update_derivation_path",
    args: {
      alias,
      tokenId
    },
    gas: new BN("300000000000000"),
    attachedDeposit: new BN(utils.format.parseNearAmount('0.01')!),
  });
}

export async function getDPS(
  account: Account
){
  const res:Token[]= await account.viewFunction({
    contractId: CONTRACT_ID,
    methodName: "nft_tokens_for_owner",
    args: {
      account_id: account.accountId,
    },
  });
  return res
}

/**
 * Calls the `public_key` method on the contract to retrieve the public key.
 *
 * This function sends a function call to the contract specified by `contractId`,
 * invoking the `public_key` method without any arguments. It then processes the
 * result, attempting to decode the returned SuccessValue as a UTF-8 string to
 * extract the public key.
 *
 * @param {Account} account - The NEAR account object used to interact with the blockchain.
 * @returns {Promise<string | undefined>} The public key as a string if the call is successful, otherwise undefined.
 */
export async function getRootPublicKey(
  account: Account
): Promise<string | undefined> {
  const result = await account.functionCall({
    contractId: "multichain-testnet-2.testnet",
    methodName: "public_key",
    args: {},
    gas: new BN("300000000000000"),
    attachedDeposit: new BN("0"),
  });

  if ("SuccessValue" in (result.status as any)) {
    const successValue = (result.status as any).SuccessValue;
    const publicKey = Buffer.from(successValue, "base64").toString("utf-8");

    return publicKey.replace(/^"|"$/g, "");
  }

  return undefined;
}


export async function getAccountDetail(
  account: Account | undefined
): Promise<{
  account_id: string,
  derivation_path_infos: {}
} | undefined> {
  if (account) {
    return await account.viewFunction({
      contractId: "mcs-demo.testnet",
      methodName: "get_account",
      args: {
        account_id: account.accountId,
      },
    })
  }
}
