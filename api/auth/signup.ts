import { neon } from '@neondatabase/serverless';
import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const POSTGRES_URL = process.env.DATABASE_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-key';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = neon(POSTGRES_URL);

  try {
    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${hashedPassword})
      RETURNING id, email, created_at
    `;

    // Generate JWT token
    const token = jwt.sign({ userId: user[0].id, email: user[0].email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ user: { id: user[0].id, email: user[0].email }, token });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Failed to create account' });
  }
}
