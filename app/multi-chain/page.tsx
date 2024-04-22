"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Loader from "@/components/Loader";
import Input from "@/components/Input";
import Select from "@/components/Select";
import EVM from "@/utils/chain/EVM";
import { LuCopy } from "react-icons/lu";
import { toast } from "react-toastify";
import { Bitcoin } from "@/utils/chain/Bitcoin";
import {
  transactionServices,
  marketServices,
  CONTRACT_ID,
  Token,
} from "@/services/transaction";
import { useAccountContext } from "@/providers/Account";
import Loading from "@/components/Loading";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Snippet,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useRequest } from "@/hooks/useHooks";

const MPC_PUBLIC_KEY =
  "secp256k1:4HFcTSodRLVCGNVcGc4Mf2fwBBBxv9jxkGdiW2S2CA1y6UpVVRWKj6RX7d7TDt65k2Bj3w9FU4BGtt43ZvuhCnNt";

const chainsConfig = {
  ethereum: {
    providerUrl:
      "https://sepolia.infura.io/v3/6df51ccaa17f4e078325b5050da5a2dd",
    scanUrl: "https://sepolia.etherscan.io",
    name: "ETH",
  },
  bsc: {
    providerUrl: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
    scanUrl: "https://testnet.bscscan.com",
    name: "BNB",
  },
  btc: {
    name: "BTC",
    networkType: "testnet" as const,
    // API ref: https://github.com/Blockstream/esplora/blob/master/API.md
    rpcEndpoint: "https://blockstream.info/testnet/api/",
    scanUrl: "https://blockstream.info/testnet",
  },
};

enum Chain {
  ETH = 60,
  BNB = 714,
  BTC = 0,
}

export default function Home() {
  const { register, handleSubmit } = useForm<Transaction>();
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const { accountConnection, accountLoading } = useAccountContext();

  const [accountBalance, setAccountBalance] = useState("");
  const [chain, setChain] = useState<Chain>(Chain.ETH);

  const [selectedTokenId, setSelectedTokenId] = useState<string>();

  const {
    data: accountTokens,
    loading,
    run: refreshAccountTokens,
  } = useRequest(() => transactionServices.queryTokens(chain), {
    before: () => !!accountConnection,
    refreshDeps: [accountConnection, chain],
    onSuccess(res) {
      console.log("accountTokens", res);
    },
  });

  const accountToken = useMemo(
    () => accountTokens?.find((t) => t.token_id === selectedTokenId),
    [accountTokens, selectedTokenId]
  );

  const ethereum = useMemo(() => new EVM(chainsConfig.ethereum), []);

  const bsc = useMemo(() => new EVM(chainsConfig.bsc), []);

  const bitcoin = useMemo(() => new Bitcoin(chainsConfig.btc), []);

  const derivedAddress = useMemo(() => {
    if (!accountConnection||!selectedTokenId) {
      return "";
    }
    let address = "";
    switch (Number(chain)) {
      case Chain.ETH:
        address = EVM.deriveProductionAddress(
          CONTRACT_ID,
          selectedTokenId,
          MPC_PUBLIC_KEY
        );
        break;
      case Chain.BTC:
        address = Bitcoin.deriveProductionAddress(
          CONTRACT_ID,
          selectedTokenId,
          MPC_PUBLIC_KEY
        ).address;
        break;
      case Chain.BNB:
        address = EVM.deriveProductionAddress(
          CONTRACT_ID,
          selectedTokenId,
          MPC_PUBLIC_KEY
        );
        break;
    }
    return address;
  }, [accountConnection, chain, selectedTokenId]);

  const onSubmit = useCallback(
    async (data: Transaction) => {
      if (!accountConnection?.accountId || !selectedTokenId) {
        throw new Error("Account not found");
      }

      setIsSendingTransaction(true);

      try {
        switch (Number(chain)) {
          case Chain.BNB:
            await bsc.handleTransaction(
              data,
              selectedTokenId,
              MPC_PUBLIC_KEY
            );
            break;
          case Chain.ETH:
            await ethereum.handleTransaction(
              data,
              selectedTokenId,
              MPC_PUBLIC_KEY
              
            );
            break;
          case Chain.BTC:
            await bitcoin.handleTransaction(
              {
                to: data.to,
                value: parseFloat(data.value),
              },
              selectedTokenId,
              MPC_PUBLIC_KEY,
            );
            break;
          default:
            console.error("Unsupported chain selected");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSendingTransaction(false);
      }
    },
    [
      accountConnection?.accountId,
      selectedTokenId,
      chain,
      bsc,
      ethereum,
      bitcoin,
    ]
  );

  const getAccountBalance = useCallback(async () => {
    let balance = "";
    switch (Number(chain)) {
      case Chain.ETH:
        balance =
          (await ethereum.getBalance(derivedAddress)).slice(0, 8) + " ETH";
        break;
      case Chain.BTC:
        balance =
          (await bitcoin.fetchBalance(derivedAddress)).slice(0, 8) + " BTC";
        break;
      case Chain.BNB:
        balance = (await bsc.getBalance(derivedAddress)).slice(0, 8) + " BNB";
        break;
    }

    setAccountBalance(balance);
  }, [bsc, chain, derivedAddress, ethereum, bitcoin]);

  const [loadingAdd, setLoadingAdd] = useState(false);
  const addDerivationPath = useCallback(async () => {
    if (accountConnection) {
      const newAlias = await prompt(
        "Please enter the alias for the new derivation path"
      );
      if (!newAlias) return;
      try {
        setLoadingAdd(true);
        await transactionServices.addDerivationPath(newAlias, chain);
        refreshAccountTokens();
      } finally {
        setLoadingAdd(false);
      }
    }
  }, [accountConnection, chain, refreshAccountTokens]);

  const [loadingSell, setLoadingSell] = useState(false);
  const handleSell = useCallback(async () => {
    if (!accountConnection?.accountId ||  !selectedTokenId) {
      throw new Error("Account not found");
    }
    try {
      const price = await prompt("Please enter the price to sell");
      if (!price) return;
      setLoadingSell(true);
      const result = await marketServices.addDerivationPathToMarket(
        selectedTokenId,
        price
      );
      console.log("result", result);
    } finally {
      setLoadingSell(false);
    }
  }, [accountConnection?.accountId,  selectedTokenId]);

  const [loadingEdit, setLoadingEdit] = useState(false);
  const handleEdit = useCallback(async () => {
    if (!accountConnection?.accountId || !selectedTokenId) {
      throw new Error("Account not found");
    }
    try {
      const newAlias = await prompt(
        "Please enter the new alias for the derivation path",
        accountToken?.metadata.title
      );
      if (!newAlias || newAlias === accountToken?.metadata.title) return;
      setLoadingEdit(true);
      await transactionServices.updateDerivationPath(newAlias, selectedTokenId);
      refreshAccountTokens();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingEdit(false);
    }
  }, [
    accountConnection?.accountId,
    selectedTokenId,
    accountToken?.metadata.title,
    refreshAccountTokens,
  ]);

  return (
    <div className="text-xs">
      {accountConnection && (
        <div className="w-full flex justify-center ">
          {accountLoading ? (
            <Loading />
          ) : (
            <div className="p-3 w-full">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Tabs
                  color="primary"
                  variant="underlined"
                  size="lg"
                  items={[
                    { value: Chain.ETH.toString(), label: "ETH" },
                    { value: Chain.BTC.toString(), label: "BTC" },
                    { value: Chain.BNB.toString(), label: "BNB" },
                  ]}
                  selectedKey={chain.toString()}
                  onSelectionChange={(v) => {
                    setAccountBalance("");
                    setSelectedTokenId(undefined);
                    setChain(Number(v) as Chain);
                  }}
                >
                  {(item) => <Tab key={item.value} title={item.label}></Tab>}
                </Tabs>
              </div>

              <Card className="mb-4">
                <CardHeader className="flex flex-wrap gap-3 justify-between">
                  {!!accountTokens?.length && (
                    <Tabs
                      color="primary"
                      items={accountTokens}
                      selectedKey={selectedTokenId}
                      onSelectionChange={(v) =>
                        setSelectedTokenId(v.toString())
                      }
                    >
                      {(item) => (
                        <Tab
                          key={item.token_id}
                          title={item.metadata.title}
                        ></Tab>
                      )}
                    </Tabs>
                  )}
                  <Button
                    onClick={addDerivationPath}
                    isLoading={loadingAdd}
                    color="primary"
                    variant="bordered"
                    size="sm"
                  >
                    New Derivation Path
                  </Button>
                </CardHeader>
                {selectedTokenId && (
                  <CardBody>
                    <div>
                      <Input
                        label="Derived Address"
                        name="derivedAddress"
                        value={derivedAddress}
                        disabled
                        icon={{
                          icon: <LuCopy />,
                          onClick: () => {
                            navigator.clipboard.writeText(derivedAddress ?? "");
                            toast.success("Copied!");
                          },
                        }}
                      />
                      <div className="mb-3">
                        Balance: {accountBalance}{" "}
                        <Button
                          onClick={getAccountBalance}
                          color="primary"
                          variant="light"
                          size="sm"
                          className=" self-end"
                        >
                          Check Balance
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleEdit}
                          isLoading={loadingEdit}
                          color="primary"
                          variant="bordered"
                          size="sm"
                        >
                          Edit {accountToken?.metadata.title}
                        </Button>
                        <Button
                          onClick={handleSell}
                          isLoading={loadingSell}
                          color="primary"
                          variant="bordered"
                          size="sm"
                        >
                          Sell {accountToken?.metadata.title}
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                )}
              </Card>

              <Card>
                <CardBody>
                  <h2 className=" text-xl font-bold mb-3">Transaction</h2>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                  >
                    <Input
                      label="Address"
                      {...register("to")}
                      placeholder="To Address"
                    />
                    <Input
                      label="Value"
                      {...register("value")}
                      placeholder="Value"
                    />
                    <Input
                      label="Data"
                      {...register("data")}
                      placeholder="0x"
                    />
                    <Button
                      type="submit"
                      color="primary"
                      isLoading={isSendingTransaction}
                    >
                      Send Transaction
                    </Button>
                  </form>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
