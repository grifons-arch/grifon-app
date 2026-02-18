import { describe, expect, it } from "vitest";
import { buildCategoryMenuTree } from "../src/services/categoryService";
import { categoryMenuQuerySchema } from "../src/routes/schemas";

describe("buildCategoryMenuTree", () => {
  const items = [
    { id: 1, parentId: null, name: "Root", position: 0, active: 1, slug: "root" },
    { id: 2, parentId: 1, name: "Home", position: 0, active: 1, slug: "home" },
    { id: 10, parentId: 2, name: "Γυναικεία", position: 2, active: 1, slug: "women" },
    { id: 11, parentId: 2, name: "Ανδρικά", position: 1, active: 1, slug: "men" },
    { id: 12, parentId: 10, name: "Τσάντες", position: 1, active: 1, slug: "bags" },
    { id: 13, parentId: 12, name: "Δερμάτινες", position: 1, active: 1, slug: "leather" }
  ];

  it("builds category menu under selected root and sorts children by position", () => {
    const tree = buildCategoryMenuTree(items, { rootCategoryId: 2, maxDepth: 3 });

    expect(tree.map((node) => node.id)).toEqual([11, 10]);
    expect(tree[1]?.children.map((node) => node.id)).toEqual([12]);
  });

  it("trims tree to max depth", () => {
    const tree = buildCategoryMenuTree(items, { rootCategoryId: 2, maxDepth: 2 });

    expect(tree[1]?.children[0]?.children).toEqual([]);
  });
});

describe("categoryMenuQuerySchema", () => {
  it("uses defaults for menu query", () => {
    const parsed = categoryMenuQuerySchema.parse({});

    expect(parsed.rootCategoryId).toBe(2);
    expect(parsed.maxDepth).toBe(3);
  });

  it("rejects invalid maxDepth", () => {
    const parsed = categoryMenuQuerySchema.safeParse({ maxDepth: 0 });
    expect(parsed.success).toBe(false);
  });
});
