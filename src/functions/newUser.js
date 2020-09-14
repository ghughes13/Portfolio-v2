require("dotenv").config()

const mongoose = require("mongoose")

mongoose.connect(
  "mongodb+srv://Self-Taught-Dev:OpNJ3was2dAbOT8h@selftaughtdev.exocz.mongodb.net/ProjectArchiveData?retryWrites=true&w=majority",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }
)

console.log(process.env.DBURL)

mongoose.connection.on("connected", () => {
  console.log("should be connected")
})

//Schema
const Schema = mongoose.Schema

const userSchema = new Schema({
  userName: String,
  password: String,
  firstName: String,
  lastName: String,
  email: String,
  accountType: String,
})

const newUserModel = mongoose.model("users", userSchema)

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST",
}

function handleRequest(event, context, callback) {
  let body

  console.log("submitting")
  try {
    console.log("trying to parse body")
    body = JSON.parse(event.body)
  } catch {
    console.log("there was an error; Sending response")
    sendErrorMessage(400, "Body not formatted in JSON.", callback)
  }

  console.log(body)
  console.log(body.userName)
  console.log(body.password)
  console.log(body.firstName)
  console.log(body.lastName)
  console.log(body.email)

  const newUser = new newUserModel({
    userName: body.userName,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    accountType: "lite",
  })

  console.log(newUser)
  console.log("No Error; Trying to save to DB")

  newUser.save(err => {
    if (err) {
      console.error(err)
    } else {
      console.log("saved data!")
    }
  })

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  }

  callback(null, response)
}

function sendErrorMessage(statusCode, message, callback) {
  console.log("below is the error message")
  console.error(message)

  callback(null, {
    statusCode,
    headers,
    body: JSON.stringify({ message }),
  })
}

exports.handler = handleRequest
