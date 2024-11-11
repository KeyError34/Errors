import http from 'http';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import url from 'url';
import 'dotenv/config';
import fs from 'fs';
const port = process.env.PORT;
const secret_key = process.env.SECRET_KEY;
const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500']; //  домены

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
function logErrorToFile(errorMessage) {
  const errorLog = `${new Date().toISOString()} - ERROR: ${errorMessage}\n`;
  fs.appendFile('errors.log', errorLog, (err) => {
    if (err) {
      console.error('Error logging to file:', err);
    }
  });
}
const server = http.createServer((req, res) => {
  try {
    // CORS заголовки
    cors(corsOptions)(req, res, () => {
      const parsedUrl = url.parse(req.url, true);

      // проверка авторизации
      if (req.method === 'POST' && parsedUrl.pathname === '/login') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          const { username, password } = JSON.parse(body);

          // проверка логина и пароля
          if (username === 'admin' && password === 'password') {
            const token = jwt.sign({ username }, secret_key, {
              expiresIn: '1h',
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ token }));
          } else {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('Unauthorized');
            logErrorToFile('Unauthorized access attempt.');
          }
        });
      }
      // Обработка PUT запроса
      else if (req.method === 'PUT' && parsedUrl.pathname === '/update') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('PUT-запрос обработан');
      }

      // Обработка DELETE запроса
      else if (req.method === 'DELETE' && parsedUrl.pathname === '/delete') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('DELETE-запрос обработан');
      }
      // защищенный эндпоинт
      else if (req.method === 'GET' && parsedUrl.pathname === '/protected') {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
          const token = authHeader.split(' ')[1];
          jwt.verify(token, secret_key, (err, user) => {
            if (err) {
              res.writeHead(403, { 'Content-Type': 'text/plain' });
              res.end('Forbidden');
              logErrorToFile('Invalid token access attempt.');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/plain' });
              res.end('Protected content accessed');
            }
          });
        } else {
          res.writeHead(401, { 'Content-Type': 'text/plain' });
          res.end('Unauthorized');
          logErrorToFile('No token provided for protected endpoint.');
        }
      }

      // все другие маршруты
      else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        logErrorToFile('Page not found.');
      }
    });
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
    logErrorToFile(`Server error: ${error.message}`);
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
