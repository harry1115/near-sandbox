import BN from "bn.js";
import { utils } from "near-api-js";
import { accountServices } from "./account";

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

export const transactionServices = {
  async sign(payload: number[], tokenId: string) {
    const account = await accountServices.connectAccount();
    const result = await account.functionCall({
      contractId: CONTRACT_ID,
      methodName: "sign",
      args: {
        token_id: tokenId,
        payload: payload.slice().reverse(),
        key_version: 0,
      },
      gas: new BN("300000000000000"),
      attachedDeposit: new BN("0"),
    });

    console.log('sign',result)

    if ("SuccessValue" in (result.status as any)) {
      const successValue = (result.status as any).SuccessValue;
      const decodedValue = Buffer.from(successValue, "base64").toString(
        "utf-8"
      );
      const parsedJSON = JSON.parse(decodedValue) as [string, string];

      console.log('parsedJSON',parsedJSON)

      return {
        r: parsedJSON[0].slice(2),
        s: parsedJSON[1],
      };
    }

    return undefined;
  },
  /**
   * near call mcs-demo.testnet add_derivation_path ‘{“alias”:“eth-01", “chain”:60}’ --deposit 1 --accountId mcs-user.testnet
   */
  async addDerivationPath(alias: string, chain: number) {
    const account = await accountServices.connectAccount();
    await account.functionCall({
      contractId: CONTRACT_ID,
      methodName: "add_derivation_path",
      args: {
        alias,
        chain,
      },
      gas: new BN("300000000000000"),
      attachedDeposit: new BN(utils.format.parseNearAmount("0.01")!),
    });
  },
  async updateDerivationPath(alias: string, tokenId: string) {
    const account = await accountServices.connectAccount();
    await account.functionCall({
      contractId: CONTRACT_ID,
      methodName: "update_path_alias",
      args: {
        alias,
        token_id: tokenId,
      },
      gas: new BN("300000000000000"),
      attachedDeposit: new BN(utils.format.parseNearAmount("0.01")!),
    });
  },
  async queryTokens(chain?: number) {
    const account = await accountServices.connectAccount();
    const res: Token[] = await account.viewFunction({
      contractId: CONTRACT_ID,
      methodName: "nft_tokens_for_owner",
      args: {
        account_id: account.accountId,
      },
    });
    return chain === undefined
      ? res
      : res.filter((token) => {
          const tokenId = JSON.parse(token.token_id);
          return tokenId.chain === chain;
        });
  },
};

export const marketServices = {
  /**
   * near call mcs-demo.testnet add_derivation_path_to_market '{"token_id":"{\"chain\":60,\"meta\":{\"id\":0}}", "price":"1000000000000000000000000"}' --accountId mcs-user0.testnet --depositYocto 1
   */
  async addDerivationPathToMarket(tokenId: string, price: string) {
    const account = await accountServices.connectAccount();
    console.log({token_id: tokenId,
        price:new BN(utils.format.parseNearAmount(price)!).toString(),})
    await account.functionCall({
      contractId: CONTRACT_ID,
      methodName: "add_derivation_path_to_market",
      args: {
        token_id: tokenId,
        price: new BN(utils.format.parseNearAmount(price)!).toString(),
      },
      gas: new BN("300000000000000"),
      attachedDeposit: new BN(1),
    });
  },
  /**
   * near call mcs-demo.testnet remove_derivation_path_from_market '{"token_id":"{\"chain\":60,\"meta\":{\"id\":0}}"}' --accountId mcs-user0.testnet --depositYocto 1
   */
  async removeDerivationPathFromMarket(tokenId: string) {
    const account = await accountServices.connectAccount();
    await account.functionCall({
      contractId: CONTRACT_ID,
      methodName: "remove_derivation_path_from_market",
      args: {
        token_id: tokenId,
      },
      gas: new BN("300000000000000"),
      attachedDeposit: new BN(1),
    });
  },
  /**
   * near view mcs-demo.testnet get_market_list_paged '{"from_index": 0, "limit": 100}'
   */
  async getMarketListPaged(fromIndex = 0, limit = 100) {
    const account = await accountServices.connectAccount();
    const res = await account.viewFunction({
      contractId: CONTRACT_ID,
      methodName: "get_market_list_paged",
      args: {
        from_index: fromIndex,
        limit,
      },
    });
    return res as Record<string, string>;
  },
  /**
   * near call mcs-demo.testnet buy_derivation_path '{"token_id":"{\"chain\":60,\"meta\":{\"id\":0}}"}' --accountId mcs-user.testnet --depositYocto 1000000000000000000000000
   */
  async buyDerivationPath(tokenId: string, price: string) {
    const account = await accountServices.connectAccount();
    await account.functionCall({
      contractId: CONTRACT_ID,
      methodName: "buy_derivation_path",
      args: {
        token_id: tokenId,
      },
      gas: new BN("300000000000000"),
      attachedDeposit: new BN(utils.format.parseNearAmount(price)!),
    });
  },
};
