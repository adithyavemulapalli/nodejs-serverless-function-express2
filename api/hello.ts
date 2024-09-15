import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

interface HeartRateData {
  heartRate: number;
  timestamp: string;
}

const QUEUE_KEY = 'heart-rate-queue';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      const { heartRate, timestamp } = req.body;
      
      if (typeof heartRate !== 'number' || typeof timestamp !== 'string') {
        return res.status(400).json({ error: 'Heart rate must be a number and timestamp must be a string' });
      }

      // Add the new heart rate data to the queue
      await kv.lpush(QUEUE_KEY, JSON.stringify({ heartRate, timestamp }));
      return res.status(200).json({ message: 'Heart rate data added to queue' });
    } 
    else if (req.method === 'GET') {
      // Remove and return the last item from the queue
      const item = await kv.rpop(QUEUE_KEY);
      
      if (item) {
        const data: HeartRateData = JSON.parse(item);
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ message: 'Queue is empty' });
      }
    } 
    else {
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}