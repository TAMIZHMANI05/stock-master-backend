const express = require('express');
const { getAllWarehouses,createWarehouse,getWarehouseById,deleteWarehouse,updateWarehouse } = require('./warehouse.controllers');

const router = express.Router();

router.route('/').get(getAllWarehouses).post(createWarehouse);
router.route('/:id').get(getWarehouseById).put(updateWarehouse).delete(deleteWarehouse);

module.exports = router;