const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const NaverStrategy = require('passport-naver-v2').Strategy;
const { findOrCreateUser } = require('../queries/userQueries');

require('dotenv').config();

// 세션에 사용자 ID 저장
passport.serializeUser((user, done) => {
  done(null, user.uid);
});

// 세션에서 사용자 ID로 사용자 정보 복원
passport.deserializeUser(async (uid, done) => {
  try {
    const { findUserByUid } = require('../queries/userQueries');
    const user = await findUserByUid(uid);

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy 설정
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  console.log('🔍 Google OAuth 콜백 시작:', { profileId: profile?.id, email: profile?.emails?.[0]?.value });
  try {
    console.log('Google OAuth Profile:', {
      id: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value,
      picture: profile.photos?.[0]?.value
    });

    // Google 프로필 정보를 우리 형식으로 변환
    const userData = {
      uid: `google_${profile.id}`, // Google ID에 prefix 추가
      name: profile.displayName,
      email: profile.emails?.[0]?.value,
      profile_image: profile.photos?.[0]?.value,
      voice_gender: 'male', // 기본값
      default_difficulty: 2
    };

    const user = await findOrCreateUser(userData);
    return done(null, user);

  } catch (error) {
    console.error('Google OAuth Error:', error.message);
    return done(error, null);
  }
}));

// Naver OAuth Strategy 설정
passport.use(new NaverStrategy({
  clientID: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  callbackURL: process.env.NAVER_CALLBACK_URL || "http://localhost:5000/auth/naver/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Naver OAuth Profile:', {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      picture: profile.profile_image
    });

    // Naver 프로필 정보를 우리 형식으로 변환
    const userData = {
      uid: `naver_${profile.id}`, // Naver ID에 prefix 추가
      name: profile.name || profile.nickname,
      email: profile.email,
      profile_image: profile.profile_image,
      voice_gender: 'male', // 기본값
      default_difficulty: 2
    };

    const user = await findOrCreateUser(userData);
    return done(null, user);

  } catch (error) {
    console.error('Naver OAuth Error:', error.message);
    return done(error, null);
  }
}));

module.exports = passport;