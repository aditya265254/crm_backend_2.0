const { USERTYPES, USER_STATUS } = require("../constants");
const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");

async function createTicket(req, res) {
    try {
        const ticketObj = { ...req.body };
        ticketObj.reporter = req.userId;

        const engineerCount = await User.countDocuments({
            userType: USERTYPES.ENGINEER,
            userStatus: USER_STATUS.APPROVED,
        });

        if (engineerCount > 0) {
            const random = Math.floor(Math.random() * engineerCount);
            const assignee = await User.findOne({
                userType: USERTYPES.ENGINEER,
                userStatus: USER_STATUS.APPROVED,
            }).skip(random);
            if (assignee) {
                ticketObj.assignee = assignee.userId;
            }
        }

        const ticket = await Ticket.create(ticketObj);
        res.status(201).send(ticket);
    } catch (ex) {
        res.status(500).send({
            message: `Error occurred - ${ex.message}`,
        });
    }
}

async function updateTicket(req, res) {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findOne({ _id: id });
        if (!ticket) {
            return res.status(404).send({ message: `Ticket with id ${id} not found` });
        }

        if (
            ticket.assignee === req.userId ||
            ticket.reporter === req.userId ||
            req.userType === USERTYPES.ADMIN
        ) {
            const updateObj = { ...req.body, updatedAt: Date.now() };
            const updatedTicket = await Ticket.findByIdAndUpdate(id, updateObj, { new: true });
            res.status(200).send(updatedTicket);
        } else {
            res.status(403).send({
                message: "Only the ticket reporter, assigned engineer, or an admin can update this ticket",
            });
        }
    } catch (ex) {
        res.status(500).send({
            message: `Error updating ticket: ${ex.message}`,
        });
    }
}

async function getAllTickets(req, res) {
    try {
        let filterObj = {};
        if (req.userType === USERTYPES.ENGINEER) {
            filterObj = { assignee: req.userId };
        } else if (req.userType === USERTYPES.CUSTOMER) {
            filterObj = { reporter: req.userId };
        }
        const tickets = await Ticket.find(filterObj);
        res.status(200).send(tickets);
    } catch (ex) {
        res.status(500).send({
            message: `Error fetching tickets: ${ex.message}`,
        });
    }
}

async function getTicketById(req, res) {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).send({
                message: `Ticket with id ${req.params.id} not found`,
            });
        }
        res.status(200).send(ticket);
    } catch (ex) {
        res.status(404).send({
            message: `Ticket with id ${req.params.id} not found`,
        });
    }
}

module.exports = {
    createTicket,
    updateTicket,
    getAllTickets,
    getTicketById,
};
