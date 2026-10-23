import { describe, expect, it } from "vitest";
import { extractError } from "./extractError";

describe("extractError", () => {
  it("returns fallback message when error is missing", () => {
    const result = extractError(null, "Fallback");
    expect(result).toEqual({ message: "Fallback", errors: [] });
  });

  it("extracts nested API message and validation errors", () => {
    const error = {
      response: {
        data: {
          message: "Validation failed",
          errors: [{ field: "email", message: "Invalid email" }]
        }
      }
    };

    const result = extractError(error, "Fallback");

    expect(result.message).toBe("Validation failed");
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe("email");
  });
});
