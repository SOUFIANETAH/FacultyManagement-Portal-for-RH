import { PrismaClient } from '@prisma/client'


const prismaClientSingleton = () => {
  return new PrismaClient()
}


const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


export async function queryWithRetries<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;


      const isConnectionError = 
        error.message.includes('connection') || 
        error.message.includes('timeout') || 
        error.message.includes('Connection') ||
        error.message.includes('ECONNREFUSED') ||
        error.code === 'P1001' ||
        error.code === 'P1002';

      // If it's not a connection error or we've reached max retries, throw the error
      if (!isConnectionError || attempt > maxRetries) {
        throw error;
      }

      // Log the retry attempt
      console.warn(`Database connection error (attempt ${attempt}/${maxRetries + 1}): ${error.message}`);
      console.warn(`Retrying in ${retryDelay}ms...`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));

      // Increase delay for next retry (exponential backoff)
      retryDelay *= 2;
    }
  }

  // This should never be reached due to the throw in the catch block
  throw lastError;
}

export default prisma
