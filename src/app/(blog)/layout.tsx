import type { Metadata } from "next";
import { GeometricBackground } from "@/components/GeometricBackground";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "首页",
  description: "博客前台",
};

const BlogLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <>
      <GeometricBackground />
      {children}
      <Footer />
    </>
  );
};

export default BlogLayout;
