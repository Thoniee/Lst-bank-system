import express, { Request, Response } from 'express';
import Account from '../models/Account';
import { encrypt, decrypt } from '../utils/encryption';

const router = express.Router();

async function generateUniqueCardNumber(): Promise<string> {
    let cardNumber: string = '';
    let exists = true;
  
    while (exists) {
      cardNumber = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
      exists = !!( await Account.exists({ cardNumber }));
    }
  
    return cardNumber;
  }
  
  function generateCVV(): string {
    return Math.floor(100 + Math.random() * 900).toString(); // 3-digit number
  }
  
  function generateExpiry(): string {
    const now = new Date();
    const expiryDate = new Date(now.setFullYear(now.getFullYear() + 3));
    const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
    const year = String(expiryDate.getFullYear()).slice(-2);
    return `${month}/${year}`;
  }
  
// Create a new account
async function generateUniqueAccountNumber(): Promise<string> {
    let accountNumber: string = '';
    let exists = true;

  while (exists) {
    accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    exists = !!(await Account.exists({ accountNumber }));
  }

  return accountNumber;
}

router.post('/create-account', async (req: Request, res: Response): Promise<any> => {
    const { firstName, surname, email, phoneNumber, dateOfBirth } = req.body;
  
    if (!firstName || !surname || !email || !phoneNumber || !dateOfBirth) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const accountNumber = await generateUniqueAccountNumber();
      const cardNumber = await generateUniqueCardNumber();
      const cvv = generateCVV();
      const expiry = generateExpiry();

    // Encrypt sensitive fields
    const encryptedPhone = encrypt(phoneNumber);
    const encryptedDOB = encrypt(dateOfBirth);
    const encryptedCard = encrypt(cardNumber);
    const encryptedCVV = encrypt(cvv);
    const encryptedExpiry = encrypt(expiry);

  
      const account = await Account.create({
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/accounts', async (req: Request, res: Response) => {
    try {
      const accounts = await Account.find();
  
      const result = accounts.map(acc => {
        const decrypted = {
          phoneNumber: decrypt(acc.phoneNumber),
          dateOfBirth: decrypt(acc.dateOfBirth.toString()),
          cardNumber: decrypt(acc.cardNumber ?? ''),
          cvv: decrypt(acc.cvv ?? ''),
          expiry: decrypt(acc.expiry ?? ''),
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch accounts' });
    }
  });

  router.post('/decrypt', (req: Request, res: Response) => {
    const fields = ['phoneNumber', 'dateOfBirth', 'cardNumber', 'cvv', 'expiry'];
    const result: Record<string, string> = {};
  
    try {
      for (const field of fields) {
        const value = req.body[field];
        if (value) {
          result[field] = decrypt(value);
        }
      }
  
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Invalid encrypted input' });
    }
  });
  
  
  
  export default router;