import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetch from "../../hooks/useDataFetch";
import AboutForm from "../AboutForm";
import AboutDisplay from "../AboutDisplay";
// import styles from "./AboutContactInfo.module.css";

const currentYear = new Date().getFullYear();
const YEARS = Array.from(
  { length: currentYear - 1900 + 1 },
  (_, i) => currentYear - i,
);
const MONTHS = [
  { name: "January", nDays: 31 },
  { name: "February", nDays: 29 },
  { name: "March", nDays: 31 },
  { name: "April", nDays: 30 },
  { name: "May", nDays: 31 },
  { name: "June", nDays: 30 },
  { name: "July", nDays: 31 },
  { name: "August", nDays: 31 },
  { name: "September", nDays: 30 },
  { name: "October", nDays: 31 },
  { name: "November", nDays: 30 },
  { name: "December", nDays: 31 },
];

function PhoneNumbersForm({ handleClose, refetch, phoneNumbers }) {
  const { user } = useOutletContext();
  const [values, setValues] = useState(phoneNumbers || [""]);

  const method = "PUT";
  const url = `/users/${user.id}/basic_info`;
  const errMsg = "phone numbers edit error";
  const loadingMsg = "Updating Phone Numbers...";

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
      method={method}
      url={url}
      data={{ phoneNumbers: values }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
    >
      {values.map((phoneNumber, i) => {
        const id = "phoneNumber_" + i;
        return (
          <div key={i}>
            <label htmlFor={id}>Phone Number</label>{" "}
            <input
              type="text"
              name={id}
              id={id}
              value={phoneNumber}
              onChange={(e) =>
                setValues((prev) => prev.toSpliced(i, 1, e.target.value))
              }
            />
          </div>
        );
      })}
      {values.length < 5 && (
        <button
          type="button"
          onClick={() => setValues((prev) => [...prev, ""])}
        >
          Add Phone Number
        </button>
      )}
    </AboutForm>
  );
}

function PhoneNumbers({ phoneNumbers, refetch }) {
  const renderEditForm = (handleClose) => (
    <PhoneNumbersForm
      refetch={refetch}
      handleClose={handleClose}
      phoneNumbers={phoneNumbers}
    />
  );

  return (
    <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
      <p>Phone Numbers</p>
      {phoneNumbers.map((phoneNumber, i) => (
        <p key={i}>{phoneNumber}</p>
      ))}
    </AboutDisplay>
  );
}

function EmailsForm({ handleClose, refetch, emails }) {
  const { user } = useOutletContext();
  const [values, setValues] = useState(emails || [""]);

  const method = "PUT";
  const url = `/users/${user.id}/basic_info`;
  const errMsg = "emails edit error";
  const loadingMsg = "Updating Emails...";

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
      method={method}
      url={url}
      data={{ emails: values }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
    >
      {values.map((email, i) => {
        const id = "email_" + i;
        return (
          <div key={i}>
            <label htmlFor={id}>Email</label>{" "}
            <input
              type="text"
              name={id}
              id={id}
              value={email}
              onChange={(e) =>
                setValues((prev) => prev.toSpliced(i, 1, e.target.value))
              }
            />
          </div>
        );
      })}
      {values.length < 5 && (
        <button
          type="button"
          onClick={() => setValues((prev) => [...prev, ""])}
        >
          Add Email
        </button>
      )}
    </AboutForm>
  );
}

function Emails({ emails, refetch }) {
  const renderEditForm = (handleClose) => (
    <EmailsForm refetch={refetch} handleClose={handleClose} emails={emails} />
  );

  return (
    <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
      <p>Email Addresses</p>
      {emails.map((email, i) => (
        <p key={i}>{email}</p>
      ))}
    </AboutDisplay>
  );
}

function WebsitesForm({ handleClose, refetch, websites }) {
  const { user } = useOutletContext();
  const [values, setValues] = useState(websites || [""]);

  const method = "PUT";
  const url = `/users/${user.id}/basic_info`;
  const errMsg = "websites edit error";
  const loadingMsg = "Updating Websites...";

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
      method={method}
      url={url}
      data={{ websites: values }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
    >
      {values.map((website, i) => {
        const id = "website_" + i;
        return (
          <div key={i}>
            <label htmlFor={id}>Website</label>{" "}
            <input
              type="text"
              name={id}
              id={id}
              value={website}
              onChange={(e) =>
                setValues((prev) => prev.toSpliced(i, 1, e.target.value))
              }
            />
          </div>
        );
      })}
      {values.length < 5 && (
        <button
          type="button"
          onClick={() => setValues((prev) => [...prev, ""])}
        >
          Add Website
        </button>
      )}
    </AboutForm>
  );
}

function Websites({ websites, refetch }) {
  const renderEditForm = (handleClose) => (
    <WebsitesForm
      refetch={refetch}
      handleClose={handleClose}
      websites={websites}
    />
  );

  return (
    <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
      <p>Websites</p>
      {websites.map((website, i) => (
        <p key={i}>{website}</p>
      ))}
    </AboutDisplay>
  );
}

function SocialLinksForm({ handleClose, refetch, socialLinks }) {
  const { user } = useOutletContext();
  const [values, setValues] = useState(socialLinks || [""]);

  const method = "PUT";
  const url = `/users/${user.id}/basic_info`;
  const errMsg = "social links edit error";
  const loadingMsg = "Updating Social Links...";

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
      method={method}
      url={url}
      data={{ socialLinks: values }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
    >
      {values.map((socialLink, i) => {
        const id = "socialLink_" + i;
        return (
          <div key={i}>
            <label htmlFor={id}>Social Link</label>{" "}
            <input
              type="text"
              name={id}
              id={id}
              value={socialLink}
              onChange={(e) =>
                setValues((prev) => prev.toSpliced(i, 1, e.target.value))
              }
            />
          </div>
        );
      })}
      {values.length < 5 && (
        <button
          type="button"
          onClick={() => setValues((prev) => [...prev, ""])}
        >
          Add Social Link
        </button>
      )}
    </AboutForm>
  );
}

function SocialLinks({ socialLinks, refetch }) {
  const renderEditForm = (handleClose) => (
    <SocialLinksForm
      refetch={refetch}
      handleClose={handleClose}
      socialLinks={socialLinks}
    />
  );

  return (
    <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
      <p>Social Links</p>
      {socialLinks.map((socialLink, i) => (
        <p key={i}>{socialLink}</p>
      ))}
    </AboutDisplay>
  );
}

function GenderForm({ handleClose, refetch, gender }) {
  const { user } = useOutletContext();
  const [value, setValue] = useState(gender ?? undefined);

  const method = "PUT";
  const url = `/users/${user.id}/basic_info`;
  const errMsg = `gender edit error`;
  const loadingMsg = "Updating Gender...";

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
      method={method}
      url={url}
      data={{ gender: value || null }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
    >
      <div>
        <label htmlFor="value">Gender</label>
        <select
          name="value"
          id="value"
          value={value}
          onChange={(e) => setValue(e.target.value || undefined)}
        >
          <option value={""}>Gender</option>
          <option value={"MALE"}>Male</option>
          <option value={"FEMALE"}>Female</option>
          <option value={"OTHER"}>Other</option>
        </select>
      </div>
    </AboutForm>
  );
}

function Gender({ gender, refetch }) {
  const formattedGender =
    gender.slice(0, 1).toUpperCase() + gender.slice(1).toLowerCase();
  const renderEditForm = (handleClose) => (
    <GenderForm refetch={refetch} handleClose={handleClose} gender={gender} />
  );

  return (
    <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
      <p>{formattedGender}</p>
      <p>Gender</p>
    </AboutDisplay>
  );
}

function BirthdayForm({ handleClose, refetch, birthday }) {
  const { user } = useOutletContext();
  const [month, setMonth] = useState(birthday?.month ?? undefined);
  const [day, setDay] = useState(birthday?.day ?? undefined);
  const [year, setYear] = useState(birthday?.year ?? undefined);

  const method = "PUT";
  const url = `/users/${user.id}/basic_info`;
  const errMsg = "birthday edit error";
  const loadingMsg = "Updating Birthday...";

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
      method={method}
      url={url}
      data={{
        birthday: {
          month: month || null,
          day: day || null,
          year: year || null,
        },
      }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
    >
      <div>
        <label htmlFor="month">Month</label>
        <select
          name="month"
          id="month"
          value={month}
          onChange={(e) => {
            const value = +e.target.value || undefined;
            const nDays = value ? MONTHS[value - 1].nDays : undefined;
            setMonth(value);
            if (day > nDays || !value) {
              setDay(nDays);
            }
          }}
        >
          <option value={""}>Month</option>
          {MONTHS.map((month, i) => (
            <option key={i} value={i + 1}>
              {month.name}
            </option>
          ))}
        </select>
      </div>
      {month && (
        <div>
          <label htmlFor="day">Day</label>
          <select
            name="day"
            id="day"
            value={day}
            onChange={(e) => setDay(+e.target.value || undefined)}
          >
            <option value={""}>Day</option>
            {Array.from({ length: MONTHS[month - 1].nDays }).map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="year">Year</label>
        <select
          name="year"
          id="year"
          value={year}
          onChange={(e) => setYear(+e.target.value || undefined)}
        >
          <option value={""}>Year</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </AboutForm>
  );
}

function Birthday({ birthday, refetch }) {
  const renderEditForm = (handleClose) => (
    <BirthdayForm
      refetch={refetch}
      handleClose={handleClose}
      birthday={birthday}
    />
  );

  return (
    <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
      <p>
        {birthday.month && MONTHS[birthday.month - 1].name}
        {birthday.day && ` ${birthday.day}`}
        {birthday.month && birthday.year && ", "}
        {birthday.year}
      </p>
      <p>Birthday</p>
    </AboutDisplay>
  );
}

function LanguagesForm({ handleClose, refetch, languages }) {
  const { user } = useOutletContext();
  const [values, setValues] = useState(languages || [""]);

  const method = "PUT";
  const url = `/users/${user.id}/basic_info`;
  const errMsg = "languages edit error";
  const loadingMsg = "Updating Languages...";

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
      method={method}
      url={url}
      data={{ languages: values }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
    >
      {values.map((language, i) => {
        const id = "language_" + i;
        return (
          <div key={i}>
            <label htmlFor={id}>Language</label>{" "}
            <input
              type="text"
              name={id}
              id={id}
              value={language}
              onChange={(e) =>
                setValues((prev) => prev.toSpliced(i, 1, e.target.value))
              }
            />
          </div>
        );
      })}
      {values.length < 20 && (
        <button
          type="button"
          onClick={() => setValues((prev) => [...prev, ""])}
        >
          Add Language
        </button>
      )}
    </AboutForm>
  );
}

function Languages({ languages, refetch }) {
  const renderEditForm = (handleClose) => (
    <LanguagesForm
      refetch={refetch}
      handleClose={handleClose}
      languages={languages}
    />
  );

  return (
    <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
      <p>Languages</p>
      {languages.map((language, i) => (
        <p key={i}>{language}</p>
      ))}
    </AboutDisplay>
  );
}

function AboutContactInfo() {
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_contact_info`,
  );
  const [showGenderForm, setShowGenderForm] = useState(false);
  const [showBirthdayForm, setShowBirthdayForm] = useState(false);
  const [showPhoneNumbersForm, setShowPhoneNumbersForm] = useState(false);
  const [showEmailsForm, setShowEmailsForm] = useState(false);
  const [showWebsitesForm, setShowWebsitesForm] = useState(false);
  const [showSocialLinksForm, setShowSocialLinksForm] = useState(false);
  const [showLanguagesForm, setShowLanguagesForm] = useState(false);

  const isCurrentUser = user.id === auth.user.id;

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          <h3>Contact info</h3>
          {data.phoneNumbers.length > 0 ? (
            <PhoneNumbers refetch={refetch} phoneNumbers={data.phoneNumbers} />
          ) : isCurrentUser ? (
            showPhoneNumbersForm ? (
              <PhoneNumbersForm
                handleClose={() => setShowPhoneNumbersForm(false)}
                refetch={refetch}
              />
            ) : (
              <button onClick={() => setShowPhoneNumbersForm(true)}>
                Add a Phone Number
              </button>
            )
          ) : (
            <p>No phone number information</p>
          )}

          {data.emails.length > 0 ? (
            <Emails refetch={refetch} emails={data.emails} />
          ) : isCurrentUser ? (
            showEmailsForm ? (
              <EmailsForm
                handleClose={() => setShowEmailsForm(false)}
                refetch={refetch}
              />
            ) : (
              <button onClick={() => setShowEmailsForm(true)}>
                Add an Email
              </button>
            )
          ) : (
            <p>No email information</p>
          )}

          <h3>Websites and social links</h3>
          {data.websites.length > 0 ? (
            <Websites refetch={refetch} websites={data.websites} />
          ) : isCurrentUser ? (
            showWebsitesForm ? (
              <WebsitesForm
                handleClose={() => setShowWebsitesForm(false)}
                refetch={refetch}
              />
            ) : (
              <button onClick={() => setShowWebsitesForm(true)}>
                Add a Website
              </button>
            )
          ) : (
            <p>No website information</p>
          )}

          {data.socialLinks.length > 0 ? (
            <SocialLinks refetch={refetch} socialLinks={data.socialLinks} />
          ) : isCurrentUser ? (
            showSocialLinksForm ? (
              <SocialLinksForm
                handleClose={() => setShowSocialLinksForm(false)}
                refetch={refetch}
              />
            ) : (
              <button onClick={() => setShowSocialLinksForm(true)}>
                Add a Social Link
              </button>
            )
          ) : (
            <p>No social link information</p>
          )}

          <h3>Basic info</h3>
          {data.gender ? (
            <Gender refetch={refetch} gender={data.gender} />
          ) : (
            isCurrentUser &&
            (showGenderForm ? (
              <GenderForm
                handleClose={() => setShowGenderForm(false)}
                refetch={refetch}
              />
            ) : (
              <button onClick={() => setShowGenderForm(true)}>
                Add your gender
              </button>
            ))
          )}

          {data.birthday.month || data.birthday.year ? (
            <Birthday refetch={refetch} birthday={data.birthday} />
          ) : (
            isCurrentUser &&
            (showBirthdayForm ? (
              <BirthdayForm
                handleClose={() => setShowBirthdayForm(false)}
                refetch={refetch}
              />
            ) : (
              <button onClick={() => setShowBirthdayForm(true)}>
                Add your birthday
              </button>
            ))
          )}

          {data.languages.length > 0 ? (
            <Languages refetch={refetch} languages={data.languages} />
          ) : isCurrentUser ? (
            showLanguagesForm ? (
              <LanguagesForm
                handleClose={() => setShowLanguagesForm(false)}
                refetch={refetch}
              />
            ) : (
              <button onClick={() => setShowLanguagesForm(true)}>
                Add a Language
              </button>
            )
          ) : (
            <p>No language information</p>
          )}
        </>
      )}
    </>
  );
}

export default AboutContactInfo;
