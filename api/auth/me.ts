import { neon } from '@neondatabase/serverless';
import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const POSTGRES_URL = process.env.DATABASE_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-key';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const sql = neon(POSTGRES_URL);
    const users = await sql`
      SELECT id, email, created_at FROM users WHERE id = ${decoded.userId}
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user: { id: users[0].id, email: users[0].email, created_at: users[0].created_at } });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
