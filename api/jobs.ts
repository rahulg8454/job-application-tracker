import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export default async function handler(req: any, res: any) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'Database URL not configured' });
  }

  const sql = neon(process.env.DATABASE_URL);

  // GET /api/jobs
  if (req.method === 'GET') {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const secret = process.env.JWT_SECRET || 'supersecret';
      const decoded: any = jwt.verify(token, secret);
      const jobs = await sql`
        SELECT * FROM jobs 
        WHERE user_id = ${decoded.userId}
        ORDER BY created_at DESC
      `;
      return res.status(200).json(jobs);
    } catch (error) {
      console.error('Get jobs error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // POST /api/jobs
  if (req.method === 'POST') {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const secret = process.env.JWT_SECRET || 'supersecret';
      const decoded: any = jwt.verify(token, secret);
      const { company, role, status, location, notes } = req.body;
      const result = await sql`
        INSERT INTO jobs (user_id, company, role, status, location, notes)
        VALUES (${decoded.userId}, ${company}, ${role}, ${status}, ${location || ''}, ${notes || ''})
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error('Create job error:', error);
      return res.status(500).json({ error: 'Failed to create job' });
    }
  }

  // PUT /api/jobs/:id
  if (req.method === 'PUT') {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const secret = process.env.JWT_SECRET || 'supersecret';
      const decoded: any = jwt.verify(token, secret);
      const { id } = req.query;
      const { company, role, status, location, notes } = req.body;
      const result = await sql`
        UPDATE jobs 
        SET company = COALESCE(${company}, company),
            role = COALESCE(${role}, role),
            status = COALESCE(${status}, status),
            location = COALESCE(${location}, location),
            notes = COALESCE(${notes}, notes)
        WHERE id = ${id} AND user_id = ${decoded.userId}
        RETURNING *
      `;
      if (result.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }
      return res.status(200).json(result[0]);
    } catch (error) {
      console.error('Update job error:', error);
      return res.status(500).json({ error: 'Failed to update job' });
    }
  }

  // DELETE /api/jobs/:id
  if (req.method === 'DELETE') {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const secret = process.env.JWT_SECRET || 'supersecret';
      const decoded: any = jwt.verify(token, secret);
      const { id } = req.query;
      await sql`
        DELETE FROM jobs WHERE id = ${id} AND user_id = ${decoded.userId}
      `;
      return res.status(200).json({ message: 'Job deleted' });
    } catch (error) {
      console.error('Delete job error:', error);
      return res.status(500).json({ error: 'Failed to delete job' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).json({ error: 'Method not allowed' });
} 
