const { db } = require('../config/database');

/**
 * 뱃지 서비스
 * - 뱃지 획득 조건 체크
 * - 뱃지 업데이트
 * - 뱃지 목록 조회
 */
class BadgeService {
  // 뱃지 정의 (총 12개) - icon은 프론트엔드에서 badgeIcons.js로 매핑
  static BADGE_DEFINITIONS = [
    // 1. 카테고리 완료 (3개)
    {
      id: 'complete-model',
      name: 'Model Example 마스터',
      description: 'Model Example 카테고리 완료',
      category: 'category',
      condition: 'category_1_complete'
    },
    {
      id: 'complete-smalltalk',
      name: 'Small Talk 마스터',
      description: 'Small Talk 카테고리 완료',
      category: 'category',
      condition: 'category_2_complete'
    },
    {
      id: 'complete-cases',
      name: 'Cases in Point 마스터',
      description: 'Cases in Point 카테고리 완료',
      category: 'category',
      condition: 'category_3_complete'
    },

    // 2. 연속 학습 (3개)
    {
      id: 'streak-7',
      name: '일주일 연속',
      description: '7일 연속 학습 완료',
      category: 'streak',
      condition: 'current_streak >= 7'
    },
    {
      id: 'streak-30',
      name: '한달 연속',
      description: '30일 연속 학습 완료',
      category: 'streak',
      condition: 'current_streak >= 30'
    },
    {
      id: 'streak-100',
      name: '백일 연속',
      description: '100일 연속 학습 완료',
      category: 'streak',
      condition: 'current_streak >= 100'
    },

    // 3. 문제 수 (3개)
    {
      id: 'questions-100',
      name: '100문제 정복',
      description: '총 100문제 완료',
      category: 'questions',
      condition: 'total_questions >= 100'
    },
    {
      id: 'questions-300',
      name: '300문제 정복',
      description: '총 300문제 완료',
      category: 'questions',
      condition: 'total_questions >= 300'
    },
    {
      id: 'questions-500',
      name: '500문제 정복',
      description: '총 1000문제 완료',
      category: 'questions',
      condition: 'total_questions >= 500'
    },

    // 4. 특수 업적 (3개)
    {
      id: 'master-all',
      name: '모든 카테고리 정복',
      description: '모든 카테고리 완료',
      category: 'special',
      condition: 'all_categories_complete'
    },
    {
      id: 'dedicated',
      name: '성실왕',
      description: '총 100일 학습 완료',
      category: 'special',
      condition: 'total_days >= 100'
    },
    {
      id: 'collector',
      name: '컬랙터',
      description: '즐겨찾기 50개 등록',
      category: 'special',
      condition: 'favorites >= 50'
    }
  ];

  /**
   * 사용자의 획득 가능한 뱃지를 체크하고 업데이트
   * @param {string} userId - 사용자 UID
   * @returns {Object} { earnedBadges: string[], newBadges: string[] }
   */
  async checkAndUpdateBadges(userId) {
    try {

      // 1. 현재 사용자 데이터 조회
      const user = await db.one(
        `SELECT
          uid,
          earned_badges,
          current_streak,
          total_questions_attempted as total_questions,
          total_days_studied as total_days
         FROM users
         WHERE uid = $1`,
        [userId]
      );

      // 2. 카테고리 완료 여부 조회
      const categoryCompletion = await db.any(
        `SELECT
          c.category_id,
          COUNT(DISTINCT qa.question_id) as completed,
          (SELECT COUNT(*) FROM questions WHERE category_id = c.category_id) as total
         FROM category c
         LEFT JOIN questions q ON c.category_id = q.category_id
         LEFT JOIN question_attempts qa ON q.question_id = qa.question_id AND qa.user_id = $1
         WHERE c.category_id IN (1, 2, 3)
         GROUP BY c.category_id`,
        [userId]
      );

      // 3. 즐겨찾기 개수 조회
      const favoritesResult = await db.one(
        `SELECT COUNT(*) as count FROM favorites WHERE user_id = $1`,
        [userId]
      );
      const favoritesCount = parseInt(favoritesResult.count) || 0;

      // 4. 현재 획득한 뱃지
      const earnedBadges = user.earned_badges || [];
      const newBadges = [];

      // 5. 각 뱃지 조건 체크
      for (const badge of BadgeService.BADGE_DEFINITIONS) {
        // 이미 획득한 뱃지는 스킵
        if (earnedBadges.includes(badge.id)) continue;

        let shouldEarn = false;

        switch (badge.id) {
          // 카테고리 완료
          case 'complete-model':
            shouldEarn = this.isCategoryComplete(categoryCompletion, 1);
            break;
          case 'complete-smalltalk':
            shouldEarn = this.isCategoryComplete(categoryCompletion, 2);
            break;
          case 'complete-cases':
            shouldEarn = this.isCategoryComplete(categoryCompletion, 3);
            break;

          // 연속 학습
          case 'streak-7':
            shouldEarn = user.current_streak >= 7;
            break;
          case 'streak-30':
            shouldEarn = user.current_streak >= 30;
            break;
          case 'streak-100':
            shouldEarn = user.current_streak >= 100;
            break;

          // 문제 수
          case 'questions-100':
            shouldEarn = user.total_questions >= 100;
            break;
          case 'questions-500':
            shouldEarn = user.total_questions >= 500;
            break;
          case 'questions-1000':
            shouldEarn = user.total_questions >= 1000;
            break;

          // 특수 업적
          case 'master-all':
            shouldEarn = categoryCompletion.length === 3 &&
              categoryCompletion.every(cat => this.isCategoryComplete([cat], cat.category_id));
            break;
          case 'dedicated':
            shouldEarn = user.total_days >= 100;
            break;
          case 'collector':
            shouldEarn = favoritesCount >= 50;
            break;
        }

        if (shouldEarn) {
          newBadges.push(badge.id);
        }
      }

      // 6. 새로운 뱃지가 있으면 DB 업데이트
      if (newBadges.length > 0) {
        const updatedBadges = [...earnedBadges, ...newBadges];
        await db.none(
          `UPDATE users
           SET earned_badges = $1
           WHERE uid = $2`,
          [JSON.stringify(updatedBadges), userId]
        );

      } else {
      }

      return {
        earnedBadges: [...earnedBadges, ...newBadges],
        newBadges
      };

    } catch (error) {
      console.error('❌ [Badge Service] Error checking badges:', error);
      throw error;
    }
  }

  /**
   * 카테고리 완료 여부 체크
   * @param {Array} categoryCompletion - 카테고리 완료 데이터
   * @param {number} categoryId - 카테고리 ID
   * @returns {boolean}
   */
  isCategoryComplete(categoryCompletion, categoryId) {
    const category = categoryCompletion.find(c => c.category_id === categoryId);
    if (!category) return false;

    const completed = parseInt(category.completed) || 0;
    const total = parseInt(category.total) || 0;

    return total > 0 && completed >= total;
  }

  /**
   * 사용자의 뱃지 목록 조회 (획득 여부 포함)
   * @param {string} userId - 사용자 UID
   * @returns {Array} 뱃지 목록
   */
  async getUserBadges(userId) {
    try {

      const user = await db.oneOrNone(
        `SELECT earned_badges FROM users WHERE uid = $1`,
        [userId]
      );

      const earnedBadgeIds = user?.earned_badges || [];

      const badges = BadgeService.BADGE_DEFINITIONS.map(badge => ({
        ...badge,
        earned: earnedBadgeIds.includes(badge.id)
      }));


      return badges;

    } catch (error) {
      console.error('❌ [Badge Service] Error fetching user badges:', error);
      throw error;
    }
  }
}

module.exports = new BadgeService();
