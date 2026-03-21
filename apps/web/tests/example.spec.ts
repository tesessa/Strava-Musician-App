import { test, expect } from '@playwright/test';
// import pkg from '@strava-musician-app/shared';
// const { APP_CONFIG } = pkg;


test('example', async ({ page }) => {
 await page.goto('/');
  // await page.goto('http://localhost:5173/');
  await expect(page.getByText("Koda", { exact: true })).toBeVisible();
  // APP_CONFIG.appName
  // await page.goto('http://localhost:5173/');

});

test('register', async ({ page }) => {
  await page.goto('/');
  // await page.goto('http://localhost:5173/');
  await expect(page.getByText("Koda", { exact: true })).toBeVisible();
  // APP_CONFIG.appName
  // await page.goto('http://localhost:5173/');

});


test('login', async ({ page }) => {
  await page.goto('/');

  // await page.route('*/**/')
  // await page.goto('http://localhost:5173/');
  await expect(page.getByText("Koda", { exact: true })).toBeVisible();
  // APP_CONFIG.appName
  // await page.goto('http://localhost:5173/');

});



// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
