import {
  extractValidEntries,
  buildInsertColumns,
  buildPlaceholders,
  buildUpdateClauses,
  TableEntries,
} from "../../../src/utils/repo-helper";

describe("Repositories helpers:", () => {
  const allowedColumns = new Set(["email", "name", "picture_url"]);
  const mockEntries: TableEntries = [
    ["email", "test@gmail.com"],
    ["name", "test name"],
    ["picture_url", "https://image-test.png"],
  ];

  type UserTest = {
    email: string;
    name: string;
    picture_url?: string | undefined;
  };

  it("Should return allowed keys in a 2d array with their values", () => {
    const result = extractValidEntries<UserTest>(
      {
        email: "test@gmail.com",
        name: "test name",
        picture_url: "https://image-test.png",
      },
      allowedColumns
    );
    expect(result).toStrictEqual(mockEntries);
  });

  it("Should build correct SQL columns string for insert", () => {
    const result = buildInsertColumns(mockEntries);
    expect(result).toBe('"email", "name", "picture_url"');
  });

  it("Should build correct SQL safe parameters", () => {
    const result = buildPlaceholders(mockEntries);
    expect(result).toBe("$1, $2, $3");
  });

  it("Should build correct SQL update clauses", () => {
    const result = buildUpdateClauses(mockEntries);
    expect(result).toBe('"email" = $1, "name" = $2, "picture_url" = $3');
  });
});
