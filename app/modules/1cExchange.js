const { pool } = require('../../config/db');
const axios = require('axios');
const moment = require('moment');

async function exchange1C(apiData) {
  // const apiData = {
  //   faculty: "Институт системного анализа и управления",
  //   year: 2023,
  //   educationLevel: "бакалавриат",
  //   educationForm: "очная",
  //   profile: "Технологии разработки программного обеспечения",
  //   direction: "09.03.01 Информатика и вычислительная техника"
  // }

  try {
    const apiUrl = `https://1c-api.uni-dubna.ru/v1/api/persons/reports/GetWorkProgramOfDiscipline?Year=${apiData.year}&Education_Level=${apiData.educationLevel}&Education_Form=${apiData.educationForm}&Profile=${apiData.profile}&Direction=${apiData.direction}`;
    const response = await axios.get(apiUrl, {timeout: 30000});
    if (!response.data) {
      throw new Error('Нет данных от 1С', {statusCode: 503})
    }
    const records = await response.data;
    const recordsLength = records.length;
    console.log(`Всего дисциплин из запроса - ${recordsLength}`);

    const createRpdComplect = await pool.query(`
    INSERT INTO rpd_complects (
      faculty,
      year,
      education_form,
      education_level,
      profile,
      direction
    ) VALUES (
      $1, $2, $3, $4, $5, $6
    ) RETURNING id
    `, [
      apiData.faculty, 
      apiData.year, 
      apiData.educationForm,
      apiData.educationLevel,
      apiData.profile,
      apiData.direction
    ]);

    const RpdComplectId = createRpdComplect.rows[0]?.id;
    if(!RpdComplectId) {
      throw new Error('Ошибка создания комплекта РПД');
    }

    let currentIndex = 0;
    for (const record of records) {
      console.log(`Дисциплина ${++currentIndex} из ${recordsLength}`);
      const apiUpLink = `https://1c-api.uni-dubna.ru/v1/api/persons/reports/GetEducationResults?UPLink=${record.upLink}`;
      const responseUpLink = await axios.get(apiUpLink);
      if (responseUpLink.status !== 200) {
        throw new Error('Данные в 1С не были найдены');
      }
      const educationResults = await responseUpLink.data;

      const {
        department,
        discipline,
        teachers,
        zet,
        place,
        study_load,
        semester
      } = record;

      const insertQuery = `
      INSERT INTO rpd_1c_exchange (
        id_rpd_complect,
        department,  
        discipline, 
        teachers, 
        results, 
        zet, 
        place, 
        study_load, 
        semester
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) 
      ON CONFLICT DO NOTHING
      RETURNING id`;

      const result = await pool.query(insertQuery, [
        RpdComplectId,
        department,
        discipline,
        teachers,
        educationResults,
        zet,
        place,
        JSON.stringify(study_load),
        semester,
      ]);

      const insertedId = result.rows[0].id;
      const history = [{
          date: moment().format(),
          status: "Выгружен из 1С",
          user: "Система"
      }]

      await pool.query(`
        INSERT INTO template_status (id_1c_template, history) 
        VALUES (${JSON.stringify(insertedId)}, '${JSON.stringify(history)}')
      `);
    }

    console.log('Данные успешно добавлены в базу данных.');
    return RpdComplectId;
  } catch (error) {
    console.error(error);
    if (error.code === "ECONNABORTED" || error.response?.status === 504) {
        const serviceError = new Error('Сервис 1С временно недоступен');
        serviceError.statusCode = 503;
        throw serviceError;
    }
    throw error;
  }
}

module.exports = { exchange1C }