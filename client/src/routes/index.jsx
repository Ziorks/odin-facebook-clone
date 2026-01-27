import App from "../App";
import Error from "../pages/Error";
import Home from "../pages/Home";
import FriendsLayout from "../pages/FriendsLayout";
import Friends from "../pages/Friends";
import PendingRequestsLayout from "../pages/PendingRequestsLayout";
import PendingRequestsIncoming from "../pages/PendingRequestsIncoming";
import PendingRequestsOutgoing from "../pages/PendingRequestsOutgoing";
import UserSearch from "../pages/UserSearch/UserSearch";
import UserProfile from "../pages/UserProfile";
import Wall from "../components/Wall";
import AboutLayout from "../pages/AboutLayout";
import AboutOverview from "../components/AboutOverview";
import AboutWorkAndEducation from "../components/AboutWorkAndEducation";
import AboutPlacesLived from "../components/AboutPlacesLived";
import AboutContactInfo from "../components/AboutContactInfo";
import AboutDetails from "../components/AboutDetails";
import UsersFriends from "../components/UsersFriends";
import UserSettings from "../pages/UserSettings";
import UserSettingsModal from "../pages/UserSettingsModal";
import Username from "../pages/UserSettingForms/Username";
import Name from "../pages/UserSettingForms/Name";
import Email from "../pages/UserSettingForms/Email";
import Avatar from "../pages/UserSettingForms/Avatar";
import Password from "../pages/UserSettingForms/Password";
import Oauth from "../pages/Oauth";
import Logout from "../pages/Logout";

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
      {
        path: "friends",
        element: <FriendsLayout />,
        children: [
          { index: true, element: <Friends /> },
          {
            element: <PendingRequestsLayout />,
            children: [
              { path: "pending", element: <PendingRequestsIncoming /> },
              {
                path: "pending_incoming",
                element: <PendingRequestsIncoming />,
              },
              {
                path: "pending_outgoing",
                element: <PendingRequestsOutgoing />,
              },
            ],
          },
        ],
      },
      {
        path: "users",
        children: [
          {
            index: true,
            element: <UserSearch />,
          },
          {
            path: ":userId",
            element: <UserProfile />,
            children: [
              { index: true, element: <Wall /> },
              {
                element: <AboutLayout />,
                children: [
                  { path: "about", element: <AboutOverview /> },
                  { path: "about_overview", element: <AboutOverview /> },
                  {
                    path: "about_work_and_education",
                    element: <AboutWorkAndEducation />,
                  },
                  {
                    path: "about_places_lived",
                    element: <AboutPlacesLived />,
                  },
                  {
                    path: "about_contact_info",
                    element: <AboutContactInfo />,
                  },
                  {
                    path: "about_details",
                    element: <AboutDetails />,
                  },
                ],
              },
              { path: "friends", element: <UsersFriends /> },
            ],
          },
        ],
      },
      {
        path: "settings",
        element: <UserSettings />,
        children: [
          {
            element: <UserSettingsModal />,
            children: [
              { path: "username", element: <Username /> },
              { path: "name", element: <Name /> },
              { path: "email", element: <Email /> },
              { path: "avatar", element: <Avatar /> },
              { path: "password", element: <Password /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/oauth",
    element: <Oauth />,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
];

export default routes;
