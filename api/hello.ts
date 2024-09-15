import { VercelRequest, VercelResponse } from '@vercel/node';

interface HeartRateData {
  heartRate: number;
  timestamp: string;
}

// Use a global variable to store the queue
let queue: HeartRateData[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS method for preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const { heartRate, timestamp } = req.body;
      
      if (typeof heartRate !== 'number' || typeof timestamp !== 'string') {
        return res.status(400).json({ error: 'Heart rate must be a number and timestamp must be a string' });
      }

      // Add the new heart rate data to the queue
      queue.push({ heartRate, timestamp });
      return res.status(200).json({ message: 'Heart rate data added to queue', queueLength: queue.length });
    } 
    else if (req.method === 'GET') {
      if (queue.length > 0) {
        // Remove and return the first item from the queue
        const item = queue.shift();
        return res.status(200).json({ data: item, queueLength: queue.length });
      } else {
        return res.status(404).json({ message: 'Queue is empty' });
      }
    } 
    else {
      res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}