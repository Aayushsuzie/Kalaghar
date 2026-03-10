
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