import { Link } from "@heroui/link";
import SiteHeader from "@/components/side-header";
import { Button } from "@heroui/button";
import { Metadata } from "next";
import { GitexChat } from "./gitex-chat";

export const metadata: Metadata = {
  title: "GitexAfrica - Guide",
  description:
    "Gitex Africa is the largest tech and startup event in Africa, bringing together innovators, entrepreneurs, and industry leaders to showcase the latest advancements in technology and business.",
};

export default function Home() {
  return (
    <div className="relative font-sans flex flex-col h-dvh bg-neutral-50 antialiased dark:bg-neutral-950">
      <SiteHeader />
      <main className="flex-1 h-dvh overflow-x-hidden bg-white dark:bg-transparent">
        <div className="mx-auto max-w-2xl px-4 py-16 lg:py-4">
          <GitexChat />
        </div>
      </main>
    </div>
  );
}
