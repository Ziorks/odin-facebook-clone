import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import useDataFetch from "../../hooks/useDataFetch";
import { CURRENT_YEAR } from "../../utils/constants";
import AuthContext from "../../contexts/AuthContext";
import AboutDisplay from "../AboutDisplay";
import { CityForm } from "../AboutPlacesLived/AboutPlacesLived";
import {
  WorkForm,
  SchoolForm,
} from "../AboutWorkAndEducation/AboutWorkAndEducation";
// import styles from "./AboutOverview.module.css";

function OverviewItemDisplay({
  children,
  item,
  label,
  deleteUrl,
  deleteConfirmName,
  renderEditForm,
  refetch,
}) {
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);

  const isCurrentUser = user.id === auth.user.id;

  return (
    <>
      {item ? (
        <AboutDisplay
          onDelete={refetch}
          deleteUrl={deleteUrl}
          deleteErrMsg={`${label} delete error`}
          deleteConfirmMsg={`Are you sure you want to delete '${deleteConfirmName}' forever?`}
          renderEditForm={renderEditForm}
        >
          {children}
        </AboutDisplay>
      ) : isCurrentUser ? (
        showForm ? (
          renderEditForm(() => setShowForm(false))
        ) : (
          <button onClick={() => setShowForm(true)}>Add your {label}</button>
        )
      ) : (
        <p>No {label} to show</p>
      )}
    </>
  );
}

function AboutOverview() {
  const { user } = useOutletContext();
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_overview`,
  );

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          <h3>About Overview</h3>
          <OverviewItemDisplay
            item={data.work}
            label={"work"}
            deleteUrl={`/users/${user.id}/work/${data.work?.id}`}
            deleteConfirmName={data.work?.company}
            renderEditForm={(handleClose) => (
              <WorkForm
                work={data.work}
                onSuccess={() => {
                  refetch();
                  handleClose();
                }}
                handleClose={handleClose}
              />
            )}
            refetch={refetch}
          >
            <p>
              {`${data.work?.position ? `${data.work?.position}` : `Work${data.work?.currentJob ? "s" : "ed"}`} at`}
              {data.work?.company}
            </p>
            {data.work?.startYear && (
              <p>
                {data.work?.startYear} - {data.work?.endYear || "Present"}
              </p>
            )}
          </OverviewItemDisplay>

          <OverviewItemDisplay
            item={data.school}
            label={"school"}
            deleteUrl={`/users/${user.id}/school/${data.school?.id}`}
            deleteConfirmName={data.school?.name}
            renderEditForm={(handleClose) => (
              <SchoolForm
                school={data.school}
                onSuccess={() => {
                  refetch();
                  handleClose();
                }}
                handleClose={handleClose}
              />
            )}
            refetch={refetch}
          >
            <p>
              {`Studie${data.school?.graduated || data.school?.endYear < CURRENT_YEAR ? "d" : "s"} at ${data.school?.name}`}
            </p>
            {(data.school?.degree || data.school?.endYear) && (
              <p>
                {data.school?.degree && `${data.school?.degree} `}
                {data.school?.degree && data.school?.endYear && " • "}
                {data.school?.endYear &&
                  (data.school?.graduated
                    ? `Graduated in ${data.school?.endYear}`
                    : `${data.school?.startYear} - ${data.school?.endYear}`)}
              </p>
            )}
          </OverviewItemDisplay>

          <OverviewItemDisplay
            item={data.hometown}
            label={"hometown"}
            deleteUrl={`/users/${user.id}/city/${data.hometown?.id}`}
            deleteConfirmName={data.hometown?.name}
            renderEditForm={(handleClose) => (
              <CityForm
                city={data.hometown}
                onSuccess={() => {
                  refetch();
                  handleClose();
                }}
                handleClose={handleClose}
                isHometown={true}
              />
            )}
            refetch={refetch}
          >
            <p>{"From " + data.hometown?.name}</p>
          </OverviewItemDisplay>

          <OverviewItemDisplay
            item={data.currentCity}
            label={"current city"}
            deleteUrl={`/users/${user.id}/city/${data.currentCity?.id}`}
            deleteConfirmName={data.currentCity?.name}
            renderEditForm={(handleClose) => (
              <CityForm
                city={data.currentCity}
                onSuccess={() => {
                  refetch();
                  handleClose();
                }}
                handleClose={handleClose}
                isCurrentCity={true}
              />
            )}
            refetch={refetch}
          >
            <p>{"Lives in " + data.currentCity?.name}</p>
          </OverviewItemDisplay>
        </>
      )}
    </>
  );
}

export default AboutOverview;
