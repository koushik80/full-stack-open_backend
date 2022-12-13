//ex 3.13-3.14

const express = require('express');
const morgan = require('morgan')
const app = express();
const cors = require('cors');
require('dotenv').config();
const Person = require('./models/person');

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

app.use(express.json());

app.use(requestLogger);

app.use(cors());

app.use(express.static('build'));

morgan.token('content', (request) =>
  request.method === 'POST' && request.body.name
    ? JSON.stringify(request.body)
    : null
)

app.get('/api/persons', (req, res) => {
  Person.find({})
    .then(persons => {
    res.json(persons)
  })
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

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
    .then(person => {
    res.json(person)
  })
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id === id)

  res.status(204).end()
});

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (body.name === undefined || body.number === undefined) {
    return res.status(400)
      .json({ error: 'name or number is missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then(savedPerson => {
    res.json(savedPerson)
  })
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
