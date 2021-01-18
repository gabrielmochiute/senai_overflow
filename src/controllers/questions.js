const Question = require("../models/Question");
const Student = require("../models/Student");

module.exports = {
    index(req,res){//LISTAR TODOS

    },
    async store(req,res){//FAZER UM POST
        const {title,description,image ,gist, categories} = req.body;

        const studentId = req.headers.authorization;

        try {
            //Buscar o aluno pelo ID
            let student = await Student.findByPk(studentId);

            //Se aluno não existir, retorno erro
            if(!student)
                return res.status(404).send({erro:"Aluno não encontrado"});
            //Crio a Question para este aluno
            let question = await student.createQuestion({title,description,image,gist});

            await question.addCategories(categories);

            //Retorno sucesso
            res.status(201).send(question);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },
    find(req,res){//ENCONTRAR PELO ID

    },
    async update(req,res){//ATUALIZAR
        const questionId = req.params.id;

        const {title,description} = req.body

        const studentId = req.headers.authorization;

        try {
            const question = await Question.findByPk(questionId);

            if(!question)
                return res.status(404).send({error:"Questão não encontrada"});

            // const student = await Student.findByPk(studentId)

            if(question.StudentId != studentId)
                return res.status(401).send({error:"Não autorizado"});

            question.title = title;
            question.description = description;

            question.save()

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
    async delete(req,res){//DELETAR

        const questionId = req.params.id;

        const studentId = req.headers.authorization;

        try {
            const question = await Question.findOne({
                where:{
                    id: questionId,
                    student_id: studentId
                }
            });

            if(!question)
                res.status(404).send({error:"Pergunta não encontrada"});

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

    }
}