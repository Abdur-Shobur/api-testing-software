"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['owner', 'admin', 'member'],
        default: 'member',
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active',
    },
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.User = mongoose_1.models.User || (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=User.js.map