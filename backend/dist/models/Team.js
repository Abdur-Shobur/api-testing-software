"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Team = void 0;
const mongoose_1 = require("mongoose");
const TeamSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    ownerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
TeamSchema.index({ ownerId: 1 });
TeamSchema.virtual('members', {
    ref: 'TeamMember',
    localField: '_id',
    foreignField: 'teamId',
});
exports.Team = mongoose_1.models.Team || (0, mongoose_1.model)('Team', TeamSchema);
//# sourceMappingURL=Team.js.map