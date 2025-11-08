const mongoose = require('mongoose');

const thesisSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters'],
    },
    abstract: {
      type: String,
      required: [true, 'Abstract is required'],
      trim: true,
      maxlength: [5000, 'Abstract cannot exceed 5000 characters'],
    },
    embeddings: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Embeddings must be a non-empty array',
      },
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 3 && v.length <= 5;
        },
        message: 'Must have between 3 and 5 tags',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
thesisSchema.index({ tags: 1 });
thesisSchema.index({ title: 'text', abstract: 'text' });
thesisSchema.index({ createdAt: -1 });

// Virtual for formatted date
thesisSchema.virtual('formattedDate').get(function () {
  return this.createdAt.toLocaleDateString();
});

// Method to get thesis without embeddings (for cleaner responses)
thesisSchema.methods.toCleanJSON = function () {
  const obj = this.toObject();
  obj.embeddingDimensions = obj.embeddings.length;
  delete obj.embeddings; // Remove large embedding array from response
  return obj;
};

const Thesis = mongoose.model('Thesis', thesisSchema);

module.exports = Thesis;

