// ========================================
// routes/classes.js - Class / Skills Routes
// ========================================
const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// ----------------------------------------
// POST /api/classes
// Create a new class (for teachers/admin)
// ----------------------------------------
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      teacherName,
      categoryId,
      categoryName,
      skillId,
      skillName,
      level,
    } = req.body;

    if (
      !title ||
      !teacherName ||
      !categoryId ||
      !categoryName ||
      !skillId ||
      !skillName
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide title, teacherName, categoryId, categoryName, skillId, and skillName',
      });
    }

    const cls = await Class.create({
      title,
      description,
      teacherName,
      categoryId,
      categoryName,
      skillId,
      skillName,
      level,
    });

    res.status(201).json({
      success: true,
      message: 'Class created',
      class: cls,
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating class',
      error: error.message,
    });
  }
});

// -------------------------------------------------------------
// GET /api/classes/skills-summary
// Returns categories + skills with at least one class each
// Example response:
// [
//   {
//     categoryId: "wood",
//     categoryName: "Wood crafts",
//     skills: [
//       { skillId: "wood-carving", skillName: "Wood carving", count: 3 }
//     ]
//   }
// ]
// -------------------------------------------------------------
router.get('/skills-summary', async (_req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            categoryId: '$categoryId',
            categoryName: '$categoryName',
            skillId: '$skillId',
            skillName: '$skillName',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            categoryId: '$_id.categoryId',
            categoryName: '$_id.categoryName',
          },
          skills: {
            $push: {
              skillId: '$_id.skillId',
              skillName: '$_id.skillName',
              count: '$count',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id.categoryId',
          categoryName: '$_id.categoryName',
          skills: 1,
        },
      },
      {
        $sort: { categoryName: 1 },
      },
    ];

    const summary = await Class.aggregate(pipeline);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Skills summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching skills summary',
      error: error.message,
    });
  }
});

module.exports = router;


