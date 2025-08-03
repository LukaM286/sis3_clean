const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'SISIII2025_89231387',
})

conn.connect((err) => {
  if (err) {
    console.log("ERROR: " + err.message);
    return;
  }
  console.log('Connection established');
})


let dataPool = {}

dataPool.allNovice = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM news`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.obravnaveZaPacienta = (pacientId) => {
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT * FROM Obravnava WHERE pacient_id = ?`,
      [pacientId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

dataPool.getElektronskiKarton = (pacientId) => {
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT * FROM Elektronski_karton WHERE pacient_id = ?`,
      [pacientId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result[0]); // vrne en karton
      }
    );
  });
};

dataPool.updateElektronskiKarton = (pacientId, data) => {
  const { tezave, samomeritve, zdravila } = data;
  return new Promise((resolve, reject) => {
    conn.query(
      `UPDATE Elektronski_karton SET tezave = ?, samomeritve = ?, zdravila = ? WHERE pacient_id = ?`,
      [tezave, samomeritve, zdravila, pacientId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};


dataPool.oneNovica = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM news WHERE id = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.GetUserDetails = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT vloga_id FROM Uporabnik WHERE id = ?`, [id], (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
};



dataPool.creteNovica = (title, slug, text) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO news_new (title,slug,text,author_email) VALUES (?,?,?,?)`, [title, slug, text, username], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}
dataPool.creteUser = (realId, username, email, password) => {
  return new Promise((resolve, reject) => {
    
    const randomId = Math.floor(Math.random() * 500) + 1;

    
    conn.query(
      `INSERT INTO user_login (id, user_name, user_email, user_password) VALUES (?, ?, ?, ?)`,
      [realId, username, email, password],
      (err, res) => {
        if (err) return reject(err);

        
        conn.query(
          `INSERT INTO Uporabnik (id, ime, priimek, email, vloga_id) VALUES (?, ?, ?, ?, ?)`,
          [randomId, username, password, email, 700],
          (err2, res2) => {
            if (err2) return reject(err2);

            resolve({ user_login: res, uporabnik: res2 });
          }
        );
      }
    );
  });
};



//DELETE FROM news WHERE id = 42;
dataPool.deleteNovica = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`DELETE FROM news WHERE id = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}
//SELECT title, published_date, author FROM NEWS

dataPool.allUsers = () => {
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT id, ime, priimek, email, vloga_id FROM Uporabnik WHERE vloga_id = 700`,
      (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      }
    );
  });
};


dataPool.addObravnava = ({
  id,
  karton_id,
  tip_obravnave,
  opis,
  datum,
  izvajalec_id,
  pacient_id
}) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO Obravnava (id, karton_id, tip_obravnave, opis, datum, izvajalec_id, pacient_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    conn.query(query, [id, karton_id, tip_obravnave, opis, datum, izvajalec_id, pacient_id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};


dataPool.allKarton = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT * FROM Elektronski_karton`, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
};


dataPool.findUser = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT user_name From users `, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}



dataPool.AuthUser = (username) => {
  return new Promise((resolve, reject) => {
    conn.query('SELECT * FROM user_login WHERE user_name = ?', username, (err, res, fields) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })

}

dataPool.diagnozeZaObravnavo = (obravnavaId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM Diagnoza WHERE obravnava_id = ?";
    conn.query(query, [obravnavaId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/*
async function getPoziviZaPacienta(prejemnikId) {
  const [rows] = await connection.query(
    "SELECT * FROM Poziv WHERE prejemnik_id = ?",
    [prejemnikId]
  );
  return rows;
}
*/
dataPool.getPoziviZaPacienta = (pacientId) => {
  return new Promise((resolve, reject) => {
    conn.query(
      `SELECT * FROM Poziv WHERE prejemnik_id = ?`,
      [pacientId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result); 
      }
    );
  });
};


module.exports = dataPool;

