const { db } = require('../config/database');

class SettingsQueries {
  // 사용자 설정 조회
  async getUserSettings(uid) {
    try {

      // 설정 조회
      const settingsResult = await db.oneOrNone(
        `SELECT
          notifications_enabled,
          notification_time,
          autoplay_enabled,
          voice_speed,
          voice_gender,
          theme,
          font_size,
          created_at,
          updated_at
         FROM user_settings
         WHERE user_id = $1`,
        [uid]
      );

      // 사용자 정보 조회 (계정 정보용)
      const userResult = await db.oneOrNone(
        `SELECT
          name,
          email,
          profile_image
         FROM users
         WHERE uid = $1`,
        [uid]
      );

      // 설정이 없으면 기본값 생성
      if (!settingsResult) {
        return await this.createDefaultSettings(uid);
      }


      return {
        notifications: {
          learningReminder: settingsResult.notifications_enabled,
          reminderTime: this.parseTime(settingsResult.notification_time),
          reviewReminder: true, // TODO: DB에 추가 필요시
          weeklyReport: false // TODO: DB에 추가 필요시
        },
        learning: {
          autoPlay: settingsResult.autoplay_enabled,
          voiceSpeed: parseFloat(settingsResult.voice_speed),
          voiceGender: settingsResult.voice_gender,
          difficulty: 2, // TODO: users 테이블의 default_difficulty 사용 가능
          reviewCount: 6 // TODO: DB에 추가 필요시
        },
        display: {
          theme: settingsResult.theme,
          fontSize: settingsResult.font_size
        },
        account: {
          nickname: userResult?.name || '',
          email: userResult?.email || '',
          profileImage: userResult?.profile_image || null,
          connectedAccounts: [
            // TODO: OAuth 연결 정보 조회 가능
            { provider: 'google', email: userResult?.email || '', connected: true }
          ]
        },
        data: {
          cacheSize: 0, // TODO: 실제 캐시 크기 계산 가능
          lastBackup: null, // TODO: 백업 기록 테이블 추가 시 사용
          totalData: 0 // TODO: 학습 데이터 용량 계산 가능
        }
      };

    } catch (error) {
      console.error('❌ [Get User Settings] Query error:', error);
      throw new Error('Failed to fetch user settings');
    }
  }

  // 기본 설정 생성
  async createDefaultSettings(uid) {
    try {

      await db.none(
        `INSERT INTO user_settings (
          user_id,
          notifications_enabled,
          notification_time,
          autoplay_enabled,
          voice_speed,
          voice_gender,
          theme,
          font_size
        ) VALUES ($1, true, '20:00:00', false, 1.0, 'male', 'light', 'medium')`,
        [uid]
      );

      // 사용자 정보 조회
      const userResult = await db.oneOrNone(
        `SELECT name, email, profile_image FROM users WHERE uid = $1`,
        [uid]
      );

      // 생성된 기본 설정 반환
      return {
        notifications: {
          learningReminder: true,
          reminderTime: { hour: 20, minute: 0 },
          reviewReminder: true,
          weeklyReport: false
        },
        learning: {
          autoPlay: false,
          voiceSpeed: 1.0,
          voiceGender: 'male',
          difficulty: 2,
          reviewCount: 6
        },
        display: {
          theme: 'light',
          fontSize: 'medium'
        },
        account: {
          nickname: userResult?.name || '',
          email: userResult?.email || '',
          profileImage: userResult?.profile_image || null,
          connectedAccounts: [
            { provider: 'google', email: userResult?.email || '', connected: true }
          ]
        },
        data: {
          cacheSize: 0,
          lastBackup: null,
          totalData: 0
        }
      };

    } catch (error) {
      console.error('❌ [Create Default Settings] Query error:', error);
      throw new Error('Failed to create default settings');
    }
  }

  // 사용자 설정 업데이트
  async updateUserSettings(uid, settings) {
    try {

      // 설정이 없으면 먼저 생성
      const existingSettings = await db.oneOrNone(
        'SELECT user_id FROM user_settings WHERE user_id = $1',
        [uid]
      );

      if (!existingSettings) {
        await this.createDefaultSettings(uid);
      }

      // 업데이트할 필드 구성
      const updates = [];
      const values = [uid];
      let paramIndex = 2;

      // notifications 업데이트
      if (settings.notifications) {
        if (typeof settings.notifications.learningReminder === 'boolean') {
          updates.push(`notifications_enabled = $${paramIndex++}`);
          values.push(settings.notifications.learningReminder);
        }
        if (settings.notifications.reminderTime) {
          const timeString = this.formatTime(settings.notifications.reminderTime);
          updates.push(`notification_time = $${paramIndex++}`);
          values.push(timeString);
        }
      }

      // learning 업데이트
      if (settings.learning) {
        if (typeof settings.learning.autoPlay === 'boolean') {
          updates.push(`autoplay_enabled = $${paramIndex++}`);
          values.push(settings.learning.autoPlay);
        }
        if (typeof settings.learning.voiceSpeed === 'number') {
          updates.push(`voice_speed = $${paramIndex++}`);
          values.push(settings.learning.voiceSpeed);
        }
        if (settings.learning.voiceGender) {
          updates.push(`voice_gender = $${paramIndex++}`);
          values.push(settings.learning.voiceGender);
        }
      }

      // display 업데이트
      if (settings.display) {
        if (settings.display.theme) {
          updates.push(`theme = $${paramIndex++}`);
          values.push(settings.display.theme);
        }
        if (settings.display.fontSize) {
          updates.push(`font_size = $${paramIndex++}`);
          values.push(settings.display.fontSize);
        }
      }

      // updated_at 항상 업데이트
      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      if (updates.length === 1) { // updated_at만 있으면 업데이트할 것이 없음
        return await this.getUserSettings(uid);
      }

      const query = `
        UPDATE user_settings
        SET ${updates.join(', ')}
        WHERE user_id = $1
        RETURNING *
      `;

      const result = await db.one(query, values);


      return await this.getUserSettings(uid);

    } catch (error) {
      console.error('❌ [Update User Settings] Query error:', error);
      throw new Error('Failed to update user settings');
    }
  }

  // TIME 타입을 { hour, minute } 객체로 변환
  parseTime(timeString) {
    if (!timeString) return { hour: 20, minute: 0 };

    const parts = timeString.split(':');
    return {
      hour: parseInt(parts[0]) || 20,
      minute: parseInt(parts[1]) || 0
    };
  }

  // { hour, minute } 객체를 TIME 타입 문자열로 변환
  formatTime(timeObj) {
    if (!timeObj) return '20:00:00';

    const hour = String(timeObj.hour || 20).padStart(2, '0');
    const minute = String(timeObj.minute || 0).padStart(2, '0');
    return `${hour}:${minute}:00`;
  }
}

module.exports = new SettingsQueries();
