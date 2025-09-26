import App from "../App";
import Error from "../pages/Error";
import Home from "../pages/Home";
import Oauth from "../pages/Oauth";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    path: "/oauth",
    element: <Oauth />,
  },
];

export default routes;
