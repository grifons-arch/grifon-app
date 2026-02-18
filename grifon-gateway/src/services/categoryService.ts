import { PrestaShopClient } from "../clients/PrestaShopClient";
import { extractResourceList } from "./prestashopParser";
import { getLocalizedValue, toNumber } from "../utils/prestashopFields";
import { toLimitParam } from "../utils/pagination";

export interface CategoryItem {
  id: number;
  parentId: number | null;
  name: string | null;
  position: number | null;
  active: number | null;
  slug: string | null;
}

export interface CategoryTreeNode extends CategoryItem {
  children: CategoryTreeNode[];
}

export interface CategoryMenuOptions {
  rootCategoryId?: number;
  maxDepth?: number;
}

export const listCategories = async (
  client: PrestaShopClient,
  page: number,
  pageSize: number,
  lang?: number
): Promise<{ items: CategoryItem[]; tree: CategoryTreeNode[] }> => {
  const data = await client.get("categories", {
    "filter[active]": 1,
    sort: "[position_ASC]",
    limit: toLimitParam(page, pageSize)
  });

  const categories = extractResourceList<any>("categories", data);
  const items: CategoryItem[] = categories.map((category) => ({
    id: Number(category.id),
    parentId: toNumber(category.id_parent),
    name: getLocalizedValue(category.name, lang),
    position: toNumber(category.position),
    active: toNumber(category.active),
    slug: getLocalizedValue(category.link_rewrite, lang)
  }));

  const nodeMap = new Map<number, CategoryTreeNode>();
  items.forEach((item) => {
    nodeMap.set(item.id, { ...item, children: [] });
  });

  const tree: CategoryTreeNode[] = [];
  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)?.children.push(node);
    } else {
      tree.push(node);
    }
  });

  return { items, tree };
};

const sortTreeNodes = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
  nodes.sort((left, right) => {
    const leftPosition = left.position ?? Number.MAX_SAFE_INTEGER;
    const rightPosition = right.position ?? Number.MAX_SAFE_INTEGER;
    if (leftPosition !== rightPosition) {
      return leftPosition - rightPosition;
    }

    const leftName = left.name ?? "";
    const rightName = right.name ?? "";
    return leftName.localeCompare(rightName, "el");
  });

  nodes.forEach((node) => {
    sortTreeNodes(node.children);
  });

  return nodes;
};

const trimTreeDepth = (nodes: CategoryTreeNode[], maxDepth: number, currentDepth = 1): CategoryTreeNode[] =>
  nodes.map((node) => {
    if (currentDepth >= maxDepth) {
      return { ...node, children: [] };
    }
    return {
      ...node,
      children: trimTreeDepth(node.children, maxDepth, currentDepth + 1)
    };
  });

export const buildCategoryMenuTree = (
  items: CategoryItem[],
  { rootCategoryId = 2, maxDepth = 3 }: CategoryMenuOptions = {}
): CategoryTreeNode[] => {
  const nodeMap = new Map<number, CategoryTreeNode>();
  items
    .filter((item) => item.id > 0 && Boolean(item.name))
    .forEach((item) => {
      nodeMap.set(item.id, { ...item, children: [] });
    });

  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)?.children.push(node);
    }
  });

  const rootNode = nodeMap.get(rootCategoryId);
  const menuRoots = rootNode ? rootNode.children : Array.from(nodeMap.values()).filter((node) => !node.parentId);
  const sorted = sortTreeNodes(menuRoots);
  return trimTreeDepth(sorted, Math.max(1, maxDepth));
};

export const getCategoryMenu = async (
  client: PrestaShopClient,
  lang?: number,
  options: CategoryMenuOptions = {}
): Promise<CategoryTreeNode[]> => {
  const data = await client.get("categories", {
    "filter[active]": 1,
    sort: "[id_parent_ASC,position_ASC]",
    limit: "0,500"
  });

  const categories = extractResourceList<any>("categories", data);
  const items: CategoryItem[] = categories.map((category) => ({
    id: Number(category.id),
    parentId: toNumber(category.id_parent),
    name: getLocalizedValue(category.name, lang),
    position: toNumber(category.position),
    active: toNumber(category.active),
    slug: getLocalizedValue(category.link_rewrite, lang)
  }));

  return buildCategoryMenuTree(items, options);
};
