"use client";
import { Tab, Tabs } from "@nextui-org/react";
import { useRouter,usePathname } from "next/navigation";

export default function Tabbar() {
    const pathname = usePathname();
  const router = useRouter();

  return (
    <Tabs
      selectedKey={pathname}
      onSelectionChange={(key) => router.push(key as string)}
      color="primary"
      variant="underlined"
      classNames={{
        tabList:
          "gap-6 w-full relative rounded-none p-0  border-divider border-t border-b-0 !bg-default-50",
        cursor: "w-full top-0",
        tab: "flex-1 w-full px-0 h-12",
      }}
      aria-label="Options"
    >
      <Tab key="/multi-chain" title="Wallet" href="/multi-chain" />
      <Tab key="/market" title="Market" href="/market" />
    </Tabs>
  );
}
