const {
  getQueryVocabulary,
  handleCorrectQuery,
  handleWrongQuery,
  getUnactivatedVocabulary,
} = require('../Services/QueryServiceProvider.js');

async function sendQueryVocabulary(req, res) {
  try {
    // get userId from request
    const userId = req.user.id;
    const { languagePackageId } = req.params;
    const { limit } = { limit: '100', ...req.query };
    const { staged } = { staged: false, ...req.query };
    // convert to bool
    const isStaged = staged === 'true';

    // if staged = true return the staged vocabulary
    if (isStaged) {
      const vocabulary = await getUnactivatedVocabulary(languagePackageId, userId);
      res.send(vocabulary);
    } else {
      const vocabulary = await getQueryVocabulary(languagePackageId, userId, limit);
      res.send(vocabulary);
    }
  } catch (e) {
    console.log(e.message);
    res.status(500).end();
  }
}

async function checkVocabulary(req, res) {
  try {
    // get userId from request
    const userId = req.user.id;
    const { vocabularyId } = req.params;
    const answer = req.query.answer;
    // convert to bool
    const isAnswerRight = answer === 'true';

    // check if vocabulary card got answered right
    if (isAnswerRight) {
      await handleCorrectQuery(userId, vocabularyId);
      res.status(204).end();
    } else {
      await handleWrongQuery(userId, vocabularyId);
      res.status(204).end();
    }
  } catch (e) {
    console.log(e.message);
    res.status(500).end();
  }
}

module.exports = {
  sendQueryVocabulary,
  checkVocabulary,
};
