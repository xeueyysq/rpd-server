const RpdComplects = require("../models/rpd_complects");

class RpdComplectsController {
    constructor(pool) {
        this.model = new RpdComplects(pool);
    }

    async findRpdComplect(req, res) {
        try {
            const { data } = req.body;
            const record = await this.model.findRpdComplect(data);
            res.json(record);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createRpdComplect(req, res) {
        try {
            const { data } = req.body;
            const record = await this.model.createRpdComplect(data);
            res.json(record);
        } catch (error) {
            const errorCode = error.statusCode || 500
            res.status(errorCode).json({ message: error.message, code: errorCode });
        }
    }

    async getAllRpdComplects(req, res) {
        try {
            const records = await this.model.getAllRpdComplects();
            res.json(records);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllRpdComplects(req, res) {
        try {
            const records = await this.model.getAllRpdComplects();
            res.json(records);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = RpdComplectsController;