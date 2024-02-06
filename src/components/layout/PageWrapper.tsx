import { ReactNode } from "react";
import PageMeta from "./PageMeta";

const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <PageMeta />
      {/* <AlertNotice /> */}
      <div id="page_wrapper" className="relative z-0 min-h-screen w-full flex-1 xl:order-last">
        {children}
      </div>
    </>
  );
};

export default PageWrapper;
