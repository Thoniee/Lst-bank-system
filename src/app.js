"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const account_1 = __importDefault(require("./routes/account"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', account_1.default);
mongoose_1.default.connect(process.env.MONGODB_URI || '', {}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));
exports.default = app;
