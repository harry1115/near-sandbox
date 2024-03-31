import { useAccountContext } from "@/providers/Account";
import Button from "./Button";
import { LuCopy } from "react-icons/lu";
import { toast } from "react-toastify";


export default function Account() {

    const { accountId, createAccount, importAccount, accountLoading, balance } = useAccountContext();

    return (
        <div>
            {!accountLoading && (accountId ?
                <div>
                    <div className="flex items-center gap-3">
                       Account address: {accountId} <LuCopy onClick={() => {
                            navigator.clipboard.writeText(accountId ?? "");
                            toast.success("Copied!");
                        }} />
                    </div>
                    <div>Balance: {balance} {Number(balance||0)<=1&&<div className="text-red-500">Insufficient balance，Keep at least 1 NEAR in your account</div>
                    }</div>
                </div>
                :
                <div className="flex items-center gap-3">
                    <Button onClick={createAccount}>Create Account</Button>
                    or
                    <Button onClick={importAccount}>Import Account</Button>
                </div>
            )}
        </div>

    );
}