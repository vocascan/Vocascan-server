const { LanguagePackage, Group } = require('../../database');
const { deleteKeysFromObject } = require('../utils');
const ApiError = require('../utils/ApiError.js');
const httpStatus = require('http-status');

// create language package
async function createLanguagePackage(
  { name, foreignWordLanguage, translatedWordLanguage, vocabsPerDay, rightWords },
  userId
) {
  const languagePackage = await LanguagePackage.create({
    userId,
    name,
    foreignWordLanguage,
    translatedWordLanguage,
    vocabsPerDay,
    rightWords,
  });

  return deleteKeysFromObject(['userId', 'createdAt', 'updatedAt'], languagePackage.toJSON());
}

// get language package
async function getLanguagePackages(userId, groups) {
  // Get user with email from database
  const languagePackages = await LanguagePackage.findAll({
    // if groups is true, return groups to every language package
    include: groups ? [{ model: Group, attributes: ['id', 'name', 'description', 'active'] }] : [],
    attributes: ['id', 'name', 'foreignWordLanguage', 'translatedWordLanguage', 'vocabsPerDay', 'rightWords'],
    where: {
      userId,
    },
  });

  return languagePackages;
}

async function destroyLanguagePackage(userId, languagePackageId) {
  const counter = await LanguagePackage.destroy({
    where: {
      id: languagePackageId,
      userId,
    },
  });

  if (counter === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'language package not found');
  }
  return false;
}

async function updateLanguagePackage(package, userId, languagePackageId) {
  const counter = await LanguagePackage.update(package, {
    fields: ['name', 'foreignWordLanguage', 'translatedWordLanguage', 'vocabsPerDay', 'rightWords'],
    where: {
      id: languagePackageId,
      userId,
    },
  });

  if (counter[0] === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'language package not found');
  }
  return false;
}

module.exports = {
  createLanguagePackage,
  getLanguagePackages,
  destroyLanguagePackage,
  updateLanguagePackage,
};
