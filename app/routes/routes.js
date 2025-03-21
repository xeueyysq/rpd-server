const express = require("express");
const router = express.Router();
const generatePDF = require("../pdf-generator/document-generator");
const { pool } = require("../../config/db");

const RpdChangeableValuesController = require("../controllers/rpdChangeableValuesController");
const rpdChangeableValuesController = new RpdChangeableValuesController(pool);

router.get(
  "/rpd-changeable-values",
  rpdChangeableValuesController.getChangeableValues.bind(
    rpdChangeableValuesController
  )
);
router.put(
  "/rpd-changeable-values/:id",
  rpdChangeableValuesController.updateChangeableValue.bind(
    rpdChangeableValuesController
  )
);

const RpdProfileTemplatesController = require("../controllers/rpdProfileTemplatesController");
const rpdProfileTemplatesController = new RpdProfileTemplatesController(pool);

router.post(
  "/rpd-profile-templates",
  rpdProfileTemplatesController.getJsonProfile.bind(
    rpdProfileTemplatesController
  )
);
router.put(
  "/update-json-value/:id",
  rpdProfileTemplatesController.updateById.bind(rpdProfileTemplatesController)
);
router.get(
  "/find-by-criteria",
  rpdProfileTemplatesController.findByCriteria.bind(
    rpdProfileTemplatesController
  )
);
router.post(
  "/find-or-create-profile-template",
  rpdProfileTemplatesController.findOrCreate.bind(rpdProfileTemplatesController)
);

const Rpd1cExchangeController = require("../controllers/rpd1cExchangeController");
const rpd1cExchangeController = new Rpd1cExchangeController(pool);

router.post(
  "/set-results-data",
  rpd1cExchangeController.setResultsData.bind(rpd1cExchangeController)
);
router.post(
  "/find-rpd",
  rpd1cExchangeController.findRpd.bind(rpd1cExchangeController)
);
router.post(
  "/create-profile-template-from-1c",
  rpd1cExchangeController.createTemplate.bind(rpd1cExchangeController)
);

const TeacherTemplatesController = require("../controllers/teacherTemplatesController");
const teacherTemplatesController = new TeacherTemplatesController(pool);

router.post(
  "/send-template-to-teacher",
  teacherTemplatesController.bindTemplateWithTeacher.bind(
    teacherTemplatesController
  )
);
router.post(
  "/find-teacher-templates",
  teacherTemplatesController.findTeacherTemplates.bind(
    teacherTemplatesController
  )
);
router.post(
  "/employed-teacher-template",
  teacherTemplatesController.employedTemplate.bind(teacherTemplatesController)
);

const RpdComplectsController = require("../controllers/rpdComplectsController");
const rpdComplectsController = new RpdComplectsController(pool);

router.post(
  "/find_rpd_complect",
  rpdComplectsController.findRpdComplect.bind(rpdComplectsController)
);
router.post(
  "/create_rpd_complect",
  rpdComplectsController.createRpdComplect.bind(rpdComplectsController)
);
router.get(
  "/get-rpd-complects",
  rpdComplectsController.getAllRpdComplects.bind(rpdComplectsController)
);

const TemplateStatusController = require("../controllers/templateStatusController");
const templateStatusController = new TemplateStatusController(pool);
router.post(
  "/get-template-history",
  templateStatusController.getTemplateHistory.bind(templateStatusController)
);

const findBooks = require("../modules/findBooks");
router.post("/find-books", findBooks);

const UsersController = require("../controllers/usersController");
const usersController = new UsersController(pool);
router.get("/get-users", usersController.findUsers.bind(usersController));
router.post("/add-user", usersController.addUser.bind(usersController));
router.post(
  "/update-user-role",
  usersController.updateUserRole.bind(usersController)
);
router.delete(
  "/delete-user/:userId",
  usersController.deleteUser.bind(usersController)
);

router.get("/generate-pdf", async (req, res) => {
  try {
    const { id } = req.query;
    const pdfBuffer = await generatePDF(id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=example.pdf");

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

module.exports = router;
