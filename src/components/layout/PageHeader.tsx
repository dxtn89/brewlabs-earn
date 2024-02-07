import Link from "next/link";
import { ReactNode } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import Container from "components/layout/Container";
import { buttonVariants } from "components/ui/button";

type PageHeaderProps = {
  children?: ReactNode;
  title: string | ReactNode;
  summary?: string | ReactNode;
  infoLink?: string;
};

// TIP: If you want words to be highlighted use JSX in the prop
// and wrap the word in <mark> tags
const PageHeader = ({ title, summary, infoLink, children }: PageHeaderProps) => (
  <section>
    <Container className="pb-16 pt-20">
      <header className="font-brand sm:pr-0">
        <div className="relative max-w-md ">
          <h1 className="text-3xl text-slate-700 dark:text-slate-400 sm:text-4xl">{title}</h1>

          {infoLink && (
            <div className="absolute -right-6 -top-6 sm:-top-2">
              <Link href={infoLink} className={buttonVariants({ variant: "link" })}>
                <div className="tooltip tooltip-right" data-tip="Learn more">
                  <InformationCircleIcon className=" h-6 w-6 text-gray-500" />
                </div>
              </Link>
            </div>
          )}
        </div>

        {summary && (
          <p className="mt-4 max-w-3xl bg-gradient-to-r from-slate-400 to-gray-500/90 bg-clip-text !text-transparent [text-wrap:balance]">
            {summary}
          </p>
        )}
      </header>
      {children}
    </Container>
  </section>
);

export default PageHeader;
