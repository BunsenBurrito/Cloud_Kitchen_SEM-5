// Mounts every route file under /api. Add new components here.
const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/menu', require('./menu'));
router.use('/orders', require('./orders'));
router.use('/staff', require('./staff'));
router.use('/ingredients', require('./ingredients'));
router.use('/inventory', require('./inventory'));
router.use('/suppliers', require('./suppliers'));
router.use('/purchases', require('./purchases'));
router.use('/salaries', require('./salaries'));
router.use('/billing', require('./billing'));
router.use('/payments', require('./payments'));
router.use('/dashboard', require('./dashboard'));

module.exports = router;
