"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch all cities
export async function getCities() {
  try {
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        name: true,
        county: true
      },
      orderBy: [
        { county: 'asc' },
        { name: 'asc' }
      ]
    });

    return {
      success: true,
      data: cities
    };
  } catch (error) {
    console.error('Error fetching cities:', error);
    return {
      success: false,
      message: 'Failed to fetch cities'
    };
  }
}