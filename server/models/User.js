
// models/User.js - Updated User Model

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


// Define User Schema

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },



  phone: {
  type: String,
  required: [true, "Phone number is required"],
  match: [/^9[78]\d{8}$/, "Please enter a valid Nepal mobile number"]
  },

  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: [true, 'Role is required']
  },

  
  // LOCATION - Updated Structure
  
  location: {
    address: {
      type: String,
      required: false,
      trim: true
    },
    city: {
      type: String,
      required: false,
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180
      }
    }
  },

  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },

  // TEACHER PROFILE FIELDS
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    default: ''
  },

  experience: {
    type: String,
    trim: true,
    maxlength: [120, 'Experience cannot exceed 120 characters'],
    default: ''
  },

  skills: [{
    type: String,
    trim: true
  }],

  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
    },
    endTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
    }
  }],

  sessionRate: {
    type: Number,
    min: [0, 'Session rate must be positive'],
    default: 0
  },

  hasCompletedProfile: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  lastLogin: {
    type: Date
  }

}, {
  timestamps: true  // Auto-creates createdAt and updatedAt
});


// INDEXES

//userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.city': 1 });
userSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });


// Hash password before saving

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


// Compare password method

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};


// Hide password when converting to JSON

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};


// Export Model

module.exports = mongoose.model('User', userSchema);