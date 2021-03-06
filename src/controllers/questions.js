const { Op } = require("sequelize");
const Question = require("../models/Question");
const Student = require("../models/Student");
const questions = require("../validators/questions");

module.exports = {
  async index(req, res) {
    //LISTAR TODOS
    const { search } = req.query;

    try {
      const questions = await Question.findAll({
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
        where: {
          [Op.or]: [
            {
              title: {
                [Op.substring]: search,
              },
            },
            {
              description: {
                [Op.substring]: search,
              },
            },
          ],
        },
      });

      res.send(questions);
    } catch (error) {
      console.log(error);

      res.status(500).send({ error: error });
    }
  },
  async store(req, res) {
    //FAZER UM POST
    const { title, description, gist, categories } = req.body;

    const categoriesArray = categories.split(",");

    const { studentId } = req;

    const { firebaseUrl } = req.file ? req.file : "";

    try {
      //Buscar o aluno pelo ID
      let student = await Student.findByPk(studentId);

      //Se aluno não existir, retorno erro
      if (!student)
        return res.status(404).send({ erro: "Aluno não encontrado" });
      //Crio a Question para este aluno
      let question = await student.createQuestion({
        title,
        description,
        image: req.file ? req.file.firebaseUrl : null,
        gist,
      });

      await question.addCategories(categoriesArray);

      //Retorno sucesso
      res.status(201).send({
        id: question.id,
        title: question.title,
        description: question.description,
        created_at: question.created_at,
        gist: question.gist,
        image: req.file ? req.file.firebaseUrl : null,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
  find(req, res) {
    //ENCONTRAR PELO ID
  },
  async update(req, res) {
    //ATUALIZAR
    const questionId = req.params.id;

    const { title, description } = req.body;

    const { studentId } = req;

    try {
      const question = await Question.findByPk(questionId);

      if (!question)
        return res.status(404).send({ error: "Questão não encontrada" });

      // const student = await Student.findByPk(studentId)

      if (question.StudentId != studentId)
        return res.status(401).send({ error: "Não autorizado" });

      question.title = title;
      question.description = description;

      question.save();

      res.status(204).send();
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }

    // const perguntaId = req.params.id;
    // const alunoId = req.headers.authorization;
    // const {titulo,descricao} = req.body;

    // try {
    //     let pergunta = await Question.findByPk(perguntaId);

    //     let autorizacao = await Question.findOne({
    //         where:{
    //             id: perguntaId,
    //             aluno_id: alunoId
    //         }
    //     })

    //     if(!pergunta)
    //        return res.status(404).send({erro: "Pergunta não encontrado."});

    //     if(!autorizacao)
    //         return res.status(400).send({erro: "Pedido negado."});

    //     if(alunoId )

    //     pergunta.titulo = titulo;
    //     pergunta.descricao = descricao;

    //     pergunta.save();

    //     //Retornar a resposta
    //     res.status(204).send();

    // } catch (error) {
    //     console.log(error);
    //     res.status(500).send(error);
    // }
  },
  async delete(req, res) {
    //DELETAR

    const questionId = req.params.id;

    const { studentId } = req;

    try {
      const question = await Question.findOne({
        where: {
          id: questionId,
          student_id: studentId,
        },
      });

      if (!question) res.status(404).send({ error: "Pergunta não encontrada" });

      await question.destroy();

      res.status(204).send();
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }

    // const perguntaId = req.params.id;
    // const alunoId = req.headers.authorization;

    // try {
    //     let pergunta = await Question.findByPk(perguntaId);

    //     let autorizacao = await Question.findOne({
    //         where:{
    //             id: perguntaId,
    //             aluno_id: alunoId
    //         }
    //     })
    //     if(!autorizacao)
    //         return res.status(400).send({erro: "Pedido negado."});

    //     if(!pergunta)
    //         return res.status(404).send({erro: "Pergunta não encontrada."});

    //     await pergunta.destroy();

    //     //devolver resposta de sucesso
    //     res.status(204).send();

    // } catch (error) {
    //     console.log(error);
    //     res.status(500).send(error);
    // }
  },
};
