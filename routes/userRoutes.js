const express = require('express')
const bcrypt = require('bcrypt')
const pool = require('../dbConfig')
const jwt = require('jsonwebtoken')
const router = express.Router()

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body
    // console.log(name, email, password)
    let errors = []
    if (!name || !email || !password) {
        errors.push({message : "Please enter all fields"})
    }
    if (password?.length < 6) {
        errors.push({ message : "Passwords should be at least 6characters"})
    }
    if (errors?.length > 0) {
        res.status(400).json(errors)
    } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        pool.query('SELECT * FROM USERS WHERE email = $1', [email], (err, result) => {
            if (err) {
                console.log(err)
            }
            if (result.rows.length > 0) {
                errors.push({ message: "Email exists already" })
                res.status(400).json({message: "Email exists already"})
            } else {
                pool.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email`, [name, email, hashedPassword]).then(result => {
                    const token = jwt.sign(result.rows[0], process.env.JWT_SECRET)
                    res.setHeader("auth-token", token).status(200).json(result.rows[0])
                //    res.status(200).json(result.rows[0])
                }).catch(error => {
                    console.log(error)
                   res.status(401).json(error)
               })
            }
        })
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    let errors = []
    if (!email || !password) {
        errors.push({message : "Please enter all fields"})
    } else {
        const exist = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
        
        if (exist.rows.length < 1) {
            res.status(400).json({message : "Email does not exists"})
        } else {
            const { password: pass2, id, name, email } = exist.rows[0]
            const passcorrect = await bcrypt.compare(password, pass2)
            if (!passcorrect) {
                res.status(400).json({message : "Password is incorrect"})
            } else {
                const token = jwt.sign(exist.rows[0], process.env.JWT_SECRET)
                res.setHeader("auth-token", token).status(200).json({id, name, email})
            }
        }
    }
})

module.exports = router