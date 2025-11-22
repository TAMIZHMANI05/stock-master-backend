const Warehouse = require('./warehouse.model');
const httpResponse = require('../../utils/httpResponse');
const httpError = require('../../utils/httpError');

const getAllWarehouses = async (req, res, next) => {
    try {
        const warehouses = await Warehouse.find();
        httpResponse(req, res, 200, 'Warehouses retrieved successfully', warehouses);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

const getWarehouseById = async (req, res, next) => {
    try {
        const {id} = req.params;
        const warehouse = await Warehouse.findOne({id});
        if(!warehouse){
            return httpError(next, new Error('Warehouse not found'), req, 404);
        }
        httpResponse(req, res, 200, 'Warehouse retrieved successfully', warehouse);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

const createWarehouse = async (req, res, next) => {
    try {
        const { name, address } = req.body;
        const newWarehouse = new Warehouse({ name, address });
        await newWarehouse.save();
        httpResponse(req, res, 201, 'Warehouse created successfully', newWarehouse);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

const updateWarehouse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, address } = req.body;

        const warehouse = await Warehouse.findOneAndUpdate({ id }, { name, address }, { new: true, runValidators: true });

        if (!warehouse) {
            return httpError(next, new Error('Warehouse not found'), req, 404);
        }

        httpResponse(req, res, 200, 'Warehouse updated successfully', warehouse);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

const deleteWarehouse = async (req, res, next) => {
    try {
        const { id } = req.params;

        const warehouse = await Warehouse.findOneAndDelete({ id });

        if (!warehouse) {
            return httpError(next, new Error('Warehouse not found'), req, 404);
        }

        httpResponse(req, res, 200, 'Warehouse deleted successfully', warehouse);
    } catch (error) {
        httpError(next, error, req, 500);
    }
};

module.exports = {
    getAllWarehouses,
    createWarehouse,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse
};
