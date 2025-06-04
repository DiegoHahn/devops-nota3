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

test.describe.serial('Ultra-Simplified Author API Endpoint Checks', () => {
  test('1. Should create a new author (POST /authors)', async ({ request }) => {
    const authorData = {
      data: {
        name: `Test Author ${Date.now()}`,
      }
    };

    const response = await request.post(`${API_BASE_URL}/authors`, {
      data: authorData,
      headers: getAuthHeaders(),
    });

    if (!response.ok() && response.status() !== 201) {
      console.error('POST /authors failed. Status:', response.status(), 'Body:', await response.text());
    }
    expect(response.status(), `POST /authors request failed with status ${response.status()}`).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.data && responseBody.data.id, 'Created author should have an ID in the response').toBeTruthy();
    console.log('POST /authors successful. Created author ID:', responseBody.data.id);
  });

  test('2. Should retrieve all authors (GET /authors)', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/authors`, { headers: getAuthHeaders() });

    if (!response.ok()) {
      console.error('GET /authors failed. Status:', response.status(), 'Body:', await response.text());
    }
    expect(response.ok(), `GET /authors request failed with status ${response.status()}`).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.data, 'GET /authors response should have a data field').toBeDefined();
    expect(Array.isArray(responseBody.data), 'GET /authors data field should be an array').toBeTruthy();
    console.log('GET /authors successful. Number of authors retrieved:', responseBody.data.length);
  });
}); 