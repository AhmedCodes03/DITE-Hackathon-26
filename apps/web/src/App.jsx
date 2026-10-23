import { AppRoutes } from "./app/routes";
import { ScrollToTop } from "./components/common/ScrollToTop";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}
