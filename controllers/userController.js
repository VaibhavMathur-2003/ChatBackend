const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const userDb = 'Chat'
const { MongoClient, ObjectId } = require('mongodb');

const Mongo_URL="mongodb+srv://mathurvaibhav010:wLtQ1WuC7t1oDLNf@cluster0.e0m91oa.mongodb.net/Chat?retryWrites=true&w=majority"

const userCollectionDb = 'users'

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const client = await MongoClient.connect(Mongo_URL);
    const usercollection = client.db(userDb).collection(userCollectionDb);

    const user = await usercollection.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await MongoClient.connect(Mongo_URL);

    const usercollection = client.db(userDb).collection(userCollectionDb);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    await usercollection.insertOne(user);
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};



module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};
