"use client";
import { Tab, Tabs } from "@nextui-org/react";

export default function Tabbar({value,onChange}: {value:string,onChange:(value:string)=>void}) {
    

  return (
    <Tabs
      selectedKey={value}
      onSelectionChange={(key) => onChange(key as string)}
      color="primary"
      variant="underlined"
      classNames={{
        tabList:
          "gap-6 w-full relative rounded-none p-0  border-divider  !bg-default-50",
        cursor: "w-full",
        tab: "flex-1 w-full px-0 h-12",
      }}
      aria-label="Options"
    >
      <Tab key="wallet" title="Wallet" />
      <Tab key="market" title="Market"  />
    </Tabs>
  );
}
