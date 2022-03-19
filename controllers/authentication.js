const { verify, sign } = require("jsonwebtoken");
const fs = require("fs");
const private_key = fs.readFileSync(__dirname + "/jwtRS256.pem");
const public_key = fs.readFileSync(__dirname + "/jwtRS256.key.pub");

const generateToken = (user) => {
  const { id, quota } = user;
  const token = sign({ id, quota }, private_key, {
    algorithm: "RS256",
    expiresIn: "5m",
  });
  return token;
};

//=============================================s==================

const verifyToken = (token) => {
  return verify(token, public_key, {
    algorithm: ["RS256"],
  });
};

module.exports = {
  generateToken: generateToken,
  verifyToken: verifyToken,
};
