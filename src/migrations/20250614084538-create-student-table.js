"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Student", {
      sbd: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      toan: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      ngu_van: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      ngoai_ngu: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      vat_li: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      hoa_hoc: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      sinh_hoc: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      lich_su: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      dia_li: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      gdcd: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      ma_ngoai_ngu: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex("Student", ["sbd"]);
    await queryInterface.addIndex("Student", ["toan"]);
    await queryInterface.addIndex("Student", ["vat_li"]);
    await queryInterface.addIndex("Student", ["hoa_hoc"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Student");
  },
};
