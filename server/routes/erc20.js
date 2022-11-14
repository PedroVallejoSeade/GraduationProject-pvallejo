const { Router } = require('express');

const { erc20Get, erc20Put, erc20Post, erc20Delete } = require('../controllers/erc20');

const router = Router();

router.get('/', erc20Get );

router.put('/', erc20Put );

router.post('/', erc20Post );

router.delete('/', erc20Delete);

module.exports = router;