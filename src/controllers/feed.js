const Question = require("../models/Question");
const { Op } = require("sequelize");

module.exports = {
  async index(req, res) {
    // const { page } = req.query;
    const { page } = req.query;

    try {
      const totalQuestion = await Question.count();
      const feed = await Question.findAll({
        attributes: [
          "id",
          "title",
          "description",
          "image",
          "gist",
          "created_at",
          "StudentId",
        ],
        include: [
          {
            association: "Student",
            attributes: ["id", "name", "image"],
          },
          {
            association: "Answers",
            attributes: ["id", "description", "created_at"],
            include: {
              association: "Student",
              attributes: ["id", "name", "image"],
            },
          },
          {
            association: "Categories",
            attributes: ["id", "description"],
            through: { attributes: [] },
          },
        ],
        order: [["created_at", "DESC"]],
        limit: page ? [(page - 1) * 5, 5] : undefined,
      });

      res.header("X-Total-Count", totalQuestion);
      res.header("Acess-Control-Expose-Headers", "X-Total-Count");

      setTimeout(() => {
        res.send(feed);
      }, 1000);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error });
    }
  },

  async find(req, res) {
    try {
      const { searchParams } = req.body;

      const feed = await Question.findAll({
        attributes: [
          "id",
          "title",
          "description",
          "image",
          "gist",
          "created_at",
        ],
        where: {
          [Op.or]: {
            title: {
              [Op.substring]: searchParams,
            },
            description: {
              [Op.substring]: searchParams,
            },
          },
        },
        include: [
          {
            association: "Student",
            attributes: ["id", "image", "name"],
          },

          {
            association: "Categories",
            through: { attributes: [] },
            attributes: ["id", "description"],
          },

          {
            association: "Answers",
            attributes: ["id", "description", "createdAt"],
            include: {
              association: "Student",
              attributes: ["id", "image", "name"],
            },
          },
        ],
        order: [["created_at", "DESC"]],
      });

      console.log(feed);

      res.send(feed);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error });
    }
  },
};
