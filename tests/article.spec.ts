import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.STRAPI_BASE_URL || 'http://127.0.0.1:1337/api';
const API_TOKEN = process.env.STRAPI_API_TOKEN;

let authorId: string | number;
let categoryId: string | number;

const getAuthHeaders = () => {
  const headers: { [key: string]: string } = { 'Content-Type': 'application/json' };
  if (API_TOKEN) headers['Authorization'] = `Bearer ${API_TOKEN}`;
  return headers;
};

test.beforeAll(async ({ request }) => {
  if (!API_TOKEN) console.warn('API_TOKEN not set; POST, PUT, DELETE may fail if routes protected.');

  const authorsResponse = await request.get(`${API_BASE_URL}/authors`, { headers: getAuthHeaders() });
  expect(authorsResponse.ok(), 'Failed to fetch authors. Ensure authors exist and token has permissions.').toBeTruthy();
  const authorsBody = await authorsResponse.json();
  expect(authorsBody.data && authorsBody.data.length > 0, 'No authors found. Add at least one author.').toBeTruthy();
  authorId = authorsBody.data[0].id;

  const categoriesResponse = await request.get(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() });
  expect(categoriesResponse.ok(), 'Failed to fetch categories. Ensure categories exist and token has permissions.').toBeTruthy();
  const categoriesBody = await categoriesResponse.json();
  expect(categoriesBody.data && categoriesBody.data.length > 0, 'No categories found. Add at least one category.').toBeTruthy();
  categoryId = categoriesBody.data[0].id;
  console.log(`Fetched Author ID: ${authorId}, Category ID: ${categoryId} for tests.`);
});

test.describe.serial('Ultra-Simplified Article API Endpoint Checks', () => {
  test('1. Should create a new article (POST /articles)', async ({ request }) => {
    expect(authorId, 'Author ID must be fetched').toBeDefined();
    expect(categoryId, 'Category ID must be fetched').toBeDefined();

    const articleData = {
      data: {
        title: `Minimal Test Article ${Date.now()}`,
        description: 'Minimal content for basic API test.',
        author: authorId,
        category: categoryId,
        publishedAt: new Date().toISOString(),
      }
    };
    const response = await request.post(`${API_BASE_URL}/articles`, {
      data: articleData,
      headers: getAuthHeaders(),
    });
    if (!response.ok() && response.status() !== 201) {
        console.error('POST /articles failed. Status:', response.status(), 'Body:', await response.text());
    }
    expect(response.status(), `POST /articles request failed with status ${response.status()}`).toBe(201);
    const responseBody = await response.json();
    expect(responseBody.data && responseBody.data.id, 'Created article should have an ID in the response').toBeTruthy();
    console.log('POST /articles successful. Created article ID:', responseBody.data.id);
  });

  test('2. Should retrieve all articles (GET /articles)', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/articles`, { headers: getAuthHeaders() });
    if (!response.ok()) {
        console.error('GET /articles failed. Status:', response.status(), 'Body:', await response.text());
    }
    expect(response.ok(), `GET /articles request failed with status ${response.status()}`).toBeTruthy();
    const responseBody = await response.json();
    expect(responseBody.data, 'GET /articles response should have a data field').toBeDefined();
    expect(Array.isArray(responseBody.data), 'GET /articles data field should be an array').toBeTruthy();
    console.log('GET /articles successful. Number of articles retrieved:', responseBody.data.length);
  });
});
