const RpdProfileTemplates = require("../models/rpd_profile_templates");

class RpdProfileTemplatesController {
  constructor(pool) {
    this.model = new RpdProfileTemplates(pool);
  }

  async getJsonProfile(req, res) {
    try {
      const { id } = req.body;
      const value = await this.model.getJsonProfile(id);
      res.json(value);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async updateById(req, res) {
    try {
      const updatedItem = await this.model.updateById(
        req.params.id,
        req.body.fieldToUpdate,
        req.body.value
      );
      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(updatedItem);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async findByCriteria(req, res) {
    try {
      const {
        faculty,
        levelEducation,
        directionOfStudy,
        profile,
        formEducation,
        year,
      } = req.query;
      const records = await this.model.findByCriteria(
        faculty,
        levelEducation,
        directionOfStudy,
        profile,
        formEducation,
        year
      );
      res.json(records);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async findOrCreate(req, res) {
    try {
      const { disciplinsName, id, year, userName } = req.body;
      const record = await this.model.findOrCreateByDisciplineAndYear(
        disciplinsName,
        id,
        year,
        userName
      );
      res.json(record);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = RpdProfileTemplatesController;
