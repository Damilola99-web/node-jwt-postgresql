const express =  require('express')
const jwt = require('jsonwebtoken')
const pool = require('../dbConfig')
const router = express.Router()

router.get('/', async (req, res) => {
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).json({message : "Unauthorized Request"})
    }
    try {
        const validToken = await jwt.verify(token, process.env.JWT_SECRET)
        if (validToken) {
            const books = await pool.query(`SELECT * FROM books`)
            console.log(books.rows)
            res.status(200).json(books.rows)
        }
    } catch (error) {
        res.status(401).json({message : "Invalid Request"})
    }
})

router.delete('/:id', async (req, res) => {
    const bookid = req.params.id
    const token = req.header('auth-token')
    if (!token) {
        res.status(401).json({message : "Unauthorized Request"})
    }
    try {
        const validToken = await jwt.verify(token, process.env.JWT_SECRET)
        const bookExists = await pool.query(`SELECT * FROM books WHERE id=$1`, [bookid])
        if (bookExists.rows.length < 1) {
            res.status(404).json({message : "Book not found"})
        }
        console.log(validToken)
        if (validToken.id !== bookid) {
            res.status(401).json({message : "this user is not allowed to delete this boook"})
        } else {
            if (bookExists.rows.length > 0) {
                   const deleted = await pool.query(`DELETE FROM books WHERE id = $1 RETURNING *`, [bookid])
                   res.status(200).json(deleted.rows[0])
            }
        }
    } catch (error) {
        res.status(401).json({message : "Invalid Request"})
    }
})

module.exports = router