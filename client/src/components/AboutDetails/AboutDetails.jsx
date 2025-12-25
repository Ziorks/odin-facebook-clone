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

function Detail({ detail, label, fieldName, refetch }) {
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
    <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
      <p>{detail}</p>
    </AboutDisplay>
  );
}

function AboutDetails() {
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_details`,
  );
  const [showAboutMeForm, setShowAboutMeForm] = useState(false);
  const [showQuotesForm, setShowQuotesForm] = useState(false);
  const [showMusicForm, setShowMusicForm] = useState(false);
  const [showBooksForm, setShowBooksForm] = useState(false);
  const [showTvForm, setShowTvForm] = useState(false);
  const [showMoviesForm, setShowMoviesForm] = useState(false);
  const [showSportsForm, setShowSportsForm] = useState(false);
  const [showHobbiesForm, setShowHobbiesForm] = useState(false);

  const isCurrentUser = user.id === auth.user.id;

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          <h3>About {isCurrentUser ? "you" : user.username}</h3>
          {data.aboutMe ? (
            <Detail
              refetch={refetch}
              detail={data.aboutMe}
              label={"About Me"}
              fieldName={"aboutMe"}
            />
          ) : isCurrentUser ? (
            showAboutMeForm ? (
              <DetailForm
                handleClose={() => setShowAboutMeForm(false)}
                refetch={refetch}
                label={"About Me"}
                fieldName={"aboutMe"}
              />
            ) : (
              <button onClick={() => setShowAboutMeForm(true)}>
                Add an about me
              </button>
            )
          ) : (
            <p>No about me to show</p>
          )}

          <h3>Favorite quotes</h3>
          {data.quotes ? (
            <Detail
              refetch={refetch}
              detail={data.quotes}
              label={"Quotes"}
              fieldName={"quotes"}
            />
          ) : isCurrentUser ? (
            showQuotesForm ? (
              <DetailForm
                handleClose={() => setShowQuotesForm(false)}
                refetch={refetch}
                label={"Quotes"}
                fieldName={"quotes"}
              />
            ) : (
              <button onClick={() => setShowQuotesForm(true)}>
                Add your favorite quotations
              </button>
            )
          ) : (
            <p>No quotes to show</p>
          )}

          <h3>Music</h3>
          {data.music ? (
            <Detail
              refetch={refetch}
              detail={data.music}
              label={"Music"}
              fieldName={"music"}
            />
          ) : isCurrentUser ? (
            showMusicForm ? (
              <DetailForm
                handleClose={() => setShowMusicForm(false)}
                refetch={refetch}
                label={"Music"}
                fieldName={"music"}
              />
            ) : (
              <button onClick={() => setShowMusicForm(true)}>
                Add your favorite music
              </button>
            )
          ) : (
            <p>No music to show</p>
          )}

          <h3>Books</h3>
          {data.books ? (
            <Detail
              refetch={refetch}
              detail={data.books}
              label={"Books"}
              fieldName={"books"}
            />
          ) : isCurrentUser ? (
            showBooksForm ? (
              <DetailForm
                handleClose={() => setShowBooksForm(false)}
                refetch={refetch}
                label={"Books"}
                fieldName={"books"}
              />
            ) : (
              <button onClick={() => setShowBooksForm(true)}>
                Add your favorite books
              </button>
            )
          ) : (
            <p>No books to show</p>
          )}

          <h3>TV</h3>
          {data.tv ? (
            <Detail
              refetch={refetch}
              detail={data.tv}
              label={"TV"}
              fieldName={"tv"}
            />
          ) : isCurrentUser ? (
            showTvForm ? (
              <DetailForm
                handleClose={() => setShowTvForm(false)}
                refetch={refetch}
                label={"TV"}
                fieldName={"tv"}
              />
            ) : (
              <button onClick={() => setShowTvForm(true)}>
                Add your favorite tv shows
              </button>
            )
          ) : (
            <p>No tv shows to show</p>
          )}

          <h3>Movies</h3>
          {data.movies ? (
            <Detail
              refetch={refetch}
              detail={data.movies}
              label={"Movies"}
              fieldName={"movies"}
            />
          ) : isCurrentUser ? (
            showMoviesForm ? (
              <DetailForm
                handleClose={() => setShowMoviesForm(false)}
                refetch={refetch}
                label={"Movies"}
                fieldName={"movies"}
              />
            ) : (
              <button onClick={() => setShowMoviesForm(true)}>
                Add your favorite movies
              </button>
            )
          ) : (
            <p>No movies to show</p>
          )}

          <h3>Sports</h3>
          {data.sports ? (
            <Detail
              refetch={refetch}
              detail={data.sports}
              label={"Sports"}
              fieldName={"sports"}
            />
          ) : isCurrentUser ? (
            showSportsForm ? (
              <DetailForm
                handleClose={() => setShowSportsForm(false)}
                refetch={refetch}
                label={"Sports"}
                fieldName={"sports"}
              />
            ) : (
              <button onClick={() => setShowSportsForm(true)}>
                Add your favorite sports teams/players
              </button>
            )
          ) : (
            <p>No sports to show</p>
          )}

          <h3>Hobbies</h3>
          {data.hobbies ? (
            <Detail
              refetch={refetch}
              detail={data.hobbies}
              label={"Hobbies and interests"}
              fieldName={"hobbies"}
            />
          ) : isCurrentUser ? (
            showHobbiesForm ? (
              <DetailForm
                handleClose={() => setShowHobbiesForm(false)}
                refetch={refetch}
                label={"Hobbies and interests"}
                fieldName={"hobbies"}
              />
            ) : (
              <button onClick={() => setShowHobbiesForm(true)}>
                Add your hobbies and interests
              </button>
            )
          ) : (
            <p>No hobbies to show</p>
          )}
        </>
      )}
    </>
  );
}

export default AboutDetails;
