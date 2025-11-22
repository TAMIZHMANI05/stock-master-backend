const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const warehouseSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => uuidv4(),
        unique: true,
    },
    name:{
        type: String,
        required: true,
    },
    address:{
        type: String,
        required: true,
    }
},{
    timestamps: true,
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;
