const express = require('express');
const { check } = require('express-validator');
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  searchCars
} = require('../controllers/carController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/search').get(searchCars);

router
  .route('/')
  .get(getCars)
  .post(
    [
      check('make', 'Make is required').not().isEmpty(),
      check('model', 'Model is required').not().isEmpty(),
      check('year', 'Year is required').isNumeric(),
      check('color', 'Color is required').not().isEmpty(),
      check('licensePlate', 'License plate is required').not().isEmpty(),
      check('dailyRate', 'Daily rate is required').isNumeric(),
      check('category', 'Category is required').not().isEmpty(),
      check('seats', 'Number of seats is required').isNumeric(),
      check('transmission', 'Transmission type is required').not().isEmpty(),
      check('fuelType', 'Fuel type is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty()
    ],
    protect, 
    authorize('admin'), 
    createCar
  );

router
  .route('/:id')
  .get(getCar)
  .put(protect, authorize('admin'), updateCar)
  .delete(protect, authorize('admin'), deleteCar);

module.exports = router;