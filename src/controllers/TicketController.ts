import { Request, Response } from 'express';
import { TicketService } from '../services/TicketService';
import { TicketError } from '../utils/errors';

export class TicketController {
    private ticketService: TicketService;

    constructor() {
        this.ticketService = new TicketService();
    }

    async reserveTicket(req: Request, res: Response) {
        try {
            const { eventId, userId } = req.body;

            if (!eventId || !userId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: eventId or userId'
                });
            }

            const result = await this.ticketService.reserveTicket(
                parseInt(eventId),
                parseInt(userId)
            );

            return res.status(200).json({
                success: true,
                data: result
            });

        } catch (error) {
            if (error instanceof TicketError) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            console.error('Ticket reservation error:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getEventStatus(req: Request, res: Response) {
        try {
            const { eventId } = req.params;

            if (!eventId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required field: eventId'
                });
            }

            const status = await this.ticketService.getEventStatus(parseInt(eventId));

            return res.status(200).json({
                success: true,
                data: status
            });

        } catch (error) {
            if (error instanceof TicketError) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            console.error('Get event status error:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}