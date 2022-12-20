const express = require('express');
const morgan = require('morgan')
const app = express();
const cors = require('cors');
require('dotenv').config();
const Person = require('./models/person');

const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('---')
  next()
}

app.use(express.json());

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

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

/*
app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
});
*/

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end
    })
    .catch(error => next(error))
});

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const personDetail = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, personDetail, { new: true })
    .then(updatedPerson => {
    res.json(updatedPerson)
  })
    .catch(error => next(error))
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

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'castError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

// handler of requests with result to errors
app.use(errorHandler);

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});