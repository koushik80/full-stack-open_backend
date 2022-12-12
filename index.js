//ex 3.9-3.11-step9-11

const express = require('express');
const app = express();
//const morgan = require('morgan');
const cors = require('cors')

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
];

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.json());
app.use(cors());
app.use(express.static('build'));
app.use(requestLogger);


app.get('/api/persons', (req, res) => {
  res.json(persons)
});

app.get('/info', (req, res) => {
  const currentDate = new Date().toString();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      res.send(
        `<div>
            <p>Phonebook has info for ${persons.length} people</p>
          </div>
          <div>
            <p>${currentDate} (${timeZone})</p>
          </div>`
      )
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id === id)
  res.status(204).end()
});

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.random(Math.max(...persons.map(p => p.id)))
    : 0
  return maxId + 1
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  if (!body.name || !body.number) {
    return res.status(404).json({
      error: 'The name or number is missing'
    })
  }
  persons = persons.concat(person)
  res.json(person)
});


const PORT = 5001
app.listen(PORT, () => {
  console.log(`Server blasting on port ${PORT}`);
});
