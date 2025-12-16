import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetch from "../../hooks/useDataFetch";
import useApiPrivate from "../../hooks/useApiPrivate";
import Modal from "../Modal";
// import styles from "./AboutWorkAndEducation.module.css";

const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: currentYear - 1900 + 1 },
  (_, i) => currentYear - i,
);

function WorkForm({ handleClose, refetch, work }) {
  const api = useApiPrivate();
  const { user } = useOutletContext();
  const [company, setCompany] = useState(work?.company ?? "");
  const [position, setPosition] = useState(work?.position ?? "");
  const [location, setLocation] = useState(work?.location ?? "");
  const [description, setDescription] = useState(work?.description ?? "");
  const [currentJob, setCurrentJob] = useState(work?.currentJob ?? true);
  const [startYear, setStartYear] = useState(work?.startYear ?? undefined);
  const [endYear, setEndYear] = useState(work?.endYear ?? undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors(null);
    setIsLoading(true);

    api({
      method: work ? "PUT" : "POST",
      url: `/users/${user.id}/work${work ? "/" + work.id : ""}`,
      data: {
        company,
        position,
        location,
        description,
        currentJob,
        startYear,
        endYear: currentJob ? undefined : endYear,
      },
    })
      .then(() => {
        refetch();
        handleClose();
      })
      .catch((err) => {
        console.error(`work ${work ? "edit" : "creation"} error`, err);

        if (err.response?.status === 400) {
          setErrors(err.response.data.errors);
        } else {
          setErrors([
            { msg: err.response?.data?.message || "Something went wrong." },
          ]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {isLoading && <p>Creating Work Record...</p>}
      {errors && (
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error.msg}</li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="company">Company</label>
          <input
            type="text"
            name="company"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
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
            {years.map((year) => (
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
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
        <div>
          <button onClick={handleClose}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </>
  );
}

function SchoolForm({ handleClose, refetch, school }) {
  const api = useApiPrivate();
  const { user } = useOutletContext();
  const [name, setName] = useState(school?.name ?? "");
  const [description, setDescription] = useState(school?.description ?? "");
  const [degree, setDegree] = useState(school?.degree ?? "");
  const [startYear, setStartYear] = useState(school?.startYear ?? undefined);
  const [endYear, setEndYear] = useState(school?.endYear ?? undefined);
  const [graduated, setGraduated] = useState(school?.graduated ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors(null);
    setIsLoading(true);

    api({
      method: school ? "PUT" : "POST",
      url: `/users/${user.id}/school${school ? "/" + school.id : ""}`,
      data: {
        name,
        description,
        degree,
        startYear,
        endYear: startYear ? endYear : undefined,
        graduated,
      },
    })
      .then(() => {
        refetch();
        handleClose();
      })
      .catch((err) => {
        console.error(`school ${school ? "edit" : "creation"} error`, err);

        if (err.response?.status === 400) {
          setErrors(err.response.data.errors);
        } else {
          setErrors([
            { msg: err.response?.data?.message || "Something went wrong." },
          ]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {isLoading && <p>Creating Work Record...</p>}
      {errors && (
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error.msg}</li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit}>
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
            {years.map((year) => (
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
                {years.map((year) => (
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
        <div>
          <button onClick={handleClose}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </>
  );
}

function Work({ refetch, work }) {
  const api = useApiPrivate();
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = () => {
    setError(null);
    setIsLoading(true);

    api
      .delete(`/users/${user.id}/work/${work.id}`)
      .then(() => {
        refetch();
      })
      .catch((err) => {
        console.error(`work delete error`, err);

        setError(err.response?.data?.message || "Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {showDeleteModal && (
        <Modal handleClose={() => setShowDeleteModal(false)}>
          <p>Are you sure you want to delete '{work.company}' forever?</p>
          <div>
            <button onClick={handleDelete} disabled={isLoading}>
              DELETE
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
          {isLoading && <p>Deleting...</p>}
          {error && <p>An error occured. Please try again.</p>}
        </Modal>
      )}
      {showEditForm ? (
        <WorkForm
          handleClose={() => setShowEditForm(false)}
          refetch={refetch}
          work={work}
        />
      ) : (
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
          {auth.user.id === user.id && (
            <>
              <button onClick={() => setShowEditForm(true)}>Edit</button>
              <button onClick={() => setShowDeleteModal(true)}>Delete</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

function School({ refetch, school }) {
  const api = useApiPrivate();
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = () => {
    setError(null);
    setIsLoading(true);

    api
      .delete(`/users/${user.id}/school/${school.id}`)
      .then(() => {
        refetch();
      })
      .catch((err) => {
        console.error(`school delete error`, err);

        setError(err.response?.data?.message || "Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {showDeleteModal && (
        <Modal handleClose={() => setShowDeleteModal(false)}>
          <p>Are you sure you want to delete '{school.name}' forever?</p>
          <div>
            <button onClick={handleDelete} disabled={isLoading}>
              DELETE
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
          {isLoading && <p>Deleting...</p>}
          {error && <p>An error occured. Please try again.</p>}
        </Modal>
      )}
      {showEditForm ? (
        <SchoolForm
          handleClose={() => setShowEditForm(false)}
          refetch={refetch}
          school={school}
        />
      ) : (
        <div>
          <p>
            {`Studie${school.graduated || school.endYear < currentYear ? "d" : "s"} at ${school.name}`}
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
          {auth.user.id === user.id && (
            <>
              <button onClick={() => setShowEditForm(true)}>Edit</button>
              <button onClick={() => setShowDeleteModal(true)}>Delete</button>
            </>
          )}
        </div>
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
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [showSchoolForm, setShowSchoolForm] = useState(false);

  const isCurrentUser = user.id === auth.user.id;

  return (
    <>
      <h3>Work</h3>
      {isCurrentUser &&
        (showWorkForm ? (
          <WorkForm
            handleClose={() => setShowWorkForm(false)}
            refetch={refetch}
          />
        ) : (
          <button onClick={() => setShowWorkForm(true)}>Add a workplace</button>
        ))}
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data &&
        (data.works.length > 0 ? (
          data.works.map((work) => (
            <Work key={work.id} refetch={refetch} work={work} />
          ))
        ) : (
          <p>No work information</p>
        ))}
      <h3>School</h3>
      {isCurrentUser &&
        (showSchoolForm ? (
          <SchoolForm
            handleClose={() => setShowSchoolForm(false)}
            refetch={refetch}
          />
        ) : (
          <button onClick={() => setShowSchoolForm(true)}>Add school</button>
        ))}
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data &&
        (data.schools.length > 0 ? (
          data.schools.map((school) => (
            <School key={school.id} refetch={refetch} school={school} />
          ))
        ) : (
          <p>No education information</p>
        ))}
    </>
  );
}

export default AboutWorkAndEducation;
