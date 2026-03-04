import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaCity, FaUserGraduate } from "react-icons/fa6";
import { IoBriefcaseOutline, IoSchoolOutline } from "react-icons/io5";
import { CURRENT_YEAR, YEARS } from "../../utils/constants";
import useDataFetch from "../../hooks/useDataFetch";
import AboutForm from "../AboutForm";
import FormInput from "../FormInput";
import AboutDisplay from "../AboutDisplay";
import styles from "./AboutWorkAndEducation.module.css";

export function WorkForm({ handleClose, onSuccess, work }) {
  const { user } = useOutletContext();
  const [company, setCompany] = useState(work?.company ?? "");
  const [position, setPosition] = useState(work?.position ?? "");
  const [location, setLocation] = useState(work?.location ?? "");
  const [description, setDescription] = useState(work?.description ?? "");
  const [currentJob, setCurrentJob] = useState(work?.currentJob ?? true);
  const [startYear, setStartYear] = useState(work?.startYear ?? undefined);
  const [endYear, setEndYear] = useState(work?.endYear ?? undefined);
  const [changesMade, setChangesMade] = useState(false);

  const method = work ? "PUT" : "POST";
  const url = `/users/${user.id}/work${work ? "/" + work.id : ""}`;
  const errMsg = `work ${work ? "edit" : "creation"} error`;
  const loadingMsg = `${work ? "Updating" : "Creating"} Work Record...`;

  return (
    <AboutForm
      handleClose={handleClose}
      onSuccess={onSuccess}
      method={method}
      url={url}
      data={{
        company,
        position: position || null,
        location: location || null,
        description: description || null,
        currentJob,
        startYear: startYear || null,
        endYear: currentJob ? null : endYear || null,
      }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
      disableSave={!changesMade}
    >
      <div className={styles.formContentContainer}>
        <FormInput
          label="Company"
          type="text"
          value={company}
          autoComplete="off"
          required={true}
          onChange={(e) => {
            setCompany(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
        />
        <FormInput
          label="Position"
          type="text"
          value={position}
          autoComplete="off"
          onChange={(e) => {
            setPosition(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
        />
        <h4>Time Period</h4>
        <FormInput
          type="checkbox"
          label="I currently work here"
          value={currentJob}
          onChange={(e) => {
            setCurrentJob(e.target.checked);
            if (!changesMade) setChangesMade(true);
          }}
        />
        <div className={styles.selectInputContainer}>
          {currentJob && <span>From </span>}
          <FormInput
            type="select"
            value={startYear}
            onChange={(e) => {
              setStartYear(+e.target.value || undefined);
              if (!changesMade) setChangesMade(true);
            }}
          >
            <option value={0}>Year</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </FormInput>
          {!currentJob && (
            <>
              <span>to</span>
              <FormInput
                type="select"
                value={endYear}
                onChange={(e) => {
                  setEndYear(+e.target.value || undefined);
                  if (!changesMade) setChangesMade(true);
                }}
              >
                <option value={0}>Year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </FormInput>
            </>
          )}
        </div>
        <FormInput
          label="City / Town"
          type="text"
          value={location}
          autoComplete="off"
          onChange={(e) => {
            setLocation(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
        />
        <FormInput
          label="Description"
          type="textarea"
          maxLength={256}
          value={description}
          autoComplete="off"
          onChange={(e) => {
            setDescription(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
        />
      </div>
    </AboutForm>
  );
}

function WorksDisplay({ works, refetch }) {
  const { user, isCurrentUser } = useOutletContext();
  const [showForm, setShowForm] = useState(false);

  const handleClose = () => setShowForm(false);
  const onSuccess = () => {
    refetch();
    handleClose();
  };
  const getRenderEditForm = (work) => {
    return (handleClose) => (
      <WorkForm
        onSuccess={() => {
          refetch();
          handleClose();
        }}
        handleClose={handleClose}
        work={work}
      />
    );
  };

  return (
    <>
      {works.length > 0 ? (
        <>
          {works.map((work) => (
            <AboutDisplay
              key={work.id}
              onDelete={refetch}
              deleteUrl={`/users/${user.id}/work/${work.id}`}
              deleteErrMsg={"work delete error"}
              deleteConfirmMsg={`Are you sure you want to remove '${work.company}' from your profile?`}
              renderEditForm={getRenderEditForm(work)}
            >
              <div className={styles.displayContentContainer}>
                <FaCity />
                <div>
                  <p>
                    {work.position && `${work.position} at `}
                    {work.company}
                  </p>
                  {work.startYear && (
                    <p>
                      {work.startYear} - {work.endYear || "Present"}
                    </p>
                  )}
                  {work.description && <p>{work.description}</p>}
                </div>
              </div>
            </AboutDisplay>
          ))}
        </>
      ) : (
        <>{!isCurrentUser && <p>No workplaces to show</p>}</>
      )}
      {isCurrentUser &&
        (showForm ? (
          <WorkForm handleClose={handleClose} onSuccess={onSuccess} />
        ) : (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            <IoBriefcaseOutline />
            Work Experience
          </button>
        ))}
    </>
  );
}

export function SchoolForm({ handleClose, onSuccess, school }) {
  const { user } = useOutletContext();
  const [name, setName] = useState(school?.name ?? "");
  const [degree, setDegree] = useState(school?.degree ?? "");
  const [description, setDescription] = useState(school?.description ?? "");
  const [startYear, setStartYear] = useState(school?.startYear ?? undefined);
  const [endYear, setEndYear] = useState(school?.endYear ?? undefined);
  const [graduated, setGraduated] = useState(school?.graduated ?? true);
  const [changesMade, setChangesMade] = useState(false);

  const method = school ? "PUT" : "POST";
  const url = `/users/${user.id}/school${school ? "/" + school.id : ""}`;
  const errMsg = `school ${school ? "edit" : "creation"} error`;
  const loadingMsg = `${school ? "Updating" : "Creating"} School Record...`;

  return (
    <AboutForm
      handleClose={handleClose}
      onSuccess={onSuccess}
      method={method}
      url={url}
      data={{
        name,
        degree: degree || null,
        description: description || null,
        startYear: startYear || null,
        endYear: startYear ? endYear || null : null,
        graduated,
      }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
      disableSave={!changesMade}
    >
      <div className={styles.formContentContainer}>
        <FormInput
          label="School"
          type="text"
          value={name}
          required={true}
          autoComplete="off"
          onChange={(e) => {
            setName(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
        />
        <div className={styles.selectInputContainer}>
          <FormInput
            type="select"
            value={startYear}
            onChange={(e) => {
              setStartYear(+e.target.value || undefined);
              if (!changesMade) setChangesMade(true);
            }}
          >
            <option value={0}>Year</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </FormInput>
          {startYear && (
            <>
              <span>to</span>
              <FormInput
                type="select"
                value={endYear}
                onChange={(e) => {
                  setEndYear(+e.target.value || undefined);
                  if (!changesMade) setChangesMade(true);
                }}
              >
                <option value={0}>Year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </FormInput>
            </>
          )}
        </div>
        <FormInput
          type="checkbox"
          label="Graduated"
          value={graduated}
          onChange={(e) => {
            setGraduated(e.target.checked);
            if (!changesMade) setChangesMade(true);
          }}
        />
        <FormInput
          label="Degree"
          type="text"
          value={degree}
          autoComplete="off"
          onChange={(e) => {
            setDegree(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
        />
        <FormInput
          label="Description"
          type="textarea"
          maxLength={256}
          value={description}
          autoComplete="off"
          onChange={(e) => {
            setDescription(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
        />
      </div>
    </AboutForm>
  );
}

function SchoolsDisplay({ schools, refetch }) {
  const { user, isCurrentUser } = useOutletContext();
  const [showForm, setShowForm] = useState(false);

  const handleClose = () => setShowForm(false);
  const onSuccess = () => {
    refetch();
    handleClose();
  };
  const getRenderEditForm = (school) => {
    return (handleClose) => (
      <SchoolForm
        onSuccess={() => {
          refetch();
          handleClose();
        }}
        handleClose={handleClose}
        school={school}
      />
    );
  };

  return (
    <>
      {schools.length > 0 ? (
        <>
          {schools.map((school) => (
            <AboutDisplay
              key={school.id}
              onDelete={refetch}
              deleteUrl={`/users/${user.id}/school/${school.id}`}
              deleteErrMsg={"school delete error"}
              deleteConfirmMsg={`Are you sure you want to remove '${school.name}' from your profile?`}
              renderEditForm={getRenderEditForm(school)}
            >
              <div className={styles.displayContentContainer}>
                <FaUserGraduate />
                <div>
                  <p>
                    {`Studie${school.graduated || school.endYear < CURRENT_YEAR ? "d" : "s"} at ${school.name}`}
                  </p>
                  {(school.degree || school.endYear) && (
                    <p>
                      {school.degree && `${school.degree} `}
                      {school.endYear &&
                        `${school.degree ? " • " : ""} ${
                          school.graduated
                            ? `Class of ${school.endYear}`
                            : `${school.startYear} - ${school.endYear}`
                        }`}
                    </p>
                  )}
                  {school.description && <p>{school.description}</p>}
                </div>
              </div>
            </AboutDisplay>
          ))}
        </>
      ) : (
        <>{!isCurrentUser && <p>No schools to show</p>}</>
      )}
      {isCurrentUser &&
        (showForm ? (
          <SchoolForm handleClose={handleClose} onSuccess={onSuccess} />
        ) : (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            <IoSchoolOutline />
            School
          </button>
        ))}
    </>
  );
}

function AboutWorkAndEducation() {
  const { user } = useOutletContext();
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_work_and_education`,
  );

  return (
    <div className={styles.primaryContainer}>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          <h3>Work</h3>
          <WorksDisplay works={data.works} refetch={refetch} />
          <h3>Education</h3>
          <SchoolsDisplay schools={data.schools} refetch={refetch} />
        </>
      )}
    </div>
  );
}

export default AboutWorkAndEducation;
