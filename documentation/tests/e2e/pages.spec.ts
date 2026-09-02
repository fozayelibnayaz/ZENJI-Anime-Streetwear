import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/drop/", "/lookbook/", "/origin/", "/fit-lab/", "/drop-day/", "/support/"];

test.describe("structure and accessibility basics", () => {
  for (const route of ROUTES) {
    test(`${route} has one h1, a skip link and no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));

      await page.goto(route);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("link", { name: /skip to content/i })).toHaveCount(1);
      await expect(page.locator("main")).toBeVisible();

      // Every image must carry an alt attribute (decorative ones use alt="").
      const missingAlt = await page.locator("img:not([alt])").count();
      expect(missingAlt).toBe(0);

      expect(errors).toEqual([]);
    });
  }

  test("an unknown URL renders the in-world 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist/");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/was cut/i);
  });

  test("the mobile menu opens and navigates", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile navigation only exists below the lg breakpoint");

    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "Fit Lab" }).click();
    await expect(page).toHaveURL(/fit-lab/);
  });

  test("the sticky buy bar appears once the panel scrolls away", async ({ page, isMobile }) => {
    test.skip(!isMobile, "The buy bar is mobile only");

    await page.goto("/drop/bushido-tee/");
    await page.mouse.wheel(0, 1400);
    await expect(page.getByRole("button", { name: /pick size/i })).toBeVisible();
  });

  test("contact form validation catches an empty submission", async ({ page }) => {
    await page.goto("/support/");
    await page.getByRole("button", { name: /send message/i }).click();
    await expect(page.getByText(/tell us what to call you/i)).toBeVisible();
  });
});
