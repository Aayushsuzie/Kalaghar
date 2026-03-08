
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Class title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Simple teacher reference for now (could be ObjectId to User later)
    teacherName: {
      type: String,
      required: [true, 'Teacher name is required'],
      trim: true,
    },
    categoryId: {
      type: String,
      required: [true, 'Category id is required'],
      trim: true,
    },
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    skillId: {
      type: String,
      required: [true, 'Skill id is required'],
      trim: true,
    },
    skillName: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Class', classSchema);


