import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { toHaveNoViolations } from "jest-axe";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

expect.extend(matchers);
expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});
