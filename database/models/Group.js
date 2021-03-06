const { DataTypes, UUIDV4 } = require('sequelize');

module.exports = (sequelize) => {
  const Group = sequelize.define(
    'Group',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      languagePackageId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [1, 55] },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [0, 255] },
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'groups',
    }
  );

  Group.associate = (db) => {
    Group.belongsTo(db.User, { foreignKey: 'userId' });
    Group.belongsTo(db.LanguagePackage, { foreignKey: 'languagePackageId' });

    Group.hasMany(db.VocabularyCard, { foreignKey: 'groupId', onDelete: 'cascade', hooks: true });
  };

  return Group;
};
