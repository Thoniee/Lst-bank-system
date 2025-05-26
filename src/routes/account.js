"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Account_1 = __importDefault(require("../models/Account"));
const encryption_1 = require("../utils/encryption");
const router = express_1.default.Router();
function generateUniqueCardNumber() {
    return __awaiter(this, void 0, void 0, function* () {
        let cardNumber = '';
        let exists = true;
        while (exists) {
            cardNumber = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
            exists = !!(yield Account_1.default.exists({ cardNumber }));
        }
        return cardNumber;
    });
}
function generateCVV() {
    return Math.floor(100 + Math.random() * 900).toString(); // 3-digit number
}
function generateExpiry() {
    const now = new Date();
    const expiryDate = new Date(now.setFullYear(now.getFullYear() + 3));
    const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
    const year = String(expiryDate.getFullYear()).slice(-2);
    return `${month}/${year}`;
}
// Create a new account
function generateUniqueAccountNumber() {
    return __awaiter(this, void 0, void 0, function* () {
        let accountNumber = '';
        let exists = true;
        while (exists) {
            accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            exists = !!(yield Account_1.default.exists({ accountNumber }));
        }
        return accountNumber;
    });
}
router.post('/create-account', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, surname, email, phoneNumber, dateOfBirth } = req.body;
    if (!firstName || !surname || !email || !phoneNumber || !dateOfBirth) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const accountNumber = yield generateUniqueAccountNumber();
        const cardNumber = yield generateUniqueCardNumber();
        const cvv = generateCVV();
        const expiry = generateExpiry();
        // Encrypt sensitive fields
        const encryptedPhone = (0, encryption_1.encrypt)(phoneNumber);
        const encryptedDOB = (0, encryption_1.encrypt)(dateOfBirth);
        const encryptedCard = (0, encryption_1.encrypt)(cardNumber);
        const encryptedCVV = (0, encryption_1.encrypt)(cvv);
        const encryptedExpiry = (0, encryption_1.encrypt)(expiry);
        const account = yield Account_1.default.create({
            firstName,
            surname,
            email,
            accountNumber,
            phoneNumber: encryptedPhone,
            dateOfBirth: encryptedDOB,
            cardNumber: encryptedCard,
            cvv: encryptedCVV,
            expiry: encryptedExpiry,
        });
        // Decrypt sensitive fields for response
        const decryptedFields = {
            phoneNumber,
            dateOfBirth,
            cardNumber,
            cvv,
            expiry,
        };
        res.status(201).json({
            message: 'Account and virtual card created',
            encrypted: {
                phoneNumber: encryptedPhone,
                dateOfBirth: encryptedDOB,
                cardNumber: encryptedCard,
                cvv: encryptedCVV,
                expiry: encryptedExpiry,
            },
            decrypted: decryptedFields,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}));
router.get('/accounts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accounts = yield Account_1.default.find();
        const result = accounts.map(acc => {
            var _a, _b, _c;
            const decrypted = {
                phoneNumber: (0, encryption_1.decrypt)(acc.phoneNumber),
                dateOfBirth: (0, encryption_1.decrypt)(acc.dateOfBirth.toString()),
                cardNumber: (0, encryption_1.decrypt)((_a = acc.cardNumber) !== null && _a !== void 0 ? _a : ''),
                cvv: (0, encryption_1.decrypt)((_b = acc.cvv) !== null && _b !== void 0 ? _b : ''),
                expiry: (0, encryption_1.decrypt)((_c = acc.expiry) !== null && _c !== void 0 ? _c : ''),
            };
            return {
                accountNumber: acc.accountNumber,
                fullName: `${acc.firstName} ${acc.surname}`,
                encrypted: {
                    phoneNumber: acc.phoneNumber,
                    dateOfBirth: acc.dateOfBirth,
                    cardNumber: acc.cardNumber,
                    cvv: acc.cvv,
                    expiry: acc.expiry,
                },
                decrypted,
            };
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch accounts' });
    }
}));
router.post('/decrypt', (req, res) => {
    const fields = ['phoneNumber', 'dateOfBirth', 'cardNumber', 'cvv', 'expiry'];
    const result = {};
    try {
        for (const field of fields) {
            const value = req.body[field];
            if (value) {
                result[field] = (0, encryption_1.decrypt)(value);
            }
        }
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid encrypted input' });
    }
});
exports.default = router;
