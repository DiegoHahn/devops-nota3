import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.STRAPI_BASE_URL || 'http://127.0.0.1:1337/api';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

const getAuthHeaders = () => {
  const headers: { [key: string]: string } = { 'Content-Type': 'application/json' };
  if (API_TOKEN) headers['Authorization'] = `Bearer ${API_TOKEN}`;
  return headers;
};

test.beforeAll(async () => {
  if (!API_TOKEN) {
    console.warn('STRAPI_API_TOKEN is not set. Authentication-required tests might fail.');
  }
});

test.describe.serial('Ultra-Simplified Category API Endpoint Checks', () => {
  test('1. Should create a new category (POST /categories)', async ({ request }) => {
    const categoryData = {
      data: {
        name: `Test Category ${Date.now()}`,
      }
    };

    const response = await request.post(`${API_BASE_URL}/categories`, {
      data: categoryData,
      headers: getAuthHeaders(),
    });

    if (!response.ok() && response.status() !== 201) {
      console.error('POST /categories failed. Status:', response.status(), 'Body:', await response.text());
    }
    expect(response.status(), `POST /categories request failed with status ${response.status()}`).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.data && responseBody.data.id, 'Created category should have an ID in the response').toBeTruthy();
    console.log('POST /categories successful. Created category ID:', responseBody.data.id);
  });

  test('2. Should retrieve all categories (GET /categories)', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() });

    if (!response.ok()) {
      console.error('GET /categories failed. Status:', response.status(), 'Body:', await response.text());
    }
    expect(response.ok(), `GET /categories request failed with status ${response.status()}`).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.data, 'GET /categories response should have a data field').toBeDefined();
    expect(Array.isArray(responseBody.data), 'GET /categories data field should be an array').toBeTruthy();
    console.log('GET /categories successful. Number of categories retrieved:', responseBody.data.length);
  });
}); 