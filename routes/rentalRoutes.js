const express = require('express');
const { check } = require('express-validator');
const {
  getRentals,
  getUserRentals,
  getRental,
  createRental,
  updateRentalStatus,
  updatePaymentStatus,
  cancelRental,
  checkAvailability
} = require('../controllers/rentalController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/check-availability').post([
  check('carId', 'Car ID is required').not().isEmpty(),
  check('startDate', 'Start date is required').not().isEmpty(),
  check('endDate', 'End date is required').not().isEmpty()
], checkAvailability);

router.route('/my-rentals').get(getUserRentals);

router
  .route('/')
  .get(authorize('admin'), getRentals)
  .post([
    check('carId', 'Car ID is required').not().isEmpty(),
    check('startDate', 'Start date is required').not().isEmpty(),
    check('endDate', 'End date is required').not().isEmpty(),
    check('pickupLocation', 'Pickup location is required').not().isEmpty(),
    check('dropoffLocation', 'Dropoff location is required').not().isEmpty()
  ], createRental);

router
  .route('/:id')
  .get(getRental);

router
  .route('/:id/status')
  .put(authorize('admin'), updateRentalStatus);

router
  .route('/:id/payment')
  .put(authorize('admin'), updatePaymentStatus);

router
  .route('/:id/cancel')
  .put(cancelRental);

module.exports = router;