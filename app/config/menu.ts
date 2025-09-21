import fundamentalMenu from "@/layouts/UserLayout/menu/fundamentalMenu";
import { macroEconomicMenu } from "@/layouts/UserLayout/menu/macroEconomicMenu";
import stockMenu from "@/layouts/UserLayout/menu/stockMenu";

export default {
  route: {
    path: '/',
    routes: [
      stockMenu,
      fundamentalMenu,
      macroEconomicMenu,
    ],
  },
  location: {
    pathname: '/',
  },
  appList: [],
};