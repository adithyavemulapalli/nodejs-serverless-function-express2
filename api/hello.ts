import { VercelRequest, VercelResponse } from '@vercel/node';
import kv from '@vercel/kv';

const QUEUE_KEY = 'output_queue';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'POST') {
    const { element } = request.body;
    await enqueue(element);
    response.status(200).json({ message: 'Element added to the queue' });
  } else if (request.method === 'GET') {
    const nextElement = await dequeue();
    if (nextElement) {
      response.status(200).json({ element: nextElement });
    } else {
      response.status(404).json({ message: 'Queue is empty' });
    }
  } else {
    response.status(405).json({ message: 'Method not allowed' });
  }
}

async function enqueue(element: any) {
  await kv.rpush(QUEUE_KEY, JSON.stringify(element));
}

async function dequeue() {
  const element = await kv.lpop(QUEUE_KEY);
  return element ? JSON.parse(element) : null;
}