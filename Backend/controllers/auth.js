const db = require('../models');

const signup = (async (req, res) => {
    let data = await db.User.create(req.body);
    if (data) return res.send({ status: 1, data });
    res.send({ status: 0 });
});

const login = (async (req, res) => {
    console.log(req.body);
    let { id, pin } = req.body;
    let user = await db.User.findOne({ where: { id } });
    if (user) {
        if (user.pin == pin) return res.send({ status: 1, data: user });
        else return res.send({ status: 0, message: 'Invalid PIN' });
    }
    res.send({ status: 0, message: 'Invalid user id' });
});

module.exports = { signup, login };