import { expect, test } from "@playwright/test";

test.describe("shopping", () => {
  test("browse the drop, quick view a piece and load it into the cart", async ({ page }) => {
    await page.goto("/drop/");

    const card = page.getByRole("article").first();
    await card.scrollIntoViewIfNeeded();
    await card.getByRole("button", { name: /quick view/i }).click({ force: true });

    const dialog = page.getByRole("dialog", { name: /quick view/i });
    await expect(dialog).toBeVisible();

    // Pick the first size that is not sold out.
    const size = dialog.getByRole("radio").filter({ hasNotText: "" }).first();
    await size.click();
    await dialog.getByRole("button", { name: /add to loadout/i }).click();

    await expect(page.getByText(/added/i)).toBeVisible();

    await page.getByRole("button", { name: /open loadout/i }).click();
    const drawer = page.getByRole("dialog", { name: /your loadout/i });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/subtotal/i)).toBeVisible();
  });

  test("the loadout survives a page reload", async ({ page }) => {
    await page.goto("/drop/bushido-tee/");
    await page.getByRole("radio", { name: "L" }).click();
    await page.getByRole("button", { name: /add to loadout/i }).click();

    await page.reload();
    await expect(page.getByRole("button", { name: /open loadout, 1 item/i })).toBeVisible();
  });

  test("filters are shareable through the URL", async ({ page }) => {
    await page.goto("/drop/?category=hoodie");
    await expect(page.getByRole("status")).toContainText(/piece/);
    const names = await page.getByRole("article").allInnerTexts();
    expect(names.join(" ")).toMatch(/hoodie/i);
  });

  test("an impossible filter combination explains itself", async ({ page }) => {
    await page.goto("/drop/?category=headwear&size=2XL");
    await expect(page.getByText(/nothing in the drop matches/i)).toBeVisible();
    await page.getByRole("button", { name: /reset the filters/i }).click();
    await expect(page.getByRole("article").first()).toBeVisible();
  });
});
