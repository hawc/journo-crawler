import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cleanupOldEntries } from '../../src/cleanupOldEntries.js';
import { runCrawler } from '../../src/main.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (!process.env.CRON_SECRET || request.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Run start script
    console.log('Starting crawler...');
    await runCrawler();
    console.log('Crawler completed successfully');
    
    // Run cleanup script
    console.log('Starting cleanup...');
    await cleanupOldEntries();
    console.log('Cleanup completed successfully');

    return response.status(200).json({
      success: true,
      message: 'Daily cron job completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return response.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
