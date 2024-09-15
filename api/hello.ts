import { VercelRequest, VercelResponse } from '@vercel/node';

interface HeartRateData {
  heartRate: number;
  timestamp: string;
}

// Use a global variable to store the queue
// Note: This will reset on each deployment and doesn't persist across multiple instances
let queue: HeartRateData[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}