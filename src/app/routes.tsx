import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Camera } from "./pages/Camera";
import { Processing } from "./pages/Processing";
import { ItemForm } from "./pages/ItemForm";
import { ItemDetail } from "./pages/ItemDetail";
import { RoomOverview } from "./pages/RoomOverview";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/camera",
    Component: Camera,
  },
  {
    path: "/processing",
    Component: Processing,
  },
  {
    path: "/item/new",
    Component: ItemForm,
  },
  {
    path: "/item/:id",
    Component: ItemDetail,
  },
  {
    path: "/item/:id/edit",
    Component: ItemForm,
  },
  {
    path: "/room/:room",
    Component: RoomOverview,
  },
]);
