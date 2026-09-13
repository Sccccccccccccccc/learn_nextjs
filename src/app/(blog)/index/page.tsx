import type { Metadata } from "next";
import { MainNav } from "@/components/MainNav";
export const metadata: Metadata = {
  title: "Home",
};

const HomePage = async ({ params, searchParams }: PageProps<"/index">) => {
  return (
    <div 
      className="
        flex flex-col items-center
        absolute translate-x-[-50%] translate-y-[-50%] top-[50%] left-[50%]
        bg-[#1E2939] rounded-[32px] border-[2px] border-gray-700
        w-[350px] h-[500px] 
        sm:w-[400px]
      "
    >
      <MainNav />
      IndexContent
    </div>
  );
};

export default HomePage;
