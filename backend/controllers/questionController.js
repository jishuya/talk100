const {
  getQuestionsByDay,
  getQuestionsByCategory,
  getAllCategories,
  getQuestionById
} = require('../queries/questionQueries');

/**
 * Question Controller
 * 문제 조회 관련 API 핸들러
 */

// Day별 문제 조회 (특정 카테고리의 특정 Day)
async function getQuestionsByDayHandler(req, res) {
  try {
    const { category, day } = req.params;

    // 파라미터 검증
    if (!category || !day) {
      return res.status(400).json({
        success: false,
        message: 'Category and day parameters are required'
      });
    }

    const dayNumber = parseInt(day);
    if (isNaN(dayNumber) || dayNumber < 1) {
      return res.status(400).json({
        success: false,
        message: 'Day must be a positive number'
      });
    }

    const questions = await getQuestionsByDay(category, dayNumber);

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found for ${category} Day ${day}`
      });
    }

    res.json({
      success: true,
      data: {
        category,
        day: dayNumber,
        total_questions: questions.length,
        questions
      }
    });

  } catch (error) {
    console.error('Get questions by day error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 카테고리별 모든 문제 조회 (Day별로 그룹화)
async function getQuestionsByCategoryHandler(req, res) {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category parameter is required'
      });
    }

    const questions = await getQuestionsByCategory(category);

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found for category: ${category}`
      });
    }

    // Day별로 그룹화
    const questionsByDay = questions.reduce((acc, question) => {
      const day = question.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(question);
      return acc;
    }, {});

    // Day 순서대로 정렬
    const sortedDays = Object.keys(questionsByDay)
      .map(day => parseInt(day))
      .sort((a, b) => a - b);

    const result = sortedDays.map(day => ({
      day,
      question_count: questionsByDay[day].length,
      questions: questionsByDay[day]
    }));

    res.json({
      success: true,
      data: {
        category,
        total_days: sortedDays.length,
        total_questions: questions.length,
        days: result
      }
    });

  } catch (error) {
    console.error('Get questions by category error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 카테고리 목록 조회
async function getCategoriesHandler(req, res) {
  try {
    const categories = await getAllCategories();

    res.json({
      success: true,
      data: {
        total_categories: categories.length,
        categories
      }
    });

  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 특정 문제 조회 (ID로)
async function getQuestionByIdHandler(req, res) {
  try {
    const { questionId } = req.params;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: 'Question ID parameter is required'
      });
    }

    const question = await getQuestionById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: `Question not found: ${questionId}`
      });
    }

    res.json({
      success: true,
      data: { question }
    });

  } catch (error) {
    console.error('Get question by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 카테고리별 통계 조회 (Day 수, 총 문제 수)
async function getCategoryStatsHandler(req, res) {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category parameter is required'
      });
    }

    const questions = await getQuestionsByCategory(category);

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found for category: ${category}`
      });
    }

    // 통계 계산
    const daySet = new Set(questions.map(q => q.day));
    const totalDays = daySet.size;
    const maxDay = Math.max(...Array.from(daySet));
    const minDay = Math.min(...Array.from(daySet));

    // Day별 문제 수 계산
    const questionsByDay = questions.reduce((acc, question) => {
      const day = question.day;
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        category,
        total_questions: questions.length,
        total_days: totalDays,
        day_range: { min: minDay, max: maxDay },
        questions_per_day: questionsByDay,
        avg_questions_per_day: Math.round(questions.length / totalDays * 100) / 100
      }
    });

  } catch (error) {
    console.error('Get category stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get category stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getQuestionsByDayHandler,
  getQuestionsByCategoryHandler,
  getCategoriesHandler,
  getQuestionByIdHandler,
  getCategoryStatsHandler
};