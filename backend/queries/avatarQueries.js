const { db } = require('../config/database');
const avatarService = require('../services/avatarService');

class AvatarQueries {
  /**
   * 사용자 아바타 정보 조회
   * @param {string} userId - 사용자 UID
   * @returns {Object} 아바타 시스템 정보
   */
  async getAvatarSystem(userId) {
    try {
      const user = await db.one(
        `SELECT
          profile_image as current_avatar,
          level,
          total_questions_attempted
        FROM users
        WHERE uid = $1`,
        [userId]
      );

      // 모든 아바타 목록 (잠금 상태 포함)
      const avatars = avatarService.getAllAvatarsWithLockStatus(user.level);

      return {
        current: user.current_avatar || '🐣',  // 기본값
        userLevel: user.level,
        totalQuestions: user.total_questions_attempted,
        avatars: avatars
      };
    } catch (error) {
      console.error('getAvatarSystem query error:', error);
      throw new Error('Failed to fetch avatar system');
    }
  }

  /**
   * 아바타 변경
   * @param {string} userId - 사용자 UID
   * @param {string} avatarEmoji - 아바타 이모지
   * @returns {Object} 업데이트 결과
   */
  async updateAvatar(userId, avatarEmoji) {
    try {
      // 1. 사용자 레벨 조회
      const user = await db.one(
        `SELECT level FROM users WHERE uid = $1`,
        [userId]
      );

      // 2. 아바타 해금 여부 확인
      if (!avatarService.isAvatarUnlocked(user.level, avatarEmoji)) {
        throw new Error('This avatar is locked. Please level up to unlock it.');
      }

      // 3. 아바타 업데이트
      await db.none(
        `UPDATE users
         SET profile_image = $1
         WHERE uid = $2`,
        [avatarEmoji, userId]
      );


      return {
        success: true,
        avatar: avatarEmoji,
        message: 'Avatar updated successfully'
      };
    } catch (error) {
      console.error('updateAvatar query error:', error);
      throw error;
    }
  }
}

module.exports = new AvatarQueries();
