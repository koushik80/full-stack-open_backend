
/*
const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url = ``

const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)


mongoose.set('strictQuery', false);
mongoose.connect(url)
  .then((result) => {
    console.log('connected')
    const person = new Person({
      id: '10',
      name: 'Lari',
      number: '040-7403490',
    })
    return person.save()
  }
);
Person.find({})
  .then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
  .catch((err) => console.log(err))

*/
