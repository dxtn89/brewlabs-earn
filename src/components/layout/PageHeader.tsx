import { ReactNode } from "react";
import Container from "./Container";

// TIP: If you want words to be highlighted use JSX in the prop
// and wrap the word in <mark> tags
const PageHeader = ({ title, summary, children }: PageHeaderProps) => (
  <section>
    <Container className="pb-16 pt-20">
      <header className="font-brand sm:pr-0">
        <h1 className="max-w-md text-3xl text-slate-700 dark:text-slate-400 sm:text-4xl">{title}</h1>
        {summary && (
          <p className="mt-4 max-w-4xl bg-gradient-to-r from-slate-400 to-gray-500/90 bg-clip-text !text-transparent [text-wrap:balance]">
            {summary}
          </p>
        )}
      </header>
      {children}
    </Container>
  </section>
);

type PageHeaderProps = {
  children?: ReactNode;
  title: string | ReactNode;
  summary?: string | ReactNode;
};

export default PageHeader;
