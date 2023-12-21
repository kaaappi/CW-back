import express from "express";
import sql from "msnodesqlv8";
import bcrypt from "bcrypt";

const router = express.Router();

const connectionString =
  "server=.\\SQLEXPRESS;Database=WorkingLoads;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";

// POST /api/register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Проверка наличия username и password в запросе
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Необхідні ім'я користувача та пароль" });
  }

  try {
    const queryExistingUser = `
      SELECT * FROM Registration WHERE Username = '${username}'
    `;



    // test na exist
    const getRows = async () => {
      return new Promise((resolve, reject) => {
        sql.query(connectionString, queryExistingUser, (err, rows) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    };

     getRows()
      .then(async (rows) => {
        const existingUser = rows;
        console.log(existingUser && existingUser.length > 0)
        if (existingUser && existingUser.length > 0) {
          return res.status(400).json({message: 'User is already exist'});
        }
        else {
          const hashedPassword = await bcrypt.hash(password, 10);
          const queryInsertUser = `
        INSERT INTO Registration (username, password) VALUES ('${username}', '${hashedPassword}')
      `;
          sql.query(connectionString, queryInsertUser, (errInsert, result) => {
            if (errInsert) {
              console.error(errInsert);
              return res.status(500).json({ message: 'Error adding user' });
            }
            return res.status(201).json({ message: 'User successfully registered' });
          });
        }


      })
      .catch((error) => {
        console.error(error);
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Щось пішло не так, спробуйте знову" });
  }
});

export default router