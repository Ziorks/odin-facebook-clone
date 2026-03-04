import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  IoChatboxOutline,
  IoMusicalNotesOutline,
  IoBookOutline,
  IoTvOutline,
  IoFilmOutline,
} from "react-icons/io5";
import { IoMdQuote } from "react-icons/io";
import { TbShirtSport } from "react-icons/tb";
import { GiSteampunkGoggles } from "react-icons/gi";
import useDataFetch from "../../hooks/useDataFetch";
import AboutForm from "../AboutForm";
import FormInput from "../FormInput";
import AboutDisplay from "../AboutDisplay";
import styles from "./AboutDetails.module.css";

function DetailForm({ handleClose, onSuccess, detail, label, fieldName }) {
  const { user } = useOutletContext();
  const [value, setValue] = useState(detail || "");
  const [changesMade, setChangesMade] = useState(false);

  const errMsg = `${fieldName} edit error`;
  const loadingMsg = `Updating ${label}...`;

  return (
    <AboutForm
      handleClose={handleClose}
      onSuccess={onSuccess}
      method={"PUT"}
      url={`/users/${user.id}/about_details`}
      data={{ [fieldName]: value || null }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
      disableSave={!changesMade}
    >
      <div className={styles.formContentContainer}>
        <FormInput
          type="textarea"
          label={label}
          maxLength={512}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
        />
      </div>
    </AboutForm>
  );
}

function DetailDisplay({ detail, label, fieldName, img, refetch }) {
  const { isCurrentUser } = useOutletContext();
  const [showForm, setShowForm] = useState(false);
  const renderEditForm = (handleClose) => (
    <DetailForm
      onSuccess={() => {
        refetch();
        handleClose();
      }}
      handleClose={handleClose}
      detail={detail}
      label={label}
      fieldName={fieldName}
    />
  );

  const handleClose = () => setShowForm(false);
  const onSuccess = () => {
    refetch();
    handleClose();
  };

  return (
    <div className={styles.detailsDisplayContainer}>
      <h3>{label}</h3>
      {detail ? (
        <AboutDisplay renderEditForm={renderEditForm}>
          <div className={styles.displayContentContainer}>
            {img}
            <p>{detail}</p>
          </div>
        </AboutDisplay>
      ) : isCurrentUser ? (
        showForm ? (
          <DetailForm
            handleClose={handleClose}
            onSuccess={onSuccess}
            label={label}
            fieldName={fieldName}
          />
        ) : (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            {img}
            {label}
          </button>
        )
      ) : (
        <p>No {label.toLowerCase()} to show</p>
      )}
    </div>
  );
}

function AboutDetails() {
  const { user, isCurrentUser } = useOutletContext();
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_details`,
  );

  return (
    <div className={styles.primaryContainer}>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          <DetailDisplay
            detail={data.aboutMe}
            label={`About ${isCurrentUser ? "you" : "me"}`}
            fieldName={"aboutMe"}
            img={<IoChatboxOutline />}
            refetch={refetch}
          />

          <DetailDisplay
            detail={data.quotes}
            label={"Quotes"}
            fieldName={"quotes"}
            img={<IoMdQuote />}
            refetch={refetch}
          />

          <DetailDisplay
            detail={data.music}
            label={"Music"}
            fieldName={"music"}
            img={<IoMusicalNotesOutline />}
            refetch={refetch}
          />

          <DetailDisplay
            detail={data.books}
            label={"Books"}
            fieldName={"books"}
            img={<IoBookOutline />}
            refetch={refetch}
          />

          <DetailDisplay
            detail={data.tv}
            label={"TV shows"}
            fieldName={"tv"}
            img={<IoTvOutline />}
            refetch={refetch}
          />

          <DetailDisplay
            detail={data.movies}
            label={"Movies"}
            fieldName={"movies"}
            img={<IoFilmOutline />}
            refetch={refetch}
          />

          <DetailDisplay
            detail={data.sports}
            label={"Sports"}
            fieldName={"sports"}
            img={<TbShirtSport />}
            refetch={refetch}
          />

          <DetailDisplay
            detail={data.hobbies}
            label={"Hobbies"}
            fieldName={"hobbies"}
            img={<GiSteampunkGoggles />}
            refetch={refetch}
          />
        </>
      )}
    </div>
  );
}

export default AboutDetails;
