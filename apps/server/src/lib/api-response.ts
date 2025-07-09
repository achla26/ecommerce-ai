import { Response } from 'express';

class ApiResponse {

    constructor(
        private res: Response,
        private statusCode: number,
        private message: string,
        private data?: any,
        private meta?: any
    ) {
        this.res = res;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.meta = meta;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
            // Spread the properties if it's a plain object
            this.data = { ...data };
            Object.assign(this, data);
        } else {
            this.data = data;
        }

        this.res.status(this.statusCode).json({
            status: this.statusCode,
            success: this.statusCode < 400,
            message: this.message,
            data: this.data,
        });
    }
}

export { ApiResponse };
