import { expect, test } from "@playwright/test";

test("the Fit Lab recommends a size and carries it to the product page", async ({ page }) => {
  await page.goto("/fit-lab/");

  await page.getByLabel(/pick something you already own/i).selectOption("boxy-osfa");
  await page.getByRole("button", { name: /extra boxy/i }).click();
  await page.getByRole("button", { name: /save my size/i }).click();

  await expect(page.getByText(/we preselect it on every product page/i)).toBeVisible();

  await page.goto("/drop/bushido-tee/");
  await expect(page.getByText(/fit lab says/i)).toBeVisible();
});

test("measurements can be entered in inches", async ({ page }) => {
  await page.goto("/fit-lab/");
  await page.getByRole("button", { name: "cm", exact: true }).click();
  await expect(page.getByRole("button", { name: "inches" })).toBeVisible();
});

test("the command console searches and navigates", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /open search and command console/i }).click();

  const console_ = page.getByRole("dialog", { name: /command console/i });
  await expect(console_).toBeVisible();

  await console_.getByRole("combobox").fill("blue flame");
  await console_.getByRole("option").first().click();

  await expect(page).toHaveURL(/blue-flame-tee/);
});

test("escape closes an overlay and returns focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /open loadout/i }).click();
  await expect(page.getByRole("dialog", { name: /your loadout/i })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /your loadout/i })).toBeHidden();
});

test("the hero cut can be driven from the keyboard", async ({ page }) => {
  await page.goto("/");
  const slider = page.getByRole("slider", { name: /reveal the back print/i });
  const before = await slider.getAttribute("aria-valuenow");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(slider).not.toHaveAttribute("aria-valuenow", before ?? "");
});
