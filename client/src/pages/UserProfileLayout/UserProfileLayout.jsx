import { useContext } from "react";
import { useParams, Outlet, Link, useLocation } from "react-router-dom";
import {
  BsPersonFillAdd,
  BsPersonFillDash,
  BsPersonFillCheck,
  BsPersonFillX,
} from "react-icons/bs";
import { FaPencilAlt } from "react-icons/fa";
import useFriendshipActions from "../../hooks/useFriendshipActions";
import useDataFetch from "../../hooks/useDataFetch";
import AuthContext from "../../contexts/AuthContext";
import ProfilePic from "../../components/ProfilePic";
import styles from "./UserProfileLayout.module.css";

function Friendship({ friendship, userId, setData }) {
  const { isLoading, error, createRequest, acceptRequest, removeFriendship } =
    useFriendshipActions(friendship?.id);

  const handleAdd = () => {
    createRequest(userId).then((resp) =>
      setData((prev) => ({ ...prev, friendship: resp })),
    );
  };
  const handleAccept = () => {
    acceptRequest().then((resp) =>
      setData((prev) => ({ ...prev, friendship: resp })),
    );
  };

  const handleRemove = (confirmMsg) => {
    removeFriendship(confirmMsg).then((isRemoved) => {
      if (isRemoved) setData((prev) => ({ ...prev, friendship: null }));
    });
  };

  return (
    <>
      <div className={styles.friendshipActions}>
        {friendship ? (
          friendship.accepted ? (
            <button
              onClick={() =>
                handleRemove("Are you sure you want to remove this friend?")
              }
              disabled={isLoading}
            >
              <BsPersonFillDash />
              Remove Friend
            </button>
          ) : friendship.user1Id === userId ? (
            <>
              <button
                className={styles.addBtn}
                onClick={handleAccept}
                disabled={isLoading}
              >
                <BsPersonFillCheck />
                Accept Request
              </button>
              <button
                onClick={() =>
                  handleRemove(
                    "Are you sure you want to decline this friend request?",
                  )
                }
                disabled={isLoading}
              >
                <BsPersonFillX />
                Decline Request
              </button>
            </>
          ) : (
            <button
              onClick={() =>
                handleRemove(
                  "Are you sure you want to cancel your friend request?",
                )
              }
              disabled={isLoading}
            >
              <BsPersonFillX />
              Cancel Request
            </button>
          )
        ) : (
          <button
            className={styles.addBtn}
            onClick={handleAdd}
            disabled={isLoading}
          >
            <BsPersonFillAdd />
            Add Friend
          </button>
        )}
      </div>
      {isLoading && <span>Proccessing...</span>}
      {error && <span>{error}</span>}
    </>
  );
}

const LOCATIONS = { POSTS: "posts", ABOUT: "about", FRIENDS: "friends" };

function UserProfileLayout() {
  const location = useLocation();
  const { userId } = useParams();
  const { auth } = useContext(AuthContext);
  const { data, setData, isLoading, error } = useDataFetch(`/users/${userId}`);

  const isCurrentUser = auth.user.id === data?.user.id;
  const currentPath = location.pathname.split("/").at(-1);
  let activeLink = LOCATIONS.POSTS;
  if (currentPath === "friends") {
    activeLink = LOCATIONS.FRIENDS;
  } else if (currentPath.startsWith("about")) {
    activeLink = LOCATIONS.ABOUT;
  }

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured</p>}
      {data && (
        <>
          <div className={styles.primaryContainer}>
            <div className={styles.userInfo}>
              <ProfilePic src={data.user.profile.avatar} size={150} />
              <div className={styles.usernameAndnFriends}>
                <p>{data.user.username}</p>
                {data.user._count.friends > 0 && (
                  <p>
                    {data.user._count.friends} friend
                    {data.user._count.friends > 1 && "s"}
                  </p>
                )}
              </div>
              {isCurrentUser ? (
                <div className={styles.ownerActions}>
                  <Link to={"about"}>
                    <FaPencilAlt />
                    Edit profile
                  </Link>
                </div>
              ) : (
                <Friendship
                  friendship={data.friendship}
                  userId={data.user.id}
                  setData={setData}
                />
              )}
            </div>
            <nav className={styles.nav}>
              <Link
                to={""}
                className={activeLink === LOCATIONS.POSTS ? styles.active : ""}
              >
                Posts
              </Link>
              <Link
                to={"about"}
                className={activeLink === LOCATIONS.ABOUT ? styles.active : ""}
              >
                About
              </Link>
              <Link
                to={"friends"}
                className={
                  activeLink === LOCATIONS.FRIENDS ? styles.active : ""
                }
              >
                Friends
              </Link>
            </nav>
          </div>
          <Outlet context={{ user: data.user, isCurrentUser }} />
        </>
      )}
    </>
  );
}

export default UserProfileLayout;
