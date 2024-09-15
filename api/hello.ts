import { VercelRequest, VercelResponse } from '@vercel/node';

// Define the structure of our heart rate data
interface HeartRateData {
  heartRate: number;
  timestamp: string;
}

// Initialize an empty array to serve as our queue
let heartRateQueue: HeartRateData[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      const { heartRate, timestamp } = req.body;
      
      if (typeof heartRate !== 'number' || typeof timestamp !== 'string') {
        return res.status(400).json({ error: 'Heart rate must be a number and timestamp must be a string' });
      }

      // Add the new heart rate data to the queue
      heartRateQueue.push({ heartRate, timestamp });
      return res.status(200).json({ message: 'Heart rate data added to queue' });
    } 
    else if (req.method === 'GET') {
      if (heartRateQueue.length > 0) {
        // Remove and return the first item from the queue
        const nextItem = heartRateQueue.shift();
        return res.status(200).json(nextItem);
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