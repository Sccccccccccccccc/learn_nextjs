import type { Metadata } from "next";
import "@/app/globals.css";
import GeometricBackground from "@/components/GeometricBackground";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "My App",
  description: "My App",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en">
      <body>
        <GeometricBackground />
        {children}
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;
