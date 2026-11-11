// Only grade keywords that can become a blank in QuizContent.
export const getVisibleKeywords = (english, keywords = []) => {
  const words = new Set((english || '').split(' ').map(word =>
    word.replace(/[.,!?]/g, '').toLowerCase()
  ));
  return [...new Set(keywords.map(keyword => keyword.toLowerCase().trim()))]
    .filter(keyword => keyword && words.has(keyword));
};
