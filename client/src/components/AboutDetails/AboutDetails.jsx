import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetch from "../../hooks/useDataFetch";
import AboutForm from "../AboutForm";
import AboutDisplay from "../AboutDisplay";
// import styles from "./AboutDetails.module.css";

function DetailForm({ handleClose, refetch, detail, label, fieldName }) {
  const { user } = useOutletContext();
  const [value, setValue] = useState(detail || "");

  const errMsg = `${fieldName} edit error`;
  const loadingMsg = `Updating ${label}...`;

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
      method={"PUT"}
      url={`/users/${user.id}/about_details`}
      data={{ [fieldName]: value || null }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
    >
      <div>
        <label htmlFor={fieldName}>{label}</label>{" "}
        <textarea
          maxLength={512}
          name={fieldName}
          id={fieldName}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </AboutForm>
  );
}

function DetailDisplay({
  detail,
  label,
  fieldName,
  addBtnText,
  refetch,
  isCurrentUser,
}) {
  const [showForm, setShowForm] = useState(false);
  const renderEditForm = (handleClose) => (
    <DetailForm
      refetch={refetch}
      handleClose={handleClose}
      detail={detail}
      label={label}
      fieldName={fieldName}
    />
  );

  return (
    <>
      {detail ? (
        <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
          <p>{detail}</p>
        </AboutDisplay>
      ) : isCurrentUser ? (
        showForm ? (
          <DetailForm
            handleClose={() => setShowForm(false)}
            refetch={refetch}
            label={label}
            fieldName={fieldName}
          />
        ) : (
          <button onClick={() => setShowForm(true)}>{addBtnText}</button>
        )
      ) : (
        <p>No {label.toLowerCase()} to show</p>
      )}
    </>
  );
}

function AboutDetails() {
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_details`,
  );

  const isCurrentUser = user.id === auth.user.id;

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          <h3>About {isCurrentUser ? "you" : user.username}</h3>
          <DetailDisplay
            detail={data.aboutMe}
            label={"About Me"}
            fieldName={"aboutMe"}
            addBtnText={"Add an about me"}
            isCurrentUser={isCurrentUser}
            refetch={refetch}
          />

          <h3>Favorite quotes</h3>
          <DetailDisplay
            detail={data.quotes}
            label={"Quotes"}
            fieldName={"quotes"}
            addBtnText={"Add your favorite quotations"}
            isCurrentUser={isCurrentUser}
            refetch={refetch}
          />

          <h3>Music</h3>
          <DetailDisplay
            detail={data.music}
            label={"Music"}
            fieldName={"music"}
            addBtnText={"Add your favorite music"}
            isCurrentUser={isCurrentUser}
            refetch={refetch}
          />

          <h3>Books</h3>
          <DetailDisplay
            detail={data.books}
            label={"Books"}
            fieldName={"books"}
            addBtnText={"Add your favorite books"}
            isCurrentUser={isCurrentUser}
            refetch={refetch}
          />

          <h3>TV</h3>
          <DetailDisplay
            detail={data.tv}
            label={"TV Shows"}
            fieldName={"tv"}
            addBtnText={"Add your favorite tv shows"}
            isCurrentUser={isCurrentUser}
            refetch={refetch}
          />

          <h3>Movies</h3>
          <DetailDisplay
            detail={data.movies}
            label={"Movies"}
            fieldName={"movies"}
            addBtnText={"Add your favorite movies"}
            isCurrentUser={isCurrentUser}
            refetch={refetch}
          />

          <h3>Sports</h3>
          <DetailDisplay
            detail={data.sports}
            label={"Sports"}
            fieldName={"sports"}
            addBtnText={"Add your favorite sports teams/players"}
            isCurrentUser={isCurrentUser}
            refetch={refetch}
          />

          <h3>Hobbies</h3>
          <DetailDisplay
            detail={data.hobbies}
            label={"Hobbies"}
            fieldName={"hobbies"}
            addBtnText={"Add your hobbies and interests"}
            isCurrentUser={isCurrentUser}
            refetch={refetch}
          />
        </>
      )}
    </>
  );
}

export default AboutDetails;
