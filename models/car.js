const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - make
 *         - model
 *         - year
 *         - pricePerDay
 *         - available
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         make:
 *           type: string
 *           description: Car manufacturer
 *         model:
 *           type: string
 *           description: Car model
 *         year:
 *           type: number
 *           description: Manufacturing year
 *         description:
 *           type: string
 *           description: Detailed description of the car
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: List of car features
 *         pricePerDay:
 *           type: number
 *           description: Rental price per day
 *         available:
 *           type: boolean
 *           default: true
 *           description: Availability status
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs of car images
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the car was added
 *       example:
 *         make: Mercedes-Benz
 *         model: S-Class
 *         year: 2023
 *         description: Luxury sedan with premium features
 *         features: ["Leather seats", "Panoramic roof", "Massage seats", "Premium sound system"]
 *         pricePerDay: 200
 *         available: true
 *         images: ["image1.jpg", "image2.jpg"]
 */
const CarSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'Please provide car make']
  },
  model: {
    type: String,
    required: [true, 'Please provide car model']
  },
  year: {
    type: Number,
    required: [true, 'Please provide manufacturing year']
  },
  description: {
    type: String
  },
  features: {
    type: [String]
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please provide price per day']
  },
  available: {
    type: Boolean,
    default: true
  },
  images: {
    type: [String]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Car', CarSchema);