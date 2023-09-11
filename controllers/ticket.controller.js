const { USERTYPES, USER_STATUS } = require("../constant");
const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");

async function createTicket(req, res) {
    try {
    const ticketObj = req.body;
    ticketObj.reporter = req.userId;

    // find a engineer in the db and set ticketObj.assinee = userId;
    // every time a random engineer should assignee a ticket \
    const engineerCount = await User.count({
        userType: USERTYPES.ENGINEER,
        userStatus:USER_STATUS.APPROVED,
    });
    const random = Math.floor(Math.random() * engineerCount);
  const assignee = await User.findOne({
    userType: USERTYPES.ENGINEER,
        userStatus:USER_STATUS.APPROVED,
  }).skip(random);
  ticketObj.assignee = assignee.userId;

  const ticket = await Ticket.create(ticketObj);
  res.send(ticket);

    } catch (ex) {
        res.status(500).send({
            message: `Error occured  - ${ex.message}`
        })
    }

}
async function updateTicket(req, res) {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ _id: id });
    if (
        ticket.assignee === req.userId || 
        ticket.reporter === req.userId ||
        req.userType === USERTYPES.ADMIN
    ) {
        const updateTicket = await Ticket.findByIdAndUpdate(id, req.body);
        res.send(updateTicket);
    } else {
        req.status(403).send({
            message: "Only the ticket reporter, or the engineer,  or an admin can update the ticket",
        });
    }
}

async function getAllTickets(req, res ) {
    // If the user is admin , then return all tickets 
    // If the user is an engineer, return tickets assigned to him in engineering world always use gender as netural like them 
    // If the user is a costmer, then return tickets created by them 
    let filterObj = {};
    if (req.userType === USERTYPES.ENGINEER) {
        filterObj = { assignee: req.userId };
    } else if (req.userType ===USERTYPES.CUSTOMER) {
        filterObj = { reporter: req.userId };
  }
  const tickets = await Ticket.find(filterObj);
  res.send(tickets);
}


async  function getTicketById(req, res) {
    try {
    const ticket =await Ticket.findById(req.params.id);
     res.send(ticket);
} catch (ex) {
    res.status(404).send({
        message: `Ticket with id ${req.params.id} not found`,
    })
} 
}
module.exports = {
    createTicket,
    updateTicket,
    getAllTickets,
    getTicketById,
};