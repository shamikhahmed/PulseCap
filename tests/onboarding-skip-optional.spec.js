// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Onboarding — skip optional fields', () => {
  test('leaves optional size fields blank and still reaches Today', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof window.__pcOnboardingState === 'function');

    const reachedToday = await page.evaluate(() => {
      // Required for step 1 validation: name.
      // Required for step 3 validation: educational disclaimer ack.
      // Optional: age/height/weight/units can be omitted entirely.
      window.__pcOnboardingState({
        step: 1,
        intro: 0,
        data: {
          name: 'Sam',
          goal: 'hypertrophy',
          exp: 'beginner',
          equipmentKit: 'full_gym',
          daysPerWeek: 4,
          gender: 'unspecified',
          disclaimerAck: true,
          // Intentionally omit: age, units, height, weight
        }
      });

      window.go('onboarding');

      // Step 1 -> Step 2
      window.obContinue();
      // Step 2 -> Step 3
      window.obContinue();
      // Step 3 -> Step 4
      window.obContinue();
      // Step 4 -> finishOnboarding() -> dashboard
      window.obContinue();

      return {
        screen: typeof window.currentScreenId === 'function' ? window.currentScreenId() : null,
        hasToday: !!document.querySelector('.dash-session')
      };
    });

    expect(reachedToday.hasToday).toBeTruthy();
  });
});

