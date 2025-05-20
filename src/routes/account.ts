import express, { Request, Response } from 'express';
import Account from '../models/Account';

const router = express.Router();

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
  
      const account = await Account.create({
        firstName,
        surname,
        email,
        phoneNumber,
        dateOfBirth,
        accountNumber,
      });
  
      res.status(201).json({ message: 'Account created', account });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  export default router;