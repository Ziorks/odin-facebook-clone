import App from "../App";
import Error from "../pages/Error";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [],
  },
];

export default routes;
