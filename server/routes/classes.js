
// routes/classes.js - Class Management Routes

const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require('../models/User');

// POST /api/classes - Create new class

router.post('/', async (req, res) => {
  try {
    console.log('📥 Create class request:', req.body);

    const {
      teacherId,
      className,
      description,
      skill,
      schedule,
      studentLevel,
      maxStudents,
      minStudents,
      ageGroup,
      pricing,
      location,
      requirements,
      materials,
      tags
    } = req.body;

    // Validate teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    if (teacher.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create classes'
      });
    }

    // Create class
    const newClass = await Class.create({
      teacher: teacherId,
      className,
      description,
      skill,
      schedule,
      studentLevel,
      maxStudents,
      minStudents: minStudents || 1,
      ageGroup,
      pricing,
      location,
      requirements,
      materials,
      tags,
      status: 'draft' // Start as draft
    });

    console.log('✅ Class created:', newClass._id);

    res.status(201).json({
      success: true,
      message: 'Class created successfully!',
      class: newClass
    });

  } catch (error) {
    console.error('❌ Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating class',
      error: error.message
    });
  }
});


// GET /api/classes - Get all classes (with filters)

router.get('/', async (req, res) => {
  try {
    const {
      skill,
      studentLevel,
      minPrice,
      maxPrice,
      status,
      teacherId
    } = req.query;

    // Build filter
    const filter = {};

    if (skill) filter.skill = skill;
    if (studentLevel) filter.studentLevel = studentLevel;
    if (status) filter.status = status;
    if (teacherId) filter.teacher = teacherId;

    if (minPrice || maxPrice) {
      filter['pricing.amount'] = {};
      if (minPrice) filter['pricing.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['pricing.amount'].$lte = parseFloat(maxPrice);
    }

    const classes = await Class.find(filter)
      .populate('teacher', 'name email phone location profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: classes.length,
      classes
    });

  } catch (error) {
    console.error('❌ Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// GET /api/classes/:id - Get single class

router.get('/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('teacher', 'name email phone location profilePicture')
      .populate('enrolledStudents.student', 'name email phone');

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Increment view count
    classData.stats.totalViews += 1;
    await classData.save();

    res.json({
      success: true,
      class: classData
    });

  } catch (error) {
    console.error('❌ Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// PUT /api/classes/:id - Update class

router.put('/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'teacher' && key !== '_id') {
        classData[key] = req.body[key];
      }
    });

    await classData.save();

    res.json({
      success: true,
      message: 'Class updated successfully',
      class: classData
    });

  } catch (error) {
    console.error('❌ Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// PATCH /api/classes/:id/publish - Publish class

router.patch('/:id/publish', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    classData.status = 'published';
    await classData.save();

    res.json({
      success: true,
      message: 'Class published successfully!',
      class: classData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// DELETE /api/classes/:id - Delete class

router.delete('/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if class has enrollments
    if (classData.currentEnrollment > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class with enrolled students'
      });
    }

    await Class.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;