import express from 'express';
const router = express.Router();
import sql from "msnodesqlv8";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const connectionString =
  "server=.\\SQLEXPRESS;Database=WorkingLoads;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";
// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

 // test na durachka
  if (!username || !password) {
    return res.status(400).json({ message: 'Необхідні ім\'я користувача та пароль' });
  }

  try {

    const query = `SELECT * FROM Registration WHERE Username = '${username}'`;


    sql.query(connectionString, query, async (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong, try again' });
      }


      if (!rows || rows.length === 0) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      const user = rows[0];

      const passwordMatch = await bcrypt.compare(password, user.Password);


      if (!passwordMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }


      const token = jwt.sign({ userId: user.id }, 'mySecretKey', { expiresIn: '1h' });


      res.json({
        token,
        isAdmin: user.IsAdmin
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong, try again' });
  }
});


export default router