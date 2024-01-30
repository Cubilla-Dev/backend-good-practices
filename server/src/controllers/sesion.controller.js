const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const createTokenJWT = require('../util/createToken')

const sesion = {
    login: async (req, res) => {
        const {email, password } = req.body;
        try{
            const findUser = await User.findOne({ email })
                .select("passwordhash")
                .exec()

            if(!findUser){
                res.status(404).json({ message: "El email porporcionado no es la correcta"})
            }

            const passwordComparison = bcrypt.compareSync(password, findUser.passwordhash)
            if(!passwordComparison){
                res.status(401).json({ message: "Contrsenha incorrecta"})
            }

            const tokenJWT = createTokenJWT("1", {_id: findUser._id})

            res.status(200)
                .send({
                    message: "Inicio de sesion exitosa",
                    token: tokenJWT,
                    userData: findUser,
                })
        }catch( error ){
            console.error(error.message)
            res.status(409).json({ message: "El usuario no puedo iniciar la sesion"})
        }
    },
    register: async (req, res) => {
        const {name, first_name, email, password } = req.body;
        console.log(name)
        try  {
            const valid = await User.find({ email })
            const existingUser = await User.findOne({ $or:[{ email }]})

            if(!existingUser || !valid){
                return res 
                    .status(409)
                    .send({ meesage: "Email ya existe en la base de datos"})
            }
            let passwordhash = bcrypt.hashSync (password, 10);
            const newUser = new User({ name, first_name, email, passwordhash })
            await newUser.save()

            res.status(200).send({ message: 'Usuario creado'})
        }catch( error ){
            console.log(error.message)
            res.status(409).send({ message: "El usuario no pudo ser registrado"})
        }
    },
    allUser: async (req, res) => {
        const { email } = req.body;
        try{
            const data = await User.findOne({email})

            res.json({
                data: data
            })
        }catch( error ){
            console.log("Error en la peticion de la data ", error)
        }
    }
}

module.exports = sesion;