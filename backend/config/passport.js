const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const NaverStrategy = require('passport-naver-v2').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const userQueries = require('../queries/userQueries');

require('dotenv').config();

// 세션에 사용자 ID 저장
passport.serializeUser((user, done) => {
  done(null, user.uid);
});

// 세션에서 사용자 ID로 사용자 정보 복원
passport.deserializeUser(async (uid, done) => {
  try {
    const user = await userQueries.findUserByUid(uid);

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
  try {
    // 필수 정보 검증
    if (!profile.id) {
      console.error('Google OAuth Error: No profile ID');
      return done(new Error('Google profile ID is missing'), null);
    }

    if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
      console.error('Google OAuth Error: No email in profile');
      return done(new Error('Google profile email is missing'), null);
    }

    // Google 프로필 정보를 우리 형식으로 변환
    const userData = {
      uid: `google_${profile.id}`,
      name: profile.displayName || 'Google User',
      email: profile.emails[0].value,
      profile_image: '🦊',
      voice_gender: 'us_female',
      default_difficulty: 2
    };

    const user = await userQueries.findOrCreateUser(userData);
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
    // 필수 정보 검증
    if (!profile.id) {
      console.error('Naver OAuth Error: No profile ID');
      return done(new Error('Naver profile ID is missing'), null);
    }

    if (!profile.email) {
      console.error('Naver OAuth Error: No email in profile');
      return done(new Error('Naver profile email is missing'), null);
    }

    // Naver 프로필 정보를 우리 형식으로 변환
    const userData = {
      uid: `naver_${profile.id}`,
      name: profile.name || profile.nickname || 'Naver User',
      email: profile.email,
      profile_image: '🦊',
      voice_gender: 'us_female',
      default_difficulty: 2
    };

    const user = await userQueries.findOrCreateUser(userData);
    return done(null, user);

  } catch (error) {
    console.error('Naver OAuth Error:', error.message);
    return done(error, null);
  }
}));

// Kakao OAuth Strategy 설정
passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  callbackURL: process.env.KAKAO_CALLBACK_URL || "http://localhost:5000/auth/kakao/callback"
}, async (accessToken, refreshToken, profile, done) => {

  try {

    // 필수 정보 검증
    if (!profile.id) {
      console.error('❌ Kakao OAuth Error: No profile ID');
      return done(new Error('Kakao profile ID is missing'), null);
    }

    // Kakao 프로필에서 이메일 추출 (선택사항)
    const kakaoAccount = profile._json?.kakao_account;

    if (kakaoAccount) {
    }

    const email = kakaoAccount?.email;

    // 이메일이 없으면 가상 이메일 생성
    const finalEmail = email || `kakao_${profile.id}@kakao.local`;
    if (!email) {
    } else {
    }

    // 닉네임 추출 (동의 필요 시 기본값 사용)
    let nickname = profile.displayName || 'Kakao User';
    if (kakaoAccount?.profile?.nickname) {
      nickname = kakaoAccount.profile.nickname;
    }

    // Kakao 프로필 정보를 우리 형식으로 변환
    const userData = {
      uid: `kakao_${profile.id}`,
      name: nickname,
      email: finalEmail,
      profile_image: '🦊',  // 카카오 프로필 이미지 미수집, 기본값 사용
      voice_gender: 'us_female',
      default_difficulty: 2
    };

    const user = await userQueries.findOrCreateUser(userData);

    return done(null, user);

  } catch (error) {
    console.error('❌ Kakao OAuth Error:', error.message);
    console.error('Error stack:', error.stack);
    return done(error, null);
  }
}));

module.exports = passport;