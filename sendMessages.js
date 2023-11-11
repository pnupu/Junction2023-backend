require('dotenv').config()
const auth = Buffer.from(process.env.ELK_API).toString("base64");
const fs = require('fs');

const numberData = fs.readFileSync("phoneNumbers.json");
const phoneNumbers = JSON.parse(numberData);

for(const number of phoneNumbers.numbers) {
    let data = {
    from:    "Pawlie",
    to:      number,
    message: "GetPawlie: You have a new mission!"
    }

    data = new URLSearchParams(data);
    data = data.toString();
    fetch("https://api.46elks.com/a1/sms", {
    method: "post",
    body: data,
    headers: {"Authorization": "Basic "  + auth}
    })
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.log(err))
}