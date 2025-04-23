const Rental = require('../models/rental');
const car = require('../models/car');
const { validationResult } = require('express-validator');

// @desc    Get all rentals
// @route   GET /api/rentals
// @access  Private (Admin)
exports.getRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate({
        path: 'user',
        select: 'name email phoneNumber'
      })
      .populate('car');
    
    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user rentals
// @route   GET /api/rentals/my-rentals
// @access  Private
exports.getUserRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.user.id })
      .populate('car');
    
    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single rental
// @route   GET /api/rentals/:id
// @access  Private
exports.getRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email phoneNumber'
      })
      .populate('car');
    
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }
    
    // Make sure user is rental owner or admin
    if (rental.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this rental'
      });
    }
    
    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create a rental
// @route   POST /api/rentals
// @access  Private
exports.createRental = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { carId, startDate, endDate, pickupLocation, dropoffLocation, additionalRequests } = req.body;
    
    // Check if car exists and is available
    const car = await Car.findById(carId);
    
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    if (!car.available) {
      return res.status(400).json({
        success: false,
        message: 'Car is not available for rental'
      });
    }
    
    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }
    
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.dailyRate;
    
    // Create rental
    const rental = await Rental.create({
      user: req.user.id,
      car: carId,
      startDate,
      endDate,
      totalPrice,
      pickupLocation,
      dropoffLocation,
      additionalRequests
    });
    
    // Update car availability
    car.available = false;
    await car.save();
    
    // Return response with populated rental
    const populatedRental = await Rental.findById(rental._id).populate('car');
    
    res.status(201).json({
      success: true,
      data: populatedRental
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

//
// @desc    Update rental status
// @route   PUT /api/rentals/:id
// @access  Private (Admin)
exports.updateRentalStatus = async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!['pending', 'confirmed', 'active', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      
      let rental = await Rental.findById(req.params.id);
      
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }
      
      // Update car availability if rental is cancelled or completed
      if (status === 'cancelled' || status === 'completed') {
        const car = await Car.findById(rental.car);
        if (car) {
          car.available = true;
          await car.save();
        }
      }
      
      rental = await Rental.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      ).populate('car');
      
      res.status(200).json({
        success: true,
        data: rental
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  // @desc    Update payment status
  // @route   PUT /api/rentals/:id/payment
  // @access  Private (Admin)
  exports.updatePaymentStatus = async (req, res) => {
    try {
      const { paymentStatus } = req.body;
      
      if (!['pending', 'paid', 'refunded'].includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status value'
        });
      }
      
      let rental = await Rental.findById(req.params.id);
      
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }
      
      rental = await Rental.findByIdAndUpdate(
        req.params.id,
        { paymentStatus },
        { new: true, runValidators: true }
      ).populate('car');
      
      res.status(200).json({
        success: true,
        data: rental
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  // @desc    Cancel rental (user)
  // @route   PUT /api/rentals/:id/cancel
  // @access  Private
  exports.cancelRental = async (req, res) => {
    try {
      let rental = await Rental.findById(req.params.id);
      
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }
      
      // Check if user owns this rental
      if (rental.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to cancel this rental'
        });
      }
      
      // Only allow cancellation if rental is pending or confirmed
      if (!['pending', 'confirmed'].includes(rental.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel rental with status: ${rental.status}`
        });
      }
      
      // Update car availability
      const car = await Car.findById(rental.car);
      if (car) {
        car.available = true;
        await car.save();
      }
      
      rental = await Rental.findByIdAndUpdate(
        req.params.id,
        { status: 'cancelled' },
        { new: true, runValidators: true }
      ).populate('car');
      
      res.status(200).json({
        success: true,
        data: rental
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  // @desc    Check car availability for dates
  // @route   POST /api/rentals/check-availability
  // @access  Public
  exports.checkAvailability = async (req, res) => {
    try {
      const { carId, startDate, endDate } = req.body;
      
      if (!carId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Please provide carId, startDate and endDate'
        });
      }
      
      const car = await Car.findById(carId);
      
      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car not found'
        });
      }
      
      if (!car.available) {
        return res.status(200).json({
          success: true,
          available: false,
          message: 'Car is currently not available for rental'
        });
      }
      
      // Check if car is booked for the requested dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const overlappingRentals = await Rental.find({
        car: carId,
        status: { $nin: ['cancelled', 'completed'] },
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } }
        ]
      });
      
      const isAvailable = overlappingRentals.length === 0;
      
      res.status(200).json({
        success: true,
        available: isAvailable,
        message: isAvailable ? 'Car is available for the selected dates' : 'Car is not available for the selected dates'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };