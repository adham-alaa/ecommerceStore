import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    }
}, { timestamps: true });

// Create slug from name before validation
categorySchema.pre("validate", function (next) {
    if (this.isModified("name") || !this.slug) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
    }
    next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
