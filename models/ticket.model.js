const mongoose = require('mongoose');
const { TICKET_STATUS } = require('../constant');


const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    ticketPriority: {
        type: Number,
        require: true,
        default: 4
    },
    description: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true, 
        default: TICKET_STATUS.OPEN
    },
    reporter: String,
    assignee: String,

    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    },
}) 

const Ticket = mongoose.model("ticket", ticketSchema);
module.exports = Ticket;