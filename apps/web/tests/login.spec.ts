import { test, expect } from '@playwright/test';
import { RegisterRequest, AuthResponse} from "@strava-musician-app/shared";

test('register', async ({ page }) => {

    // await page.route('*/**/auth/register', async (route) => {
    //     const registerReq: RegisterRequest = { email: "newUser@email.com", username: "newUser", password: "password"}
    //     const registerRes: AuthResponse = { token: "abcdef", user: { userId: "random", email: "newUser@email.com", username: "newUser", postVisibility: "public", instruments: [], createdAt: "2024", updatedAt: ""}};
    //     // const registerRes = { user: { id: 3, name: 'Tim', email: 't@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    //     expect(route.request().method()).toBe('POST');
    //     expect(route.request().postDataJSON()).toMatchObject(registerReq);
    //     await route.fulfill({ json: registerRes });
    // });


    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Create New Account' }).click();
    await page.getByRole('textbox', { name: 'username' }).click();
    await page.getByRole('textbox', { name: 'username' }).fill('newUser');
    await page.getByRole('textbox', { name: 'username' }).press('Tab');
    await page.getByRole('textbox', { name: 'Email address' }).fill('newUser@email.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password');
    await page.getByRole('textbox', { name: 'Password', exact: true }).press('Tab');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password');
    await page.getByRole('button', { name: 'Sign Up' }).click();

})