const {
  getUserFavorites,
  getFavoritesByCategory,
  toggleFavorite,
  getFavoritesCount,
  getRandomFavorites,
  getFavoritesStats,
  removeAllFavorites
} = require('../queries/favoritesQueries');

/**
 * Favorites Controller
 * 즐겨찾기 관리 관련 API 핸들러
 * ❤️ 버튼으로 즐겨찾기 추가/제거 기능 제공
 */

// 사용자의 즐겨찾기 문제 목록 조회
async function getFavoritesHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own favorites'
      });
    }

    const targetUserId = userId || requestUserId;
    const { category } = req.query;

    let favorites;
    if (category) {
      favorites = await getFavoritesByCategory(targetUserId, category);
    } else {
      favorites = await getUserFavorites(targetUserId);
    }

    const totalCount = await getFavoritesCount(targetUserId);

    // 카테고리별로 그룹화
    const byCategory = favorites.reduce((acc, item) => {
      const cat = item.category;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(item);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        totalCount,
        filteredCount: favorites.length,
        filterCategory: category || null,
        questions: favorites,
        byCategory,
        summary: {
          total: totalCount,
          model_example: byCategory.model_example?.length || 0,
          small_talk: byCategory.small_talk?.length || 0,
          cases_in_point: byCategory.cases_in_point?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Get favorites error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ❤️ 버튼 토글 (즐겨찾기 추가/제거)
async function toggleFavoriteHandler(req, res) {
  try {
    const { questionId } = req.body;
    const userId = req.user.uid;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: 'Question ID is required'
      });
    }

    const result = await toggleFavorite(userId, questionId);

    res.json({
      success: true,
      data: {
        userId,
        questionId,
        action: result.action, // 'added' or 'removed'
        isFavorited: result.isFavorited,
        message: result.isFavorited
          ? 'Added to favorites'
          : 'Removed from favorites',
        addedAt: result.result?.added_at || null
      }
    });

  } catch (error) {
    console.error('Toggle favorite error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 즐겨찾기 퀴즈용 랜덤 문제 조회
async function getFavoritesQuizHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own quiz data'
      });
    }

    const targetUserId = userId || requestUserId;
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 50'
      });
    }

    const questions = await getRandomFavorites(targetUserId, limitNum);

    if (questions.length === 0) {
      return res.json({
        success: true,
        data: {
          hasQuestions: false,
          message: 'No favorite questions available for quiz',
          questions: [],
          count: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        hasQuestions: true,
        questions,
        count: questions.length,
        message: `${questions.length} favorite questions selected for quiz`
      }
    });

  } catch (error) {
    console.error('Get favorites quiz error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 즐겨찾기 통계 조회
async function getFavoritesStatsHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own stats'
      });
    }

    const targetUserId = userId || requestUserId;
    const stats = await getFavoritesStats(targetUserId);

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        stats,
        insights: {
          hasFavorites: stats.total_favorites > 0,
          totalCount: stats.total_favorites,
          categoryDistribution: {
            model_example: stats.model_example_count,
            small_talk: stats.small_talk_count,
            cases_in_point: stats.cases_in_point_count
          },
          questionTypeDistribution: {
            single: stats.single_questions,
            dialogue: stats.dialogue_questions
          },
          dateRange: {
            first: stats.first_favorite_date,
            latest: stats.latest_favorite_date
          }
        }
      }
    });

  } catch (error) {
    console.error('Get favorites stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 모든 즐겨찾기 삭제 (대량 관리 기능)
async function removeAllFavoritesHandler(req, res) {
  try {
    const userId = req.user.uid;
    const deletedCount = await removeAllFavorites(userId);

    res.json({
      success: true,
      data: {
        userId,
        deletedCount,
        message: `${deletedCount} favorites removed successfully`
      }
    });

  } catch (error) {
    console.error('Remove all favorites error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to remove all favorites',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 즐겨찾기 개수 조회 (홈 화면용)
async function getFavoritesCountHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own count'
      });
    }

    const targetUserId = userId || requestUserId;
    const count = await getFavoritesCount(targetUserId);

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        count,
        message: `${count} favorite questions found`
      }
    });

  } catch (error) {
    console.error('Get favorites count error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getFavoritesHandler,
  toggleFavoriteHandler,
  getFavoritesQuizHandler,
  getFavoritesStatsHandler,
  removeAllFavoritesHandler,
  getFavoritesCountHandler
};