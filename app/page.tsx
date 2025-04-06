import { Link } from "@heroui/link";
import SiteHeader from "@/components/side-header";
import { Button } from "@heroui/button";
import { Metadata } from "next";

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
          <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-24">
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h1 className="text-title text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
                The only guide you need to Gitex Africa
              </h1>
              <p className="text-sm md:text-base mx-auto mt-8 max-w-2xl text-default-600 text-balance">
                Gitex Africa is the largest tech and startup event in Africa,
                bringing together innovators, entrepreneurs, and industry
                leaders to showcase the latest advancements in technology and
                business.
              </p>
              <Button
                as={Link}
                href="/sign-up"
                size="md"
                variant="solid"
                color="primary"
                className="mx-auto mt-8 w-fit"
              >
                <span>Get Started</span>
              </Button>
            </div>
          </div>
          <div className="mx-auto max-w-7xl"></div>
        </section>
      </main>
    </div>
  );
}
