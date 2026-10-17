const aiService = require('./ai.service');
const asyncHandler = require('../../utils/asyncHandler');

const buildResume = asyncHandler(async (req, res) => {
  const resume = aiService.generateResumeMarkdown(req.body);
  res.json({ success: true, resume });
});

const enhanceSection = asyncHandler(async (req, res) => {
  const enhanced = aiService.enhanceSectionText(req.body);
  res.json({ success: true, enhanced });
});

const buildPortfolio = asyncHandler(async (req, res) => {
  const code = aiService.generatePortfolioHTML(req.body);
  res.json({ success: true, code });
});

module.exports = {
  buildResume,
  enhanceSection,
  buildPortfolio,
};
