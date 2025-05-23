import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestRequest() {
    try {
        const newRequest = await prisma.requests.create({
            data: {
                title: 'Test Request',
                description: 'This is a test request',
                type: 'adduser',  // Use any valid type ("adduser", "deleteuser", "updateuser")
                userId: 1,  // Provide a valid userId if required (make sure it exists in the users table)
                status: 'pending',  // Default status
            },
        });

        console.log('New Request Created:', newRequest);
    } catch (error) {
        console.error('Error creating request:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestRequest();
