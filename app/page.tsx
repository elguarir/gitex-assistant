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
    <div className="font-sans bg-neutral-50 antialiased dark:bg-neutral-950">
      <SiteHeader />
      <main>
        <div className="absolute inset-0 isolate z-[2] hidden contain-strict lg:block">
          <div className="absolute left-0 top-0 h-[1280px] w-[560px] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]"></div>
          <div className="absolute left-0 top-0 h-[1280px] w-[240px] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]"></div>
          <div className="absolute left-0 top-0 h-[1280px] w-[240px] -translate-y-[350px] -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]"></div>
        </div>

        <section className="overflow-x-hidden bg-white dark:bg-transparent min-h-dvh h-full">
          <div className="relative mx-auto max-w-5xl px-4 py-16 lg:py-4">
            <div className="relative z-10 mx-auto max-w-2xl">
              <GitexChat />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
