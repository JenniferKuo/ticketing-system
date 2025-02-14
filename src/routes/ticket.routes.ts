import { Router } from 'express';
import { TicketController } from '../controllers/TicketController';

const router = Router();
const ticketController = new TicketController();

router.post('/reserve', async (req, res, next) => {
    try {
        await ticketController.reserveTicket(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/event/:eventId', async (req, res, next) => {
    try {
        await ticketController.getEventStatus(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;