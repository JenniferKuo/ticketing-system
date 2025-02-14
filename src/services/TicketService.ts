import { PrismaClient } from '@prisma/client';
import { TicketError } from '../utils/errors';

export class TicketService {
    constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

    /**
     * 搶票核心邏輯
     */
    async reserveTicket(eventId: number, userId: number): Promise<any> {
        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. 檢查活動是否存在且有票
                const event = await tx.event.findUnique({
                    where: { id: eventId }
                });

                if (!event || event.availableTickets <= 0) {
                    throw new TicketError('No tickets available');
                }

                // 2. 檢查用戶是否已經購買過
                const existingOrder = await tx.order.findFirst({
                    where: {
                        userId,
                        ticket: {
                            eventId
                        },
                        status: {
                            in: ['PENDING', 'CONFIRMED']
                        }
                    }
                });

                if (existingOrder) {
                    throw new TicketError('You already have a ticket for this event');
                }

                // 3. 找到一張可用票券
                const ticket = await tx.ticket.findFirst({
                    where: {
                        eventId,
                        status: 'AVAILABLE'
                    }
                });

                if (!ticket) {
                    throw new TicketError('No tickets available');
                }

                // 4. 創建訂單
                const order = await tx.order.create({
                    data: {
                        userId,
                        ticketId: ticket.id,
                        status: 'PENDING'
                    }
                });

                // 5. 更新票券狀態
                await tx.ticket.update({
                    where: { id: ticket.id },
                    data: { status: 'RESERVED' }
                });

                // 6. 更新活動可用票券數量
                await tx.event.update({
                    where: { id: eventId },
                    data: {
                        availableTickets: {
                            decrement: 1
                        }
                    }
                });

                return { ticket, order };
            });

        } catch (error) {
            if (error instanceof TicketError) {
                throw error;
            }
            throw new Error('Failed to reserve ticket');
        }
    }

    /**
     * 查詢活動狀態
     */
    async getEventStatus(eventId: number) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                _count: {
                    select: {
                        tickets: {
                            where: { status: 'AVAILABLE' }
                        }
                    }
                }
            }
        });

        if (!event) {
            throw new TicketError('Event not found');
        }

        return {
            event,
            availableTickets: event._count.tickets
        };
    }
}