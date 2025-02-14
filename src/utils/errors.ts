export class TicketError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TicketError';
    }
}

export class StockError extends TicketError {
    constructor(message: string = 'Not enough tickets') {
        super(message);
        this.name = 'StockError';
    }
}

export class ConcurrencyError extends TicketError {
    constructor(message: string = 'System busy, please try again later') {
        super(message);
        this.name = 'ConcurrencyError';
    }
}