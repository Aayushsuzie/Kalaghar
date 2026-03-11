// ========================================
// models/Class.js - Class Model
// ========================================
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  
  // ========================================
  // TEACHER INFORMATION
  // ========================================
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },

  // ========================================
  // CLASS DETAILS
  // ========================================
  className: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    minlength: [5, 'Class name must be at least 5 characters'],
    maxlength: [100, 'Class name cannot exceed 100 characters']
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  skill: {
    type: String,
    required: [true, 'Skill/Subject is required'],
    enum: [
      'Guitar', 'Piano', 'Violin', 'Drums', 'Vocal',
      
      
      'Painting', 'Drawing', 'Dance', 'Yoga',
      'Cooking', 'Photography', 
    ]
  },

  // ========================================
  // SCHEDULE
  // ========================================
  schedule: {
    // Single date for one-time class OR start date for recurring
    date: {
      type: Date,
      required: [true, 'Class date is required']
    },

    // For recurring classes
    isRecurring: {
      type: Boolean,
      default: false
    },

    // If recurring: which days?
    recurringDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],

    // End date for recurring classes
    endDate: {
      type: Date
    },

    // Time
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
    },

    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
    },

    // Duration in minutes (auto-calculated)
    durationMinutes: {
      type: Number,
      required: true
    }
  },

  // ========================================
  // STUDENT REQUIREMENTS
  // ========================================
  studentLevel: {
    type: String,
    required: [true, 'Student level is required'],
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels']
  },

  // Minimum number of students
  minStudents: {
    type: Number,
    default: 1,
    min: [1, 'Minimum students must be at least 1']
  },

  // Maximum number of students
  maxStudents: {
    type: Number,
    required: [true, 'Maximum students is required'],
    min: [1, 'Maximum students must be at least 1'],
    max: [50, 'Maximum students cannot exceed 50']
  },

  // Age group
  ageGroup: [{
    type: String,
    enum: ['child', 'teen', 'young-adult', 'adult', 'senior']
  }],

  // ========================================
  // PRICING
  // ========================================
  pricing: {
    amount: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    currency: {
      type: String,
      default: 'NPR'
    },
    priceType: {
      type: String,
      enum: ['per-class', 'per-hour', 'per-student'],
      default: 'per-class'
    }
  },

  // ========================================
  // LOCATION
  // ========================================
  location: {
    type: {
      type: String,
      enum: ['teacher-location', 'student-location', 'online', 'custom'],
      required: true
    },

    // If custom location
    address: {
      type: String,
      trim: true
    },

    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // ========================================
  // ENROLLMENT
  // ========================================
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    }
  }],

  // Current enrollment count
  currentEnrollment: {
    type: Number,
    default: 0
  },

  // ========================================
  // CLASS STATUS
  // ========================================
  status: {
    type: String,
    enum: ['draft', 'published', 'full', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },

  // ========================================
  // ADDITIONAL INFO
  // ========================================
  requirements: {
    type: String,
    maxlength: [500, 'Requirements cannot exceed 500 characters']
  },

  materials: [{
    type: String,
    trim: true
  }],

  tags: [{
    type: String,
    trim: true
  }],

  // ========================================
  // IMAGES
  // ========================================
  images: [{
    type: String
  }],

  thumbnailImage: {
    type: String,
    default: 'default-class-thumbnail.png'
  },

  // ========================================
  // STATS
  // ========================================
  stats: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalBookings: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  }

}, {
  timestamps: true
});

// ========================================
// INDEXES
// ========================================
classSchema.index({ teacher: 1 });
classSchema.index({ skill: 1 });
classSchema.index({ status: 1 });
classSchema.index({ 'schedule.date': 1 });
classSchema.index({ studentLevel: 1 });
classSchema.index({ 'pricing.amount': 1 });

// ========================================
// VIRTUAL: Is class full?
// ========================================
classSchema.virtual('isFull').get(function() {
  return this.currentEnrollment >= this.maxStudents;
});

// ========================================
// VIRTUAL: Spots available
// ========================================
classSchema.virtual('spotsAvailable').get(function() {
  return this.maxStudents - this.currentEnrollment;
});

// ========================================
// METHOD: Check if class can accept enrollment
// ========================================
classSchema.methods.canEnroll = function() {
  return this.status === 'published' && 
         this.currentEnrollment < this.maxStudents &&
         new Date(this.schedule.date) > new Date();
};

// ========================================
// PRE-SAVE: Auto-update status based on enrollment
// ========================================
classSchema.pre('save', function(next) {
  // Update status to 'full' if max students reached
  if (this.currentEnrollment >= this.maxStudents && this.status === 'published') {
    this.status = 'full';
  }
  
  // Calculate duration from start and end time
  if (this.schedule.startTime && this.schedule.endTime) {
    const start = this.schedule.startTime.split(':');
    const end = this.schedule.endTime.split(':');
    
    const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
    
    this.schedule.durationMinutes = endMinutes - startMinutes;
  }

  next();
});

// ========================================
// EXPORT
// ========================================
module.exports = mongoose.model('Class', classSchema);