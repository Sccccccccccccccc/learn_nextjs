import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Index",
};

const IndexLayout = ({ children }: LayoutProps<"/index">) => {
  return (
    <div>
      {children}
    </div>
  );
};

export default IndexLayout;
