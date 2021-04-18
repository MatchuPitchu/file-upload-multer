import express from 'express';
// Dotenv is zero-dependency module, loads environment variables from .env file into process.env.
import 'dotenv/config.js';
// Tutorial description multer: https://code.tutsplus.com/tutorials/file-upload-with-multer-in-node--cms-32088
import multer from 'multer';
// built-in module of NodeJS
import path from 'path';
// Wenn ich zu URL-Path Zugang haben will in ES6 (s.u. const __dirname = ...), 
// muss ich hier built-in module of NodeJS importieren
import url from 'url';
import { dateFormatted } from './date.js';

const app = express();
const port = process.env.PORT || 3000;

// Unverzichtbar const __dirname anzulegen, wenn ich import path from 'path" mit ES6 module nutze, 
// statt in konventionellem JS Code mit require('path')
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(publicDir, 'uploads');

// define mimeTypes that are allowed for upload later
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
const mimeTypesImg = ['image/jpeg', 'image/png', 'image/gif']
const mimeTypesFiles = [ 
  'image/jpeg', 
  'image/png', 
  'image/gif',
  'text/plain',
  'text/html',
  'text/css',
  'text/csv', 
  'application/msword', 
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-excel',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.text',
  'application/pdf',
  'application/rtf'
]

// use multer.diskStorage, to define destination + filename
// Description: https://code.tutsplus.com/tutorials/file-upload-with-multer-in-node--cms-32088
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, dateFormatted + '-' + file.originalname)
});

// use defined storage in multer-options-objects below 
// + fileFilter (only above defined mimTypes are accepted)
const uploadImg = multer( { 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const isAccepted = mimeTypesImg.includes(file.mimetype);
    if(!isAccepted) {
      req.fileValidationError = `Mimetype of file is not accepted: ${file.mimetype}`;
      return cb(null, false, new Error(`Mimetype of file is not accepted: ${file.mimetype}`))
    }
    cb(null, isAccepted)
  }
});

const uploadFiles = multer( { 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const isAccepted = mimeTypesFiles.includes(file.mimetype);
    if(!isAccepted) {
      req.fileValidationError = `Mimetype of file is not accepted: ${file.mimetype}`;
      return cb(null, false, new Error(`Mimetype of file is not accepted: ${file.mimetype}`))
    }
    cb(null, isAccepted)
  }
});

// global middleware, wird bei allen paths aufgerufen
// Hier kann ich festlegen, dass immer ein static file geservt werden soll,
// was hier aus 'public' directory kommt (siehe const publicDir)
// express.static ersetzt { root: publicDir } darunter 
app.use(express.static(publicDir));
app.get('/', (req, res) => res.sendFile('index.html', /* { root: publicDir } */ ));

// Singe file upload
app.post('/upload-single-file', uploadFiles.single('user-file'), (req, res, next) => {
  console.log(req.fileValidationError);
  const { file, fileValidationError } = req;
  if(!file) return res.status(400).json( {message: 'Please upload a file'} );
  if(fileValidationError) return res.status(400).json( {message: fileValidationError} );
  res.json(file)
})

// Multiple files upload
app.post('/upload-multiple-files', uploadFiles.array('user-files', 5), (req, res, next) => {
  
  const { files, fileValidationError } = req;
  if(!files) return res.status(400).json( {message: 'Please upload your files'} );
  if(fileValidationError) return res.status(400).json( {message: fileValidationError} );
  res.json(files)
})

// Image upload
app.post('/upload-img', uploadImg.single('user-img'), (req, res) => {
  const { file, fileValidationError } = req;
  if(!file) return res.status(400).json( {message: 'Please upload an image (jpeg, png, gif)'});
  if(fileValidationError) return res.status(400).json( {message: fileValidationError} );
  // Send uploaded img to client to display it
  res.send(`<div>Your image is stored as "${file.filename}": <img src="uploads/${file.filename}" width="400" /></div>`)
  // res.json(file);
})

app.listen(port, () => console.log(`Server running on port http://localhost:${port}`))