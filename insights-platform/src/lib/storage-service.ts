import { ReportConfig } from '@/types';

// Simple in-memory storage for demo purposes
// In production, this would use a database like SQLite, Postgres, etc.
class StorageService {
  private configs: Map<string, ReportConfig> = new Map();

  saveConfig(config: ReportConfig): void {
    this.configs.set(config.id, config);
  }

  getConfig(id: string): ReportConfig | undefined {
    return this.configs.get(id);
  }

  getAllConfigs(): ReportConfig[] {
    return Array.from(this.configs.values());
  }

  updateConfig(id: string, updates: Partial<ReportConfig>): boolean {
    const existing = this.configs.get(id);
    if (!existing) return false;
    
    const updated = { ...existing, ...updates };
    this.configs.set(id, updated);
    return true;
  }

  deleteConfig(id: string): boolean {
    return this.configs.delete(id);
  }

  getActiveConfigs(): ReportConfig[] {
    return Array.from(this.configs.values()).filter(config => config.isActive);
  }
}

export const storageService = new StorageService();
