import { useRouter } from "next/router";
import { useEffect } from "react";

const ChartPage = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/chart/bsc/0xc9cc6515a1df94aaed156f3bd6efe86a100308fa");
  }, []);
};

export default ChartPage;
