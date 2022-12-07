//ex 3.2-step2

const express = require('express');
const app = express();

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
]

app.use(express.json());

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

const PORT = 5001
app.listen(PORT, () => {
  console.log(`Server blasting on port ${PORT}`);
});