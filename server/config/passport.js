import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import logger from '../utils/logger.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/v1/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found from Google profile'), null);
        }

        let user = await User.findOne({
          $or: [{ email }, { provider: 'google', providerId: profile.id }],
        });

        if (user) {
          // Update existing user
          user.provider = 'google';
          user.providerId = profile.id;
          user.isEmailVerified = true;
          user.lastLogin = new Date();
          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save({ validateBeforeSave: false });
        } else {
          // Create new user
          user = await User.create({
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value || '',
            provider: 'google',
            providerId: profile.id,
            isEmailVerified: true,
            lastLogin: new Date(),
          });

          // Create empty profile
          await Profile.create({ user: user._id });
        }

        return done(null, user);
      } catch (error) {
        logger.error(`Google OAuth error: ${error.message}`);
        return done(error, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/v1/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.find((e) => e.primary)?.value ||
          profile.emails?.[0]?.value ||
          `${profile.username}@github.com`;

        let user = await User.findOne({
          $or: [{ email }, { provider: 'github', providerId: profile.id }],
        });

        if (user) {
          user.provider = 'github';
          user.providerId = String(profile.id);
          user.isEmailVerified = true;
          user.lastLogin = new Date();
          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save({ validateBeforeSave: false });
        } else {
          user = await User.create({
            name: profile.displayName || profile.username,
            email,
            avatar: profile.photos?.[0]?.value || '',
            provider: 'github',
            providerId: String(profile.id),
            isEmailVerified: true,
            lastLogin: new Date(),
          });

          await Profile.create({ user: user._id });
        }

        return done(null, user);
      } catch (error) {
        logger.error(`GitHub OAuth error: ${error.message}`);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
