"use client";
import { useRequest } from "@/hooks/useHooks";
import { useAccountContext } from "@/providers/Account";
import { marketServices, transactionServices } from "@/services/transaction";
import { Button } from "@nextui-org/react";
import { utils } from "near-api-js";
import { useState } from "react";

export default function Page() {
  const { accountId } = useAccountContext();
  const {
    data: marketAccounts,
    run: refresh,
    loading,
  } = useRequest(() => marketServices.getMarketListPaged());

  const { data: myAccountTokens, run: refreshAccountTokens } = useRequest(() =>
    transactionServices.queryTokens()
  );

  function formatAmount(v: string) {
    return utils.format.formatNearAmount(v);
  }

  const [actionLoading, setActionLoading] = useState(false);
  async function handleBuy(tokenId: string, price: string) {
    try {
      setActionLoading(true);
      await marketServices.buyDerivationPath(tokenId, price);
      await refresh();
      await refreshAccountTokens();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTakeOff(tokenId: string) {
    try {
      setActionLoading(true);
      await marketServices.removeDerivationPathFromMarket(tokenId);
      await refresh();
    } finally {
      setActionLoading(false);
    }
  }

  return !!accountId&&(
    <div>
      <div className="p-5">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Token ID</th>
              <th className="text-left">Price</th>
              <th className="text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(marketAccounts || {}).map(([id, price]) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{formatAmount(price)} NEAR</td>
                <td className="py-2">
                  {myAccountTokens?.some((t) => t.token_id === id) ? (
                    <Button size="sm" color="danger" variant="ghost" isLoading={actionLoading} onClick={() => handleTakeOff(id)}>
                      Take Off
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      color="primary" isLoading={actionLoading}
                      onClick={() => handleBuy(id, formatAmount(price))}
                    >
                      Buy
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
