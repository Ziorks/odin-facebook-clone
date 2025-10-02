require("dotenv").config();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await db.getUserById(payload.sub);
        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      let user = await db.getUserByUsername(username);
      if (!user) {
        user = await db.getUserByEmail(username.toLowerCase());
      }
      if (!user) {
        return done(null, false, { message: "Username/Email not found" });
      }

      if (!user.password) {
        return done(null, false, { message: "User must sign in with OAuth" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect Password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

async function findOrCreateUser(
  providerId,
  provider,
  username,
  email,
  verified,
  done,
  { avatar, firstName, lastName } = {}
) {
  email = email && email.toLowerCase();

  try {
    const credentials = await db.getFederatedCredentials(providerId, provider);

    //credentials exist => return associated user
    if (credentials) {
      return done(null, credentials.user);
    }

    //verified email => check for existing user with that email
    if (email && verified) {
      const user = await db.getUserByEmail(email);

      //user found => store credentials and associate user
      if (user) {
        await db.createFederatedCredentials(providerId, provider, user.id);
        return done(null, user);
      }
    }

    //no stored credentials AND no user with verified email => create user and create credentials
    const user = await db.createUser(
      username, //TODO:make username unique if already exists OR random generate username OR let user pick username
      undefined,
      verified ? email : undefined
    );
    await db.createProfile(user.id, { avatar, firstName, lastName });
    await db.createFederatedCredentials(providerId, provider, user.id);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_ORIGIN}/api/v1/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      const {
        sub,
        name,
        email,
        email_verified,
        picture,
        given_name,
        family_name,
      } = profile._json;

      findOrCreateUser(
        sub,
        profile.provider,
        name,
        email,
        email_verified,
        done,
        { avatar: picture, firstName: given_name, lastName: family_name }
      );
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_ORIGIN}/api/v1/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, provider, username, _json } = profile;
      const { email, avatar_url, name } = _json;
      const [firstName, lastName] = name.split(" ");

      findOrCreateUser(id, provider, username, email, true, done, {
        avatar: avatar_url,
        firstName,
        lastName,
      });
    }
  )
);
