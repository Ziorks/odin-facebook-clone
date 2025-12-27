import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetch from "../../hooks/useDataFetch";
import AboutForm from "../AboutForm";
import AboutDisplay from "../AboutDisplay";
import { CURRENT_YEAR, YEARS } from "../../utils/constants";
// import styles from "./AboutWorkAndEducation.module.css";

function WorkForm({ handleClose, refetch, work }) {
  const { user } = useOutletContext();
  const [company, setCompany] = useState(work?.company ?? "");
  const [position, setPosition] = useState(work?.position ?? "");
  const [location, setLocation] = useState(work?.location ?? "");
  const [description, setDescription] = useState(work?.description ?? "");
  const [currentJob, setCurrentJob] = useState(work?.currentJob ?? true);
  const [startYear, setStartYear] = useState(work?.startYear ?? undefined);
  const [endYear, setEndYear] = useState(work?.endYear ?? undefined);

  const method = work ? "PUT" : "POST";
  const url = `/users/${user.id}/work${work ? "/" + work.id : ""}`;
  const errMsg = `work ${work ? "edit" : "creation"} error`;
  const loadingMsg = `${work ? "Updating" : "Creating"} Work Record...`;

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
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
    >
      <div>
        <label htmlFor="company">Company</label>
        <input
          type="text"
          name="company"
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required={true}
        />
      </div>
      <div>
        <label htmlFor="position">Position</label>
        <input
          type="text"
          name="position"
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="location">City/Town</label>
        <input
          type="text"
          name="location"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <h4>Time Period</h4>
      <div>
        <input
          type="checkbox"
          name="currentJob"
          id="currentJob"
          checked={currentJob}
          onChange={(e) => setCurrentJob(e.target.checked)}
        />
        <label htmlFor="currentJob">I currently work here</label>
      </div>
      <div>
        {currentJob && <span>From </span>}
        <select
          name="startYear"
          id="startYear"
          value={startYear}
          onChange={(e) => setStartYear(+e.target.value || undefined)}
        >
          <option value={0}>Year</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {!currentJob && (
          <>
            <span> to </span>
            <select
              name="endYear"
              id="endYear"
              value={endYear}
              onChange={(e) => setEndYear(+e.target.value || undefined)}
            >
              <option value={0}>Year</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </AboutForm>
  );
}

function WorksDisplay({ works, refetch, isCurrentUser }) {
  const { user } = useOutletContext();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {isCurrentUser &&
        (showForm ? (
          <WorkForm handleClose={() => setShowForm(false)} refetch={refetch} />
        ) : (
          <button onClick={() => setShowForm(true)}>Add a workplace</button>
        ))}
      {works.length > 0 ? (
        <>
          {works.map((work) => (
            <AboutDisplay
              key={work.id}
              refetch={refetch}
              deleteUrl={`/users/${user.id}/work/${work.id}`}
              deleteErrMsg={"work delete error"}
              deleteConfirmMsg={`Are you sure you want to delete '${work.company}' forever?`}
              renderEditForm={(handleClose) => (
                <WorkForm
                  refetch={refetch}
                  handleClose={handleClose}
                  work={work}
                />
              )}
            >
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
            </AboutDisplay>
          ))}
        </>
      ) : (
        <>{!isCurrentUser && <p>No workplaces to show</p>}</>
      )}
    </>
  );
}

function SchoolForm({ handleClose, refetch, school }) {
  const { user } = useOutletContext();
  const [name, setName] = useState(school?.name ?? "");
  const [degree, setDegree] = useState(school?.degree ?? "");
  const [description, setDescription] = useState(school?.description ?? "");
  const [startYear, setStartYear] = useState(school?.startYear ?? undefined);
  const [endYear, setEndYear] = useState(school?.endYear ?? undefined);
  const [graduated, setGraduated] = useState(school?.graduated ?? true);

  const method = school ? "PUT" : "POST";
  const url = `/users/${user.id}/school${school ? "/" + school.id : ""}`;
  const errMsg = `school ${school ? "edit" : "creation"} error`;
  const loadingMsg = `${school ? "Updating" : "Creating"} School Record...`;

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
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
    >
      <div>
        <label htmlFor="name">School</label>
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <input
          type="checkbox"
          name="graduated"
          id="graduated"
          checked={graduated}
          onChange={(e) => setGraduated(e.target.checked)}
        />
        <label htmlFor="graduated">Graduated</label>
      </div>
      <h4>Time Period</h4>
      <div>
        <select
          name="startYear"
          id="startYear"
          value={startYear}
          onChange={(e) => setStartYear(+e.target.value || undefined)}
        >
          <option value={0}>Year</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {startYear && (
          <>
            <span> to </span>
            <select
              name="endYear"
              id="endYear"
              value={endYear}
              onChange={(e) => setEndYear(+e.target.value || undefined)}
            >
              <option value={0}>Year</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="degree">Degree</label>
        <input
          type="text"
          name="degree"
          id="degree"
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
        />
      </div>
    </AboutForm>
  );
}

function SchoolsDisplay({ schools, refetch, isCurrentUser }) {
  const { user } = useOutletContext();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {isCurrentUser &&
        (showForm ? (
          <SchoolForm
            handleClose={() => setShowForm(false)}
            refetch={refetch}
          />
        ) : (
          <button onClick={() => setShowForm(true)}>Add school</button>
        ))}
      {schools.length > 0 ? (
        <>
          {schools.map((school) => (
            <AboutDisplay
              key={school.id}
              refetch={refetch}
              deleteUrl={`/users/${user.id}/school/${school.id}`}
              deleteErrMsg={"school delete error"}
              deleteConfirmMsg={`Are you sure you want to delete '${school.name}' forever?`}
              renderEditForm={(handleClose) => (
                <SchoolForm
                  refetch={refetch}
                  handleClose={handleClose}
                  school={school}
                />
              )}
            >
              <p>
                {`Studie${school.graduated || school.endYear < CURRENT_YEAR ? "d" : "s"} at ${school.name}`}
              </p>
              {school.degree || school.endYear ? (
                <p>
                  {school.degree && `${school.degree} `}
                  {school.endYear &&
                    `${school.degree ? " • " : ""} ${
                      school.graduated
                        ? `Class of ${school.endYear}`
                        : `${school.startYear} - ${school.endYear}`
                    }`}
                </p>
              ) : (
                <></>
              )}
              {school.description && <p>{school.description}</p>}
            </AboutDisplay>
          ))}
        </>
      ) : (
        <>{!isCurrentUser && <p>No schools to show</p>}</>
      )}
    </>
  );
}

function AboutWorkAndEducation() {
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_work_and_education`,
  );

  const isCurrentUser = user.id === auth.user.id;

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          <h3>Work</h3>
          <WorksDisplay
            works={data.works}
            refetch={refetch}
            isCurrentUser={isCurrentUser}
          />
          <h3>Education</h3>
          <SchoolsDisplay
            schools={data.schools}
            refetch={refetch}
            isCurrentUser={isCurrentUser}
          />
        </>
      )}
    </>
  );
}

export default AboutWorkAndEducation;
