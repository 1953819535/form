// ──────────────────────────────────────────────────────────────
// Mock 数据和 API 工厂
// ──────────────────────────────────────────────────────────────

export interface MockUser {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  createTime: string;
}

// 创建 Mock 用户数据
export function createMockUsers(count: number): MockUser[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `用户${i + 1}`,
    email: `user${i + 1}@example.com`,
    status: i % 3 === 0 ? "active" : "inactive",
    createTime: new Date(Date.now() - i * 86400000).toLocaleDateString(),
  }));
}

// 创建 Mock 用户 API
export function createMockUserApi(users: MockUser[]) {
  return {
    list: async (params: { page: number; pageSize: number; [key: string]: any }) => {
      await new Promise((r) => setTimeout(r, 500));
      const { page, pageSize, ...filters } = params;
      let data = users;

      // 支持姓名筛选
      if (filters.name) {
        data = data.filter((u) => u.name.includes(filters.name));
      }

      const start = (page - 1) * pageSize;
      const result = data.slice(start, start + pageSize);
      return { data: result, total: data.length };
    },
    create: async (data: Partial<MockUser>) => {
      await new Promise((r) => setTimeout(r, 300));
      users.unshift({
        id: users.length + 1,
        name: data.name ?? "",
        email: data.email ?? "",
        status: "active",
        createTime: new Date().toLocaleDateString(),
      });
    },
    update: async (id: number, data: Partial<MockUser>) => {
      await new Promise((r) => setTimeout(r, 300));
      const index = users.findIndex((u) => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...data } as MockUser;
      }
    },
    delete: async (id: number) => {
      await new Promise((r) => setTimeout(r, 300));
      const index = users.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.splice(index, 1);
      }
    },
  };
}